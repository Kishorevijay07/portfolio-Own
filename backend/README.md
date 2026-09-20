# Portfolio AI Assistant — Backend

A small FastAPI service that powers the "Ask AI" assistant on the portfolio. It runs a
lightweight RAG pipeline over a markdown knowledge base about Kishore and uses
**OpenRouter** for generation.

- Embeddings: local `fastembed` (ONNX, no PyTorch) → fits Render's free tier.
- Retrieval: cosine similarity over precomputed vectors (`data/embeddings.json`), with a
  keyword fallback if vectors are missing or embedding fails.
- Generation: OpenRouter chat completion (the "AI mind").

## Endpoints
- `GET /health` — fast, no LLM call. Used by the frontend to wake the dyno (cold start).
- `POST /chat` — `{ "question": "...", "history": [{role, content}, ...] }` → `{ answer, sources }`.
- `GET /docs` — interactive Swagger UI.

## Local development
```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # then paste your OpenRouter key into .env
python scripts/build_index.py # builds data/embeddings.json (real embeddings)

uvicorn app.main:app --reload # http://localhost:8000
```

Test it:
```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"What projects has Kishore built?\"}"
```

## Editing what the assistant knows
Edit the markdown in `data/knowledge/`, then re-run `python scripts/build_index.py`
and commit the updated `data/embeddings.json`.

## Deploy (Render free tier)
1. Push this repo to GitHub.
2. Render → New → Blueprint → pick this repo (uses `backend/render.yaml`).
3. In the service's Environment, set:
   - `OPENROUTER_API_KEY` = your key from https://openrouter.ai/keys
   - `ALLOWED_ORIGINS` = your deployed frontend origin, e.g. `https://your-portfolio.vercel.app`
4. Deploy. Copy the service URL and set it as `REACT_APP_API_URL` in the frontend build.

> The free service spins down after ~15 min idle and cold-starts in ~50s. The frontend
> pings `/health` on page load to wake it, and the assistant shows "AI Preparinggg 😂"
> until it's ready.

## Security notes
- The OpenRouter key lives only in environment variables — never in the repo or the frontend bundle.
- CORS is restricted to `ALLOWED_ORIGINS`; `/chat` is rate-limited and caps question length.
