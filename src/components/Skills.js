import React, { useEffect, useRef } from 'react';
import './Skills.css';

const SKILL_BARS = [
  {
    category: 'Programming',
    skills: [
      { name: 'Python', pct: 95 },
      { name: 'JavaScript', pct: 90 },
      { name: 'C++', pct: 75 },
    ],
  },
  {
    category: 'Web & Frontend',
    skills: [
      { name: 'React.js', pct: 90 },
      { name: 'HTML/CSS', pct: 88 },
      { name: 'Responsive Design', pct: 85 },
    ],
  },
  {
    category: 'Backend & Systems',
    skills: [
      { name: 'FastAPI', pct: 95 },
      { name: 'Node.js / Express', pct: 90 },
      { name: 'REST API Design', pct: 92 },
      { name: 'Scalable Systems', pct: 85 },
    ],
  },
];
const SKILL_BARS_RIGHT = [
  {
    category: 'Machine Learning & NLP',
    skills: [
      { name: 'Regression & Classification', pct: 90 },
      { name: 'Clustering', pct: 85 },
      { name: 'CNN / LSTM', pct: 80 },
      { name: 'BERT Fine-Tuning', pct: 88 },
      { name: 'NER & Text Classification', pct: 90 },
    ],
  },
  {
    category: 'Databases',
    skills: [
      { name: 'MongoDB', pct: 88 },
      { name: 'MySQL', pct: 80 },
      { name: 'Schema Design', pct: 85 },
    ],
  },

];

const TECH_BADGES = [
  'MLflow',
  'HuggingFace Transformers',
  'OpenCV',
  'Tesseract OCR',
  'EasyOCR',
  'Git & GitHub',
  'Postman',
  'Docker',
  'AWS',
];

function SkillBar({ name, pct }) {
  const fillRef = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          setTimeout(() => {
            if (fillRef.current) fillRef.current.style.width = pct + '%';
          }, 200);
        }
      },
      { threshold: 0.3 }
    );
    if (fillRef.current) observer.observe(fillRef.current);
    return () => observer.disconnect();
  }, [pct]);

  return (
    <div className="skill-bar-item">
      <div className="skill-bar-header">
        <span className="skill-name">{name}</span>
        <span className="skill-pct">{pct}%</span>
      </div>
      <div className="skill-bar-bg">
        <div ref={fillRef} className="skill-bar-fill" style={{ width: 0 }} />
      </div>
    </div>
  );
}

function SkillCategory({ category, skills }) {
  return (
    <div className="skill-category">
      <div className="skill-cat-title">{category}</div>
      {skills.map((s) => (
        <SkillBar key={s.name} name={s.name} pct={s.pct} />
      ))}
    </div>
  );
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('visible'); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Skills() {
  const headerRef = useReveal();
  const leftRef   = useReveal();
  const rightRef  = useReveal();

  return (
    <section id="skills" className="skills-section">
      <div ref={headerRef} className="section-header reveal">
        <span className="section-tag">Technical Arsenal</span>
        <h2 className="section-title">
          Skills &amp; <span>Technologies</span>
        </h2>
        <div className="section-line" />
      </div>

      <div className="skills-layout">
        {/* Left column */}
        <div ref={leftRef} className="reveal">
          {SKILL_BARS.map((cat) => (
            <SkillCategory key={cat.category} {...cat} />
          ))}
        </div>

        {/* Right column */}
        <div ref={rightRef} className="reveal">
          {SKILL_BARS_RIGHT.map((cat) => (
            <SkillCategory key={cat.category} {...cat} />
          ))}

          {/* DevOps badges */}
          <div className="skill-category">
            <div className="skill-cat-title">DevOps &amp; Tools</div>
            <div className="tech-cloud">
              {TECH_BADGES.map((b) => (
                <div key={b} className="tech-badge">
                  <div className="tech-dot" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
