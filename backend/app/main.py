"""FastAPI entrypoint for the portfolio AI assistant."""
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from . import config, llm
from .rag import index
from .schemas import ChatRequest, ChatResponse, Source

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    index.load()  # load the knowledge index once at startup
    yield


app = FastAPI(title="Kishore Portfolio Assistant", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"service": "kishore-portfolio-assistant", "docs": "/docs", "health": "/health"}


@app.get("/health")
async def health():
    """Fast, LLM-free endpoint. The frontend pings this on load to wake the dyno."""
    return {
        "status": "ok",
        "chunks": len(index.chunks),
        "index_source": index.source,
        "configured": bool(config.OPENROUTER_API_KEY),
    }


@app.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(request: Request, body: ChatRequest):
    question = body.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    if len(question) > config.MAX_QUESTION_CHARS:
        raise HTTPException(
            status_code=400,
            detail=f"Question too long (max {config.MAX_QUESTION_CHARS} characters).",
        )
    if not config.OPENROUTER_API_KEY:
        raise HTTPException(status_code=503, detail="AI assistant is not configured yet.")

    contexts = index.retrieve(question)
    history = [m.model_dump() for m in (body.history or [])]

    try:
        answer = await llm.generate_answer(question, contexts, history)
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail=f"Model provider error ({exc.response.status_code}).")
    except (httpx.HTTPError, llm.LLMError):
        raise HTTPException(status_code=502, detail="Failed to generate an answer. Please try again.")

    sources, seen = [], set()
    for c in contexts:
        name = c.get("source", "doc")
        if name not in seen:
            seen.add(name)
            sources.append(Source(source=name, score=c.get("score")))

    return ChatResponse(answer=answer, sources=sources)
