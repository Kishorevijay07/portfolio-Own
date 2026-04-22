import React, { useEffect, useState, useRef } from 'react';
import './Hero.css';

const ROLES = [
  'MERN Stack Developer',
  'AI/ML Engineer',
  'OCR Systems Builder',
  'Full Stack Architect',
  'Problem Solver',
];

const TERMINAL_LINES = [
  { type: 'prompt', cmd: 'whoami' },
  { type: 'out', text: 'kishore_Selvaraj', cls: 'success' },
  { type: 'prompt', cmd: 'cat skills.json | head -5' },
  { type: 'out', text: '{ "stack": "FastAPI","MERN", "ai": true,', cls: '' },
  { type: 'out', text: '  "langs": ["Python","JS","C++"],', cls: '' },
  { type: 'out', text: '  "projects": 8, "passion": "∞" }', cls: 'highlight' },
  { type: 'prompt', cmd: 'git log --oneline -3' },
  { type: 'out', text: 'a3f92b1 feat: multimodel OCR pipeline', cls: '' },
  { type: 'out', text: 'c71d8e4 fix: stripe webhook handler', cls: '' },
  { type: 'out', text: 'f209a13 feat: offline py coach v2', cls: '' },
  { type: 'prompt', cmd: 'echo $STATUS' },
  { type: 'out', text: '✓ Available for opportunities', cls: 'success' },
];

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
    let timeouts = [];
    let elapsed = 1800;

    TERMINAL_LINES.forEach((line) => {
      const delay = line.type === 'prompt' ? 600 : 200;
      elapsed += delay;
      const t = setTimeout(() => {
        setLines((prev) => [...prev, line]);
      }, elapsed);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
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
