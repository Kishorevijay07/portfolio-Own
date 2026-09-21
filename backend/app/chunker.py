"""Build retrieval chunks from the knowledge sources.

Sources (all optional, combined):
  1. Any .md / .txt / .pdf files you drop in  backend/data/knowledge/
  2. The résumé PDF shown on the site:        public/resume.pdf

This is the single source of truth about Kishore — edit the résumé (or add your
own files) and re-run scripts/build_index.py. Shared by the offline index
builder and the runtime loader so chunking stays identical.
"""
import re
from pathlib import Path
from typing import Dict, List

_APP_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = _APP_DIR.parent / "data" / "knowledge"          # backend/data/knowledge
PUBLIC_RESUME = _APP_DIR.parent.parent / "public" / "resume.pdf"  # <repo>/public/resume.pdf

_TEXT_EXTS = {".md", ".txt"}


def extract_pdf_text(path: Path) -> str:
    """Extract plain text from a PDF (pypdf)."""
    try:
        from pypdf import PdfReader
    except ImportError:
        return ""
    try:
        reader = PdfReader(str(path))
    except Exception:
        return ""
    parts = []
    for page in reader.pages:
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
        if text.strip():
            parts.append(text)
    text = "\n\n".join(parts)
    # Clean up common PDF extraction artifacts (unmapped bullet glyphs, odd spaces).
    text = text.replace("�", "-").replace("•", "-").replace("\xa0", " ")
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text


def chunk_text(text: str, source: str, max_words: int = 160, overlap: int = 30) -> List[Dict]:
    """Split text into word-windowed chunks with light overlap.

    Works for prose (blank-line paragraphs) and for résumé-style text where the
    only breaks are single newlines.
    """
    blocks = [b.strip() for b in re.split(r"\n\s*\n", text) if b.strip()]
    if len(blocks) <= 2:  # PDF/plain text with no blank-line structure
        blocks = [ln.strip() for ln in text.splitlines() if ln.strip()]

    chunks: List[str] = []
    buf: List[str] = []
    for block in blocks:
        words = block.split()
        if buf and len(buf) + len(words) > max_words:
            chunks.append(" ".join(buf))
            buf = buf[-overlap:] if overlap else []
        buf.extend(words)
    if buf:
        chunks.append(" ".join(buf))

    return [{"text": c, "source": source} for c in chunks if c.strip()]


def load_source_chunks() -> List[Dict]:
    """Read every knowledge source and return chunk dicts (no vectors).

    NOTE: public/resume.pdf is intentionally NOT indexed — it carries personal
    contact details (phone number). The résumé is offered only as a UI download.
    The assistant's knowledge comes solely from the curated, professional-only
    files in data/knowledge/. Drop a .txt/.md/.pdf there to add to it.
    """
    all_chunks: List[Dict] = []

    if KNOWLEDGE_DIR.exists():
        for path in sorted(KNOWLEDGE_DIR.glob("*")):
            suffix = path.suffix.lower()
            if suffix in _TEXT_EXTS:
                all_chunks.extend(chunk_text(path.read_text(encoding="utf-8"), path.stem))
            elif suffix == ".pdf":
                all_chunks.extend(chunk_text(extract_pdf_text(path), path.stem))

    return all_chunks


# Backwards-compatible alias (older import name).
load_markdown_chunks = load_source_chunks
