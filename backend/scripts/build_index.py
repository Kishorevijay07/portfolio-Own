"""Build the embeddings index from the knowledge markdown files.

Run this whenever you edit backend/data/knowledge/*.md:

    cd backend
    python scripts/build_index.py

It writes backend/data/embeddings.json (committed), which the API loads at
startup for real semantic retrieval. If this file is absent, the API falls
back to on-the-fly keyword retrieval over the markdown.
"""
import json
import sys
from pathlib import Path

# Make the `app` package importable when run as a script.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import config, embed  # noqa: E402
from app.chunker import load_source_chunks  # noqa: E402

OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "embeddings.json"


def main() -> None:
    chunks = load_source_chunks()
    if not chunks:
        print("No knowledge sources found (add public/resume.pdf or files in data/knowledge/).")
        return

    print(f"Chunked knowledge into {len(chunks)} pieces. Embedding with {config.EMBED_MODEL} ...")
    vectors = embed.embed_texts([c["text"] for c in chunks])

    for chunk, vec in zip(chunks, vectors):
        chunk["vector"] = [round(float(x), 6) for x in vec]

    OUT_PATH.write_text(
        json.dumps({"model": config.EMBED_MODEL, "chunks": chunks}, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size // 1024} KB, dim={len(vectors[0])}).")


if __name__ == "__main__":
    main()
