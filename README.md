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

## 🧠 Editing what the AI knows
The assistant answers from `backend/data/knowledge/*.md` (profile, projects, skills, faq). Edit those,
run `python scripts/build_index.py` in `backend/`, and commit the regenerated `data/embeddings.json`.
