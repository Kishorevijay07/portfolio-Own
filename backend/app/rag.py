"""Retrieval over the knowledge base.

Load order:
  1. If data/embeddings.json exists -> use precomputed vectors (real semantic RAG).
  2. Otherwise -> chunk the markdown on the fly (keyword retrieval fallback), so
     the assistant still works before `scripts/build_index.py` has been run.

Query time:
  - Embed the question and rank chunks by cosine similarity.
  - If embedding fails for any reason, fall back to keyword overlap so /chat
    never hard-fails.
"""
import json
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np

from . import config, embed
from .chunker import load_source_chunks

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
INDEX_PATH = DATA_DIR / "embeddings.json"


class KnowledgeIndex:
    def __init__(self) -> None:
        self.chunks: List[Dict] = []
        self.matrix: Optional[np.ndarray] = None  # L2-normalized vectors
        self.source: str = "none"

    def load(self) -> None:
        self.chunks = []
        self.matrix = None
        self.source = "none"

        if INDEX_PATH.exists():
            data = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
            self.chunks = data.get("chunks", [])
            vectors = [c.get("vector") for c in self.chunks]
            if self.chunks and all(v is not None for v in vectors):
                self.matrix = self._normalize(np.asarray(vectors, dtype=np.float32))
                self.source = "embeddings.json"
                return

        # Fallback: build chunks from the source files, no vectors (keyword retrieval).
        self.chunks = load_source_chunks()
        self.source = "sources" if self.chunks else "none"

    @staticmethod
    def _normalize(matrix: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1e-9
        return matrix / norms

    def retrieve(self, query: str, k: Optional[int] = None) -> List[Dict]:
        k = k or config.TOP_K
        if not self.chunks:
            return []

        if self.matrix is not None:
            try:
                qv = embed.embed_query(query)
                qn = qv / (np.linalg.norm(qv) or 1e-9)
                scores = self.matrix @ qn
                top = np.argsort(-scores)[:k]
                return [
                    {"text": self.chunks[i]["text"], "source": self.chunks[i].get("source", "doc"),
                     "score": float(scores[i])}
                    for i in top
                ]
            except Exception:
                pass  # fall through to keyword retrieval

        return self._keyword_retrieve(query, k)

    def _keyword_retrieve(self, query: str, k: int) -> List[Dict]:
        q_tokens = {t for t in query.lower().split() if len(t) > 2}
        scored = []
        for c in self.chunks:
            tokens = set(c["text"].lower().split())
            scored.append((len(q_tokens & tokens), c))
        scored.sort(key=lambda x: -x[0])
        return [
            {"text": c["text"], "source": c.get("source", "doc"), "score": None}
            for score, c in scored[:k]
            if score > 0
        ] or [
            {"text": c["text"], "source": c.get("source", "doc"), "score": None}
            for c in self.chunks[:k]
        ]


index = KnowledgeIndex()
