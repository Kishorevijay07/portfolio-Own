"""Runtime configuration, read from environment (with a local .env for dev)."""
import os

from dotenv import load_dotenv

load_dotenv()


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


# ── OpenRouter (chat / generation) ──────────────────────────────────────────
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")

# ── CORS ────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    o.strip().rstrip("/")
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]

# ── RAG / embeddings ────────────────────────────────────────────────────────
EMBED_MODEL = os.getenv("EMBED_MODEL", "BAAI/bge-small-en-v1.5")
TOP_K = _int("TOP_K", 4)

# ── OpenRouter attribution headers (optional) ───────────────────────────────
SITE_URL = os.getenv("SITE_URL", "").strip()
SITE_NAME = os.getenv("SITE_NAME", "Kishore Portfolio Assistant").strip()

# ── Safety ──────────────────────────────────────────────────────────────────
MAX_QUESTION_CHARS = _int("MAX_QUESTION_CHARS", 500)
