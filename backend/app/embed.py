"""Local, lightweight text embeddings via fastembed (ONNX, no PyTorch).

The model is lazy-loaded on first use so a cold start pays the load cost only
when the first question arrives (or during the build step, if pre-warmed).
"""
from functools import lru_cache
from typing import List

import numpy as np

from . import config


@lru_cache(maxsize=1)
def get_model():
    # Imported lazily so the module (and /health) work even if fastembed is
    # slow to import or the model is still downloading.
    from fastembed import TextEmbedding

    return TextEmbedding(model_name=config.EMBED_MODEL)


def embed_texts(texts: List[str]) -> np.ndarray:
    model = get_model()
    vectors = list(model.embed(texts))
    return np.asarray(vectors, dtype=np.float32)


def embed_query(text: str) -> np.ndarray:
    return embed_texts([text])[0]
