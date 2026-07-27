import React, { useEffect, useRef } from 'react';
import './Skills.css';

const PROFICIENCY = [
  {
    level: 'Core',
    hint: 'daily-driver stack — shipped production work with these',
    groups: [
      {
        category: 'Languages',
        skills: ['Python', 'JavaScript / TypeScript'],
      },
      {
        category: 'Frontend',
        skills: ['React.js', 'Next.js', 'Tailwind CSS', 'Responsive Design'],
      },
      {
        category: 'Backend',
        skills: ['FastAPI', 'Node.js / Express', 'REST APIs', 'WebSockets'],
      },
      {
        category: 'AI / LLM',
        skills: [
          'LangChain / LangGraph',
          'RAG Pipelines',
          'Prompt Engineering',
          'OpenAI API',
          'Anthropic Claude',
        ],
      },
      {
        category: 'Databases',
        skills: ['PostgreSQL', 'MongoDB', 'Schema Design'],
      },
    ],
  },
  {
    level: 'Comfortable',
    hint: 'used in real projects, reach for these often',
    groups: [
      {
        category: 'AI / ML',
        skills: [
          'BERT Fine-Tuning',
          'HuggingFace Transformers',
          'Vector DBs (Pinecone, Chroma)',
          'Function Calling / Tool Use',
          'NER & Text Classification',
        ],
      },
      {
        category: 'SaaS & Infra',
        skills: [
          'Multi-tenant Architecture',
          'Stripe Billing',
          'Redis / Caching',
          'Docker',
          'GitHub Actions',
        ],
      },
      {
        category: 'Tooling',
        skills: ['Git', 'Postman', 'Vercel', 'AWS (EC2, S3)'],
      },
    ],
  },
  {
    level: 'Learning',
    hint: 'actively going deeper on these',
    groups: [
      {
        category: 'Currently exploring',
        skills: [
          'Kubernetes',
          'gRPC',
          'Rust',
          'Fine-tuning open-source LLMs',
          'Observability (OpenTelemetry)',
        ],
      },
    ],
  },
];

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function ProficiencyBlock({ level, hint, groups }) {
  const ref = useReveal();
  const levelClass = level.toLowerCase();
  return (
    <div ref={ref} className={`prof-block reveal prof-${levelClass}`}>
      <div className="prof-header">
        <span className={`prof-badge prof-badge-${levelClass}`}>{level}</span>
        <span className="prof-hint">{hint}</span>
      </div>
      <div className="prof-groups">
        {groups.map((g) => (
          <div key={g.category} className="prof-group">
            <div className="prof-group-title">{g.category}</div>
            <div className="pill-cloud">
              {g.skills.map((s) => (
                <span key={s} className="pill">
                  <span className="pill-dot" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const headerRef = useReveal();

  return (
    <section id="skills" className="skills-section">
      <div ref={headerRef} className="section-header reveal">
        <span className="section-tag">Technical Arsenal</span>
        <h2 className="section-title">
          Skills &amp; <span>Technologies</span>
        </h2>
        <div className="section-line" />
      </div>

      <div className="prof-stack">
        {PROFICIENCY.map((p) => (
          <ProficiencyBlock key={p.level} {...p} />
        ))}
      </div>
    </section>
  );
}
