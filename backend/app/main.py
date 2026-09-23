"""FastAPI entrypoint for the portfolio AI assistant."""
import json
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from . import config, email_send, github, llm
from .rag import index
from .schemas import ChatRequest, ChatResponse, ContactRequest, GithubStats, Source

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    index.load()  # load the knowledge index once at startup
    yield


app = FastAPI(title="Kishore Portfolio Assistant", version="1.1.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def _validate_question(body: ChatRequest) -> str:
    question = body.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    if len(question) > config.MAX_QUESTION_CHARS:
        raise HTTPException(
            status_code=400,
            detail=f"Question too long (max {config.MAX_QUESTION_CHARS} characters).",
        )
    if not config.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI assistant is not configured yet.")
    return question


def _unique_sources(contexts) -> list:
    sources, seen = [], set()
    for c in contexts:
        name = c.get("source", "doc")
        if name not in seen:
            seen.add(name)
            sources.append(Source(source=name, score=c.get("score")))
    return sources


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
        "configured": bool(config.GEMINI_API_KEY),
    }


@app.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(request: Request, body: ChatRequest):
    question = _validate_question(body)
    contexts = index.retrieve(question)
    history = [m.model_dump() for m in (body.history or [])]

    try:
        answer = await llm.generate_answer(question, contexts, history)
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail=f"Model provider error ({exc.response.status_code}).")
    except (httpx.HTTPError, llm.LLMError):
        raise HTTPException(status_code=502, detail="Failed to generate an answer. Please try again.")

    return ChatResponse(answer=answer, sources=_unique_sources(contexts))


@app.post("/chat/stream")
@limiter.limit("20/minute")
async def chat_stream(request: Request, body: ChatRequest):
    """Server-sent events: streams the answer token-by-token for a live-typing feel."""
    question = _validate_question(body)
    contexts = index.retrieve(question)
    history = [m.model_dump() for m in (body.history or [])]
    sources = [s.model_dump() for s in _unique_sources(contexts)]

    async def event_stream():
        yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
        try:
            async for token in llm.stream_answer(question, contexts, history):
                yield f"data: {json.dumps({'type': 'token', 'text': token})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception:
            yield f"data: {json.dumps({'type': 'error', 'detail': 'Failed to generate an answer.'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/github-stats", response_model=GithubStats)
@limiter.limit("30/minute")
async def github_stats(request: Request):
    try:
        data = await github.get_github_stats()
    except (httpx.HTTPError, KeyError):
        raise HTTPException(status_code=502, detail="Could not fetch GitHub stats.")
    return GithubStats(**data)


@app.post("/contact")
@limiter.limit("5/minute")
async def contact(request: Request, body: ContactRequest):
    if len(body.message) > config.MAX_CONTACT_CHARS:
        raise HTTPException(status_code=400, detail="Message is too long.")
    try:
        await email_send.send_contact_email(body.name.strip(), body.email, body.message.strip())
    except email_send.EmailError:
        raise HTTPException(status_code=503, detail="Contact form isn't set up yet — please email directly.")
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Couldn't send your message. Please try again.")
    return {"status": "sent"}
