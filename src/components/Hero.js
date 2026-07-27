import React, { useEffect, useState, useRef } from 'react';
import './Hero.css';

const ROLES = [
  'AI/ML Engineer',
  'SaaS Builder',
  'Agentic Systems Developer',
  'Full Stack Architect',
  'Problem Solver',
];

const GITHUB_USER = 'kishorevijay07';

const FALLBACK_LINES = [
  { type: 'prompt', cmd: 'whoami' },
  { type: 'out', text: 'kishore_selvaraj', cls: 'success' },
  { type: 'prompt', cmd: `curl -s api.github.com/users/${GITHUB_USER}` },
  { type: 'out', text: 'loading GitHub stats…', cls: '' },
  { type: 'prompt', cmd: 'echo $STATUS' },
  { type: 'out', text: '✓ Available for opportunities', cls: 'success' },
];

function shortSha(sha) {
  return (sha || '').slice(0, 7);
}

async function fetchGithubLines() {
  try {
    const [userRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`),
      fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`),
    ]);
    if (!userRes.ok || !eventsRes.ok) throw new Error('gh api');
    const user = await userRes.json();
    const events = await eventsRes.json();

    const commits = [];
    for (const ev of events) {
      if (ev.type === 'PushEvent' && ev.payload?.commits) {
        for (const c of ev.payload.commits) {
          if (!c.message) continue;
          commits.push({
            sha: shortSha(c.sha),
            msg: c.message.split('\n')[0].slice(0, 48),
          });
          if (commits.length >= 3) break;
        }
      }
      if (commits.length >= 3) break;
    }

    const lines = [
      { type: 'prompt', cmd: 'whoami' },
      { type: 'out', text: user.login || 'kishore_selvaraj', cls: 'success' },
      { type: 'prompt', cmd: `curl -s api.github.com/users/${GITHUB_USER}` },
      {
        type: 'out',
        text: `{ "repos": ${user.public_repos ?? 0}, "followers": ${user.followers ?? 0},`,
        cls: '',
      },
      {
        type: 'out',
        text: `  "since": "${(user.created_at || '').slice(0, 10)}" }`,
        cls: 'highlight',
      },
    ];

    if (commits.length) {
      lines.push({ type: 'prompt', cmd: 'git log --oneline -3' });
      for (const c of commits) {
        lines.push({ type: 'out', text: `${c.sha} ${c.msg}`, cls: '' });
      }
    }

    lines.push({ type: 'prompt', cmd: 'echo $STATUS' });
    lines.push({ type: 'out', text: '✓ Available for opportunities', cls: 'success' });
    return lines;
  } catch {
    return FALLBACK_LINES;
  }
}

function useTypingEffect() {
  const [text, setText] = useState('');
  const [roleIdx, setRoleIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const current = ROLES[roleIdx];
    let timeout;
    if (!isDeleting) {
      if (charIdx < current.length) {
        timeout = setTimeout(() => setCharIdx((c) => c + 1), 90);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => setCharIdx((c) => c - 1), 50);
      } else {
        setIsDeleting(false);
        setRoleIdx((r) => (r + 1) % ROLES.length);
      }
    }
    setText(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, roleIdx]);

  return text;
}

function Terminal() {
  const [lines, setLines] = useState([]);
  const bodyRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let timeouts = [];

    fetchGithubLines().then((script) => {
      if (cancelled) return;
      let elapsed = 1800;
      script.forEach((line) => {
        const delay = line.type === 'prompt' ? 600 : 200;
        elapsed += delay;
        const t = setTimeout(() => {
          setLines((prev) => [...prev, line]);
        }, elapsed);
        timeouts.push(t);
      });
    });

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  return (
    <div className="hero-terminal">
      <div className="terminal-bar">
        <div className="t-dot red" />
        <div className="t-dot amber" />
        <div className="t-dot green" />
        <span className="terminal-title">kishore@dev ~ bash</span>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {lines.map((line, i) =>
          line.type === 'prompt' ? (
            <div key={i} className="t-line">
              <span className="t-prompt">$ </span>
              <span className="t-cmd">{line.cmd}</span>
            </div>
          ) : (
            <div key={i} className="t-line">
              <span className={`t-out ${line.cls || ''}`}>{line.text}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function Hero() {
  const typedText = useTypingEffect();

  return (
    <section className="hero" id="home">
      <div className="hero-grid-bg" />
      <div className="hero-content">
        <div className="hero-photo-wrap">
          <img
            src={`${process.env.PUBLIC_URL}/kishore.jpg`}
            alt="Kishore Selvaraj"
            className="hero-photo"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="hero-photo-ring" aria-hidden="true" />
        </div>
        <div className="hero-tag">Full Stack Developer &amp; AI Engineer</div>
        <h1 className="hero-name">
          <span className="line1">Kishore</span>
          <span className="line2">Selvaraj</span>
        </h1>
        <p className="hero-role">
          <span>{typedText}</span>
          <span className="typed-cursor">_</span>
        </p>
        <p className="hero-desc">
          Integrated M.Sc. IT student at College of Engineering, Guindy. Building{' '}
          <strong>scalable systems</strong> that merge real-world usability with
          powerful backend architecture — from OCR pipelines to AI coding assistants.
        </p>
        <div className="hero-btns">
          <a href="#projects" className="btn btn-primary">
            View Projects →
          </a>
          <a href="#contact" className="btn btn-ghost">
            Get In Touch
          </a>
        </div>
      </div>
      <Terminal />
    </section>
  );
}
