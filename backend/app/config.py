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
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemma-4-31b-it:free")
# Fallback routing: OpenRouter tries these in order (max 3). Great for flaky
# free models — if one has no provider/limit, it falls through to the next.
_models_env = os.getenv("OPENROUTER_MODELS", "").strip()
if _models_env:
    OPENROUTER_MODELS = [m.strip() for m in _models_env.split(",") if m.strip()][:3]
else:
    OPENROUTER_MODELS = [
        "google/gemma-4-31b-it:free",
        "qwen/qwen3.8-27b:free",
        "z-ai/glm-5.2:free",
    ]

# ── CORS ────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    o.strip().rstrip("/")
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]

# ── RAG / embeddings ────────────────────────────────────────────────────────
EMBED_MODEL = os.getenv("EMBED_MODEL", "BAAI/bge-small-en-v1.5")
TOP_K = _int("TOP_K", 6)

# ── OpenRouter attribution headers (optional) ───────────────────────────────
SITE_URL = os.getenv("SITE_URL", "").strip()
SITE_NAME = os.getenv("SITE_NAME", "Kishore Portfolio Assistant").strip()

# ── Safety ──────────────────────────────────────────────────────────────────
MAX_QUESTION_CHARS = _int("MAX_QUESTION_CHARS", 500)
MAX_CONTACT_CHARS = _int("MAX_CONTACT_CHARS", 3000)

# ── GitHub stats (cached) ───────────────────────────────────────────────────
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME", "kishorevijay07").strip()
GITHUB_CACHE_TTL = _int("GITHUB_CACHE_TTL", 3600)  # seconds

# ── Contact email ───────────────────────────────────────────────────────────
# Preferred: Resend (https://resend.com) — set RESEND_API_KEY + CONTACT_TO_EMAIL.
# Fallback: SMTP — set SMTP_HOST/PORT/USER/PASS + CONTACT_TO_EMAIL.
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
CONTACT_TO_EMAIL = os.getenv("CONTACT_TO_EMAIL", "").strip()
CONTACT_FROM_EMAIL = os.getenv("CONTACT_FROM_EMAIL", "onboarding@resend.dev").strip()

SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = _int("SMTP_PORT", 587)
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASS = os.getenv("SMTP_PASS", "").strip()
