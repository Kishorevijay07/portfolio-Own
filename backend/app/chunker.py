"""Turn the knowledge-base markdown files into retrieval chunks.

Shared by both the offline index builder (scripts/build_index.py) and the
runtime loader (rag.py), so chunking stays identical whether or not a
precomputed embeddings.json exists.
"""
import re
from pathlib import Path
from typing import Dict, List

# Knowledge lives in backend/data/knowledge/*.md
KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent / "data" / "knowledge"


def chunk_text(text: str, source: str, max_words: int = 180, overlap: int = 40) -> List[Dict]:
    """Split text into paragraph-aware, word-windowed chunks with light overlap."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: List[str] = []
    buf: List[str] = []

    for para in paragraphs:
        words = para.split()
        if buf and len(buf) + len(words) > max_words:
            chunks.append(" ".join(buf))
            buf = buf[-overlap:] if overlap else []
        buf.extend(words)

    if buf:
        chunks.append(" ".join(buf))

    return [{"text": c, "source": source} for c in chunks if c.strip()]


def load_markdown_chunks(knowledge_dir: Path = KNOWLEDGE_DIR) -> List[Dict]:
    """Read every *.md in the knowledge dir and return chunk dicts (no vectors)."""
    all_chunks: List[Dict] = []
    if not knowledge_dir.exists():
        return all_chunks
    for md in sorted(knowledge_dir.glob("*.md")):
        text = md.read_text(encoding="utf-8")
        all_chunks.extend(chunk_text(text, md.stem))
    return all_chunks
