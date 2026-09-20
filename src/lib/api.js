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
