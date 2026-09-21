import React, { useCallback, useEffect, useRef, useState } from 'react';
import useBackend from '../../hooks/useBackend';
import { askQuestion, askQuestionStream } from '../../lib/api';
import './ChatWidget.css';

const STORAGE_KEY = 'ks_assistant_msgs';

const SUGGESTIONS = [
  'What has Kishore built?',
  "What's his tech stack?",
  'Is he available for work?',
  'Tell me about AgentOS',
];

const WELCOME = {
  role: 'assistant',
  content:
    "Hi! I'm Kishore's AI assistant 🤖 — ask me anything about his projects, skills, or background.",
};

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [WELCOME];
}

const STATUS_META = {
  warming: { label: 'Waking up…', cls: 'warming' },
  ready: { label: 'Online', cls: 'ready' },
  error: { label: 'Offline', cls: 'error' },
};

export default function ChatWidget() {
  const { status, retry } = useBackend();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [preparing, setPreparing] = useState(false);

  const messagesRef = useRef(messages);
  const pendingRef = useRef(null);
  const bodyRef = useRef(null);
  const statusRef = useRef(status);

  messagesRef.current = messages;
  statusRef.current = status;

  // Persist transcript (per-visitor convenience).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // Auto-scroll to newest message.
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open, preparing, sending]);

  // Let the navbar "Ask AI" button open the panel.
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener('open-assistant', openHandler);
    return () => window.removeEventListener('open-assistant', openHandler);
  }, []);

  const patchLast = (patch) =>
    setMessages((prev) => {
      if (!prev.length) return prev;
      const copy = prev.slice();
      const i = copy.length - 1;
      copy[i] = typeof patch === 'function' ? patch(copy[i]) : { ...copy[i], ...patch };
      return copy;
    });

  const doAsk = useCallback(async (question, history) => {
    setPreparing(false);
    setSending(true);
    // Add an empty assistant bubble that fills in as tokens stream.
    setMessages((prev) => [...prev, { role: 'assistant', content: '', streaming: true }]);

    try {
      await askQuestionStream(question, history, {
        onSources: (sources) => patchLast((m) => ({ ...m, sources })),
        onToken: (t) => patchLast((m) => ({ ...m, content: m.content + t })),
        onDone: () => patchLast((m) => ({ ...m, streaming: false })),
      });
      patchLast((m) => ({ ...m, streaming: false }));
    } catch (err) {
      // If nothing streamed yet, try the non-streaming endpoint as a fallback.
      const last = messagesRef.current[messagesRef.current.length - 1];
      if (last && last.role === 'assistant' && !last.content) {
        try {
          const { answer, sources } = await askQuestion(question, history);
          patchLast({ content: answer, sources, streaming: false });
        } catch (err2) {
          patchLast({
            content: err2.message || "I couldn't reach the server just now. Please try again.",
            isError: true,
            streaming: false,
          });
        }
      } else {
        patchLast((m) => ({ ...m, streaming: false }));
      }
    } finally {
      setSending(false);
    }
  }, []);

  // When the backend becomes ready, flush any queued question.
  useEffect(() => {
    if (status === 'ready' && pendingRef.current) {
      const { question, history } = pendingRef.current;
      pendingRef.current = null;
      doAsk(question, history);
    }
  }, [status, doAsk]);

  const send = useCallback(
    (text) => {
      const question = (text ?? input).trim();
      if (!question || sending) return;

      const history = messagesRef.current
        .filter((m) => m.role === 'user' || (m.role === 'assistant' && !m.isError))
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-6);

      setMessages((prev) => [...prev, { role: 'user', content: question }]);
      setInput('');

      if (statusRef.current === 'ready') {
        doAsk(question, history);
      } else {
        // Backend still cold — queue it and show the playful preparing state.
        pendingRef.current = { question, history };
        setPreparing(true);
        if (statusRef.current === 'error') retry();
      }
    },
    [input, sending, doAsk, retry]
  );

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const meta = STATUS_META[status] || STATUS_META.warming;
  const showSuggestions = messages.length <= 1 && !preparing && !sending;

  return (
    <>
      {!open && (
        <button
          type="button"
          className="assistant-fab"
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
        >
          <span className="assistant-fab-spark">✦</span>
          <span className="assistant-fab-text">Ask AI</span>
        </button>
      )}

      {open && (
        <div className="assistant-panel" role="dialog" aria-label="AI assistant">
          <div className="assistant-header">
            <div className="assistant-header-title">
              <span className="assistant-avatar">✦</span>
              <div>
                <div className="assistant-name">Ask about Kishore</div>
                <div className={`assistant-status ${meta.cls}`}>
                  <span className="assistant-status-dot" />
                  {meta.label}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="assistant-close"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              ×
            </button>
          </div>

          <div className="assistant-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`msg msg-${m.role} ${m.isError ? 'msg-error' : ''}`}>
                <div className="msg-bubble">
                  {m.content}
                  {m.streaming && m.content && <span className="stream-cursor">▍</span>}
                  {m.streaming && !m.content && (
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <div className="msg-sources">
                    {m.sources.map((s) => (
                      <span key={s.source} className="msg-source">
                        {s.source}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {preparing && (
              <div className="msg msg-assistant">
                <div className="msg-bubble msg-preparing">
                  AI Preparinggg 😂
                  <div className="msg-preparing-sub">
                    Waking up the free server — this can take ~30–60s. Your question will send
                    itself the moment it's ready. 🚀
                  </div>
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            {showSuggestions && (
              <div className="assistant-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className="suggestion-chip" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="assistant-input-row">
            <input
              className="assistant-input"
              type="text"
              placeholder="Ask about Kishore…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={500}
            />
            <button
              type="button"
              className="assistant-send"
              onClick={() => send()}
              disabled={!input.trim() || sending}
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
