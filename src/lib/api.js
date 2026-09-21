// Central API client for the portfolio AI assistant backend.
// The base URL comes from REACT_APP_API_URL (set at build time on Vercel/Netlify);
// falls back to localhost for development.
export const API_BASE = (
  process.env.REACT_APP_API_URL || 'http://localhost:8000'
).replace(/\/$/, '');

/**
 * Ping the backend health endpoint. Used to wake the (free-tier) dyno on page
 * load and to poll until it's ready. Never throws — returns { ok: false } on
 * failure/timeout so callers can keep retrying.
 */
export async function checkHealth(timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    if (!res.ok) return { ok: false };
    const data = await res.json().catch(() => ({}));
    return { ok: true, ...data };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Ask the assistant a question. Returns { answer, sources }.
 * Throws an Error (with .status) on non-2xx responses.
 */
export async function askQuestion(question, history = []) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
  });

  if (!res.ok) {
    let detail = 'Something went wrong. Please try again.';
    try {
      const body = await res.json();
      if (body && body.detail) detail = body.detail;
    } catch {
      /* ignore parse errors */
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

/**
 * Stream an answer token-by-token via SSE.
 * handlers: { onSources(list), onToken(text), onDone(), onError(err) }
 */
export async function askQuestionStream(question, history = [], handlers = {}) {
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
  });

  if (!res.ok || !res.body) {
    let detail = 'Something went wrong. Please try again.';
    try {
      const body = await res.json();
      if (body && body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sep).trim();
      buffer = buffer.slice(sep + 2);
      if (!rawEvent.startsWith('data:')) continue;
      const payload = rawEvent.slice(5).trim();
      let obj;
      try {
        obj = JSON.parse(payload);
      } catch {
        continue;
      }
      if (obj.type === 'sources') handlers.onSources && handlers.onSources(obj.sources || []);
      else if (obj.type === 'token') handlers.onToken && handlers.onToken(obj.text || '');
      else if (obj.type === 'done') handlers.onDone && handlers.onDone();
      else if (obj.type === 'error') throw new Error(obj.detail || 'Failed to generate an answer.');
    }
  }
}

/** Cached GitHub stats for the counters. Returns null on failure. */
export async function fetchGithubStats() {
  try {
    const res = await fetch(`${API_BASE}/github-stats`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Submit the contact form. Returns { status } or throws Error(.status). */
export async function sendContact(payload) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = 'Could not send your message. Please try again.';
    try {
      const body = await res.json();
      if (body && body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
