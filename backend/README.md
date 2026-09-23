# Portfolio AI Assistant — Backend

A small FastAPI service that powers the "Ask AI" assistant on the portfolio. It runs a
lightweight RAG pipeline over a knowledge base about Kishore and uses **Google Gemini**
(free tier) for generation.

- Embeddings: local `fastembed` (ONNX, no PyTorch) → fits Render's free tier.
- Retrieval: cosine similarity over precomputed vectors (`data/embeddings.json`), with a
  keyword fallback if vectors are missing or embedding fails.
- Generation: Google Gemini `generateContent` / `streamGenerateContent` (the "AI mind").

## Endpoints
- `GET /health` — fast, no LLM call. Used by the frontend to wake the dyno (cold start).
- `POST /chat` — `{ "question": "...", "history": [{role, content}, ...] }` → `{ answer, sources }`.
- `POST /chat/stream` — same input, streams the answer token-by-token as SSE
  (`data: {"type":"sources"|"token"|"done"|"error", ...}`). The frontend uses this for live typing.
- `GET /github-stats` — cached GitHub profile stats (repos, stars, followers) powering the counters.
- `POST /contact` — `{ name, email, message }` → emails you (Resend or SMTP). Rate-limited.
- `GET /docs` — interactive Swagger UI.

### Model (Gemini free tier)
Set `GEMINI_MODEL` to any Gemini model your key can access (default `gemini-2.5-flash`).
Free-tier keys from Google AI Studio have generous daily limits. List models available to
your key with:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"
```

### Contact form email
Set **either** Resend (recommended) **or** SMTP, plus `CONTACT_TO_EMAIL`:
- Resend: `RESEND_API_KEY` + `CONTACT_TO_EMAIL` (verify a domain, or use `onboarding@resend.dev` as `CONTACT_FROM_EMAIL` for testing).
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` + `CONTACT_TO_EMAIL` (e.g. a Gmail app password).
If neither is set, `/contact` returns a clear "not configured" message and the site falls back to the mailto link.

## Local development
```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # then paste your Gemini key into .env
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
The assistant's knowledge comes from **your own files**:
1. `public/resume.pdf` — the résumé shown on the site (the primary source of truth).
2. Any `.md` / `.txt` / `.pdf` you drop into `backend/data/knowledge/` (optional extra notes).

After changing any of these, re-run `python scripts/build_index.py` and commit the updated
`data/embeddings.json`. PDFs are parsed with `pypdf`. `TOP_K` is set high enough that a short
résumé is passed to the model in full.

## Deploy (Render free tier)
1. Push this repo to GitHub.
2. Render → New → Blueprint → pick this repo (uses `backend/render.yaml`).
3. In the service's Environment, set:
   - `GEMINI_API_KEY` = your key from https://aistudio.google.com/apikey
   - `ALLOWED_ORIGINS` = your deployed frontend origin, e.g. `https://your-portfolio.vercel.app`
4. Deploy. Copy the service URL and set it as `REACT_APP_API_URL` in the frontend build.

> The free service spins down after ~15 min idle and cold-starts in ~50s. The frontend
> pings `/health` on page load to wake it, and the assistant shows "AI Preparinggg 😂"
> until it's ready.

## Security notes
- The Gemini key lives only in environment variables — never in the repo or the frontend bundle.
- CORS is restricted to `ALLOWED_ORIGINS`; `/chat` is rate-limited and caps question length.
