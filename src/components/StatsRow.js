import React, { useEffect, useRef, useState } from 'react';
import './StatsRow.css';

const STATS = [
  { num: 8,   suffix: '+', label: 'Projects Built' },
  { num: 5,   suffix: '+', label: 'Technologies' },
  { num: 3,   suffix: '+', label: 'ML Models' },
  { num: 100, suffix: '%', label: 'Passion' },
];

function Counter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const step = Math.ceil(target / 40);
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="stat-num">
      {count}{suffix}
    </span>
  );
}

export default function StatsRow() {
  return (
    <div className="stats-row">
      {STATS.map((s) => (
        <div key={s.label} className="stat-item">
          <Counter target={s.num} suffix={s.suffix} />
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
