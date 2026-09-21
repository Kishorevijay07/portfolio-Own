import React, { useEffect, useState } from 'react';
import './Hero.css';

const ROLES = [
  'AI/ML Engineer',
  'SaaS Builder',
  'Agentic Systems Developer',
  'Full Stack Architect',
  'Problem Solver',
];

const HERO_TAGS = ['AI / ML', 'Full Stack', 'Agentic Systems', 'SaaS'];

function useTypingEffect() {
  const [charIdx, setCharIdx] = useState(0);
  const [roleIdx, setRoleIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = ROLES[roleIdx];
    let timeout;
    if (!isDeleting) {
      if (charIdx < current.length) {
        timeout = setTimeout(() => setCharIdx((c) => c + 1), 85);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 1800);
      }
    } else if (charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), 45);
    } else {
      setIsDeleting(false);
      setRoleIdx((r) => (r + 1) % ROLES.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, roleIdx]);

  return ROLES[roleIdx].slice(0, charIdx);
}

export default function Hero() {
  const typedText = useTypingEffect();

  return (
    <section className="hero" id="home">
      <div className="hero-inner">
        {/* Photo */}
        <div className="hero-photo-col">
          <div className="hero-photo-frame">
            <img
              src={`${process.env.PUBLIC_URL}/kishore.jpg`}
              alt="Kishore Selvaraj"
              className="hero-photo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="hero-photo-badge">
            <span className="hero-badge-dot" />
            Available for work
          </div>
        </div>

        {/* Intro */}
        <div className="hero-content">
          <span className="hero-eyebrow">Full Stack Developer &amp; AI Engineer</span>
          <h1 className="hero-name">
            Hello, I am <span>Kishore Selvaraj</span>.
          </h1>
          <p className="hero-role">
            I build&nbsp;
            <span className="hero-role-typed">{typedText}</span>
            <span className="typed-cursor">|</span>
          </p>
          <p className="hero-desc">
            Integrated M.Sc. IT student at College of Engineering, Guindy. I build{' '}
            <strong>scalable systems</strong> that merge real-world usability with powerful
            backend architecture — from OCR pipelines to AI coding assistants.
          </p>
          <div className="hero-btns">
            <a href="#projects" className="btn btn-primary">
              View Projects
            </a>
            <a
              href={`${process.env.PUBLIC_URL}/resume.pdf`}
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
            >
              Résumé ↓
            </a>
            <a href="#contact" className="btn btn-ghost">
              Say Hello
            </a>
          </div>
          <div className="hero-tags">
            {HERO_TAGS.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
