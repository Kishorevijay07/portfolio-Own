"""OpenRouter chat client — the assistant's generation ("AI mind")."""
import json
from typing import AsyncIterator, Dict, List, Optional

import httpx

from . import config

SYSTEM_PROMPT = """You are the friendly AI assistant embedded on Kishore Selvaraj's \
developer portfolio website. Your job is to answer visitors' questions about Kishore's \
PROFESSIONAL profile.

Rules:
- Answer using ONLY the context below. Do not invent facts, employers, dates, or numbers.
- If the answer is not in the context, say you don't have that detail and suggest \
contacting Kishore directly.
- Stay professional. Cover his education, skills, projects, work experience, achievements, \
and availability.
- Do NOT share personal or sensitive information even if it appears in the context — this \
includes his phone number, home address, fitness/health/weight details, daily schedule or \
wake-up time, personal relationships, and internal business pricing. If asked for these, \
politely say that's not something you can share and point the visitor to his contact options.
- If asked about anything unrelated to Kishore, politely say you can only help with \
questions about Kishore.
- Be concise, warm, and professional. A few sentences is usually enough.
- Refer to him as "Kishore" (third person).

Context about Kishore:
---
{context}
---
"""


class LLMError(Exception):
    pass


def _model_params() -> Dict:
    """Send a fallback list when configured (OpenRouter tries them in order),
    otherwise a single model."""
    models = config.OPENROUTER_MODELS
    if len(models) >= 2:
        return {"models": models[:3]}
    return {"model": models[0] if models else config.OPENROUTER_MODEL}


def _headers() -> Dict:
    headers = {
        "Authorization": f"Bearer {config.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    if config.SITE_URL:
        headers["HTTP-Referer"] = config.SITE_URL
    if config.SITE_NAME:
        headers["X-Title"] = config.SITE_NAME
    return headers


def _build_messages(question: str, contexts: List[Dict], history: Optional[List[Dict]]) -> List[Dict]:
    context_text = "\n\n".join(
        f"[{c.get('source', 'doc')}]\n{c['text']}" for c in contexts
    ) or "(no additional context found)"

    messages = [{"role": "system", "content": SYSTEM_PROMPT.format(context=context_text)}]
    for turn in (history or [])[-6:]:
        role, content = turn.get("role"), (turn.get("content") or "").strip()
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": question})
    return messages


async def generate_answer(
    question: str,
    contexts: List[Dict],
    history: Optional[List[Dict]] = None,
) -> str:
    if not config.OPENROUTER_API_KEY:
        raise LLMError("OpenRouter API key not configured")

    payload = {
        **_model_params(),
        "messages": _build_messages(question, contexts, history),
        "temperature": 0.3,
        "max_tokens": 600,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{config.OPENROUTER_BASE_URL}/chat/completions",
            json=payload,
            headers=_headers(),
        )
        resp.raise_for_status()
        data = resp.json()

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise LLMError(f"Unexpected OpenRouter response: {data}") from exc


async def stream_answer(
    question: str,
    contexts: List[Dict],
    history: Optional[List[Dict]] = None,
) -> AsyncIterator[str]:
    """Yield answer tokens as they arrive from OpenRouter (SSE)."""
    if not config.OPENROUTER_API_KEY:
        raise LLMError("OpenRouter API key not configured")

    payload = {
        **_model_params(),
        "messages": _build_messages(question, contexts, history),
        "temperature": 0.3,
        "max_tokens": 600,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=90) as client:
        async with client.stream(
            "POST",
            f"{config.OPENROUTER_BASE_URL}/chat/completions",
            json=payload,
            headers=_headers(),
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                data = line[len("data:"):].strip()
                if data == "[DONE]":
                    break
                try:
                    obj = json.loads(data)
                    delta = obj["choices"][0]["delta"].get("content")
                except (json.JSONDecodeError, KeyError, IndexError, TypeError):
                    continue
                if delta:
                    yield delta
