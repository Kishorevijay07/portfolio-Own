"""Google Gemini chat client — the assistant's generation ("AI mind").

Uses the Google AI Studio Generative Language API (generateContent /
streamGenerateContent). Free-tier keys come from https://aistudio.google.com/apikey
"""
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


def _system_instruction(contexts: List[Dict]) -> Dict:
    context_text = "\n\n".join(
        f"[{c.get('source', 'doc')}]\n{c['text']}" for c in contexts
    ) or "(no additional context found)"
    return {"parts": [{"text": SYSTEM_PROMPT.format(context=context_text)}]}


def _build_contents(question: str, history: Optional[List[Dict]]) -> List[Dict]:
    """Gemini 'contents' use roles 'user' / 'model' (no 'system' turn)."""
    contents: List[Dict] = []
    for turn in (history or [])[-6:]:
        role = turn.get("role")
        content = (turn.get("content") or "").strip()
        if not content or role not in ("user", "assistant"):
            continue
        gemini_role = "user" if role == "user" else "model"
        contents.append({"role": gemini_role, "parts": [{"text": content}]})
    contents.append({"role": "user", "parts": [{"text": question}]})
    return contents


def _payload(question: str, contexts: List[Dict], history: Optional[List[Dict]]) -> Dict:
    return {
        "systemInstruction": _system_instruction(contexts),
        "contents": _build_contents(question, history),
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 600},
    }


def _headers() -> Dict:
    return {"Content-Type": "application/json", "x-goog-api-key": config.GEMINI_API_KEY}


def _extract_text(data: Dict) -> str:
    """Pull the text out of a GenerateContentResponse (or a streamed chunk)."""
    try:
        candidates = data.get("candidates") or []
        if not candidates:
            return ""
        parts = candidates[0].get("content", {}).get("parts", []) or []
        return "".join(p.get("text", "") for p in parts)
    except (AttributeError, IndexError, KeyError, TypeError):
        return ""


async def generate_answer(
    question: str,
    contexts: List[Dict],
    history: Optional[List[Dict]] = None,
) -> str:
    if not config.GEMINI_API_KEY:
        raise LLMError("Gemini API key not configured")

    url = f"{config.GEMINI_BASE_URL}/models/{config.GEMINI_MODEL}:generateContent"
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, json=_payload(question, contexts, history), headers=_headers())
        resp.raise_for_status()
        data = resp.json()

    text = _extract_text(data).strip()
    if not text:
        raise LLMError(f"Empty or blocked Gemini response: {data}")
    return text


async def stream_answer(
    question: str,
    contexts: List[Dict],
    history: Optional[List[Dict]] = None,
) -> AsyncIterator[str]:
    """Yield answer tokens as they arrive from Gemini (SSE)."""
    if not config.GEMINI_API_KEY:
        raise LLMError("Gemini API key not configured")

    url = f"{config.GEMINI_BASE_URL}/models/{config.GEMINI_MODEL}:streamGenerateContent?alt=sse"
    async with httpx.AsyncClient(timeout=90) as client:
        async with client.stream(
            "POST", url, json=_payload(question, contexts, history), headers=_headers()
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                chunk = line[len("data:"):].strip()
                if not chunk or chunk == "[DONE]":
                    continue
                try:
                    obj = json.loads(chunk)
                except json.JSONDecodeError:
                    continue
                text = _extract_text(obj)
                if text:
                    yield text
