# Kishore Selvaraj — Portfolio

A clean, light, minimal React portfolio with an **AI assistant** that answers questions about
Kishore using a small RAG pipeline (FastAPI + OpenRouter).

- **Frontend:** React (Create React App), static — deploy to Vercel/Netlify.
- **Backend:** FastAPI RAG service — deploy to Render (free tier). See [`backend/README.md`](backend/README.md).
- **AI assistant:** floating "Ask AI" widget. On page load it pings the backend to warm the
  (free-tier) dyno; if it's still cold when you ask, it shows *"AI Preparinggg 😂"* and sends your
  question automatically once the server is awake.

---

## 📁 Structure

```
kishore-portfolio/
├── public/                 ← HTML shell + fonts + images (kishore.jpg, projects/)
├── src/
│   ├── components/         ← Navbar, Hero, StatsRow, About, Projects, Skills, Contact, Footer
│   │   └── Assistant/      ← ChatWidget.js/.css  (the "Ask AI" chat)
│   ├── hooks/useBackend.js ← warms up + polls the backend, tracks ready/warming/error
│   ├── lib/api.js          ← API client (health ping + /chat)
│   ├── styles/global.css   ← design tokens (light theme), shared classes
│   ├── App.js / index.js
├── backend/                ← FastAPI RAG service (see backend/README.md)
├── .env.example            ← REACT_APP_API_URL (backend URL)
├── netlify.toml / vercel.json
└── package.json
```

---

## 🚀 Local setup

**Frontend**
```bash
npm install
cp .env.example .env.local     # REACT_APP_API_URL=http://localhost:8000
npm start                      # http://localhost:3000
```

**Backend** — see [`backend/README.md`](backend/README.md) (venv → install → build index → uvicorn).
You'll need a free OpenRouter API key from https://openrouter.ai/keys.

---

## 🌐 Deploy

### Frontend (Vercel / Netlify)
Build command `npm run build`, publish `build`. **Set the env var** `REACT_APP_API_URL` to your
deployed Render backend URL (e.g. `https://kishore-portfolio-assistant.onrender.com`), then redeploy.

- **Vercel:** New Project → import repo → add `REACT_APP_API_URL` in Settings → Environment Variables.
- **Netlify:** Import from Git → Site settings → Environment → add `REACT_APP_API_URL`.

### Backend (Render, free)
Render → New → Blueprint → this repo (uses `backend/render.yaml`). In the service Environment set:
- `OPENROUTER_API_KEY` — your key (secret, never committed)
- `ALLOWED_ORIGINS` — your frontend origin (e.g. `https://your-portfolio.vercel.app`)

> The free backend sleeps after ~15 min idle and cold-starts in ~50s. That's expected — the
> frontend warms it on load and the assistant shows "AI Preparinggg 😂" until it's ready.

---

## ✨ Features
- **Streaming AI answers** — the assistant types responses token-by-token (SSE).
- **Live GitHub stats** — the counters pull cached repos/stars/followers from the backend.
- **Contact form** — sends you an email (Resend or SMTP); falls back to a mailto link if not configured.
- **Résumé** — "Résumé" buttons in the hero and Contact link to `public/resume.pdf`.
  👉 **Add your own file at `public/resume.pdf`** (it's linked but not included in the repo).

## 🧠 Editing what the AI knows
The assistant learns about Kishore from **your own files** — primarily `public/resume.pdf`
(the same résumé the site links), plus any optional `.md`/`.txt`/`.pdf` notes you drop into
`backend/data/knowledge/`. After changing them, run `python scripts/build_index.py` in `backend/`
and commit the regenerated `data/embeddings.json`.

## ⚙️ Backend env vars (set in Render)
`OPENROUTER_API_KEY` (secret), `OPENROUTER_MODELS` (fallback list), `ALLOWED_ORIGINS` (your frontend
origin), `GITHUB_USERNAME`, and — to enable the contact form — `RESEND_API_KEY` + `CONTACT_TO_EMAIL`
(or the `SMTP_*` vars). See `backend/.env.example`.
