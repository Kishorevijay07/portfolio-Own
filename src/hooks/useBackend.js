import { useCallback, useEffect, useRef, useState } from 'react';
import { checkHealth } from '../lib/api';

/**
 * Warms up the free-tier backend on page load and tracks its readiness.
 *
 * status:
 *   'warming' — pinging /health, dyno likely cold-starting
 *   'ready'   — backend responded ok, safe to send questions
 *   'error'   — gave up after many attempts (backend down / misconfigured)
 */
const MAX_ATTEMPTS = 30; // ~2–3 minutes of polling before giving up

export default function useBackend() {
  const [status, setStatus] = useState('warming');
  const timerRef = useRef(null);
  const attemptsRef = useRef(0);
  const statusRef = useRef('warming');

  const setBoth = (s) => {
    statusRef.current = s;
    setStatus(s);
  };

  const stop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const warmup = useCallback(async () => {
    if (statusRef.current === 'ready') return;
    stop();
    setBoth('warming');
    attemptsRef.current = 0;

    const loop = async () => {
      const res = await checkHealth();
      if (res.ok) {
        setBoth('ready');
        return;
      }
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setBoth('error');
        return;
      }
      // Gentle backoff: 3s → 6s max between pings.
      const delay = Math.min(3000 + attemptsRef.current * 400, 6000);
      timerRef.current = setTimeout(loop, delay);
    };

    loop();
  }, []);

  useEffect(() => {
    warmup(); // fire immediately on mount = on page load
    return stop;
  }, [warmup]);

  return { status, retry: warmup };
}
