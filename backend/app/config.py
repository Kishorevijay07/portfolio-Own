"""Runtime configuration, read from environment (with a local .env for dev)."""
import os

from dotenv import load_dotenv

load_dotenv()


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


# ── Gemini (Google AI Studio — chat / generation) ───────────────────────────
# Get a free API key at https://aistudio.google.com/apikey
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_BASE_URL = os.getenv(
    "GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta"
).rstrip("/")

# ── CORS ────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    o.strip().rstrip("/")
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]

# ── RAG / embeddings ────────────────────────────────────────────────────────
EMBED_MODEL = os.getenv("EMBED_MODEL", "BAAI/bge-small-en-v1.5")
TOP_K = _int("TOP_K", 6)

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
