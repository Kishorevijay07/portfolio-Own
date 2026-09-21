import React, { useEffect, useRef, useState } from 'react';
import { fetchGithubStats } from '../lib/api';
import './StatsRow.css';

// key = field from /github-stats; when live data is present we show the real
// number, otherwise the curated fallback (with a "+").
const STATS = [
  { key: 'public_repos', label: 'Repositories', fallback: 8, suffix: '+' },
  { key: 'stars', label: 'GitHub Stars', fallback: 5, suffix: '+' },
  { key: 'followers', label: 'Followers', fallback: 3, suffix: '+' },
  { key: null, label: 'Passion', fallback: 100, suffix: '%' },
];

function Counter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const step = Math.max(1, Math.ceil(target / 40));
          let cur = 0;
          const timer = setInterval(() => {
            cur = Math.min(cur + step, target);
            setCount(cur);
            if (cur >= target) clearInterval(timer);
          }, 40);
        }
      },
      { threshold: 0.4 }
    );
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="stat-num">
      {count}
      {suffix}
    </span>
  );
}

export default function StatsRow() {
  const [gh, setGh] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchGithubStats().then((data) => {
      if (alive && data) setGh(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="stats-row">
      {STATS.map((s) => {
        const live = gh && s.key != null && typeof gh[s.key] === 'number';
        const target = live ? gh[s.key] : s.fallback;
        const suffix = live ? '' : s.suffix;
        return (
          <div key={s.label} className="stat-item">
            <Counter key={`${s.label}-${target}`} target={target} suffix={suffix} />
            <span className="stat-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
