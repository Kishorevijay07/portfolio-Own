import React, { useEffect, useRef } from 'react';
import './Projects.css';

const FEATURED_PROJECTS = [
  {
    num: '01',
    icon: '🚀',
    title: 'SaaS Product Platform',
    desc: 'A production-ready multi-tenant SaaS with workspace-scoped data isolation, Stripe-powered subscription tiers (trial → pro → team), invite-based team collaboration, and a plugin dashboard. Ships with usage metering, audit logs, and a self-serve admin panel.',
    tags: ['Next.js', 'FastAPI', 'PostgreSQL', 'Stripe', 'Multi-tenant', 'Docker'],
    category: 'SaaS / Full Stack',
    image: '/projects/saas.png',
    link: 'https://github.com/kishorevijay07',
    badge: 'FEATURED',
  },
  {
    num: '02',
    icon: '🤖',
    title: 'AgentOS',
    desc: 'A runtime for building and orchestrating LLM agents — pluggable tool registry, shared memory across agents, a planner that decomposes goals into sub-tasks, and streaming multi-agent workflows over WebSockets. Model-agnostic with built-in RAG.',
    tags: ['Python', 'LangGraph', 'FastAPI', 'Vector DB', 'Streaming', 'Multi-Agent'],
    category: 'AI / Agentic Systems',
    image: '/projects/agentos.png',
    link: 'https://github.com/kishorevijay07',
    badge: 'FEATURED',
  },
];

const OTHER_PROJECTS = [
  {
    num: '03',
    icon: '🧠',
    title: 'Multimodel Agent',
    desc: 'A comprehensive AI agent built with FastAPI, integrating a RAG pipeline, orchestrator, and chat services for dynamic, multi-model interactions and decision making.',
    tags: ['Python', 'FastAPI', 'LLMs', 'RAG'],
    category: 'AI Backend',
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '04',
    icon: '🔬',
    title: 'Multimodel OCR System',
    desc: 'An advanced OCR system that dynamically combines multiple models to extract text from noisy, low-quality, and mixed-format documents with multi-stage post-processing.',
    tags: ['Python', 'OpenCV', 'Tesseract', 'Deep Learning'],
    category: 'AI + Full Stack',
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '05',
    icon: '💻',
    title: 'Offline Py Pro Coach',
    desc: 'A fully offline AI-powered coding assistant for Python developers. Code suggestions, debugging help, and concept explanations — no internet required.',
    tags: ['Python', 'Local LLM', 'NLP', 'CLI/GUI'],
    category: 'AI / Offline',
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '06',
    icon: '📋',
    title: 'Attendance Digital System',
    desc: 'Comprehensive MERN-based college attendance management. Handles staff-subject allocation, batch/department filtering, and complex schema relationships.',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
    category: 'MERN Stack',
    link: 'https://github.com/kishorevijay07',
  },
];

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('visible'); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

function FeaturedCard({ project, reverse }) {
  const ref = useReveal(0.1);
  const [imgOk, setImgOk] = React.useState(true);

  return (
    <div ref={ref} className={`featured-card reveal ${reverse ? 'reverse' : ''}`}>
      {/* Image Panel */}
      <div className="featured-image-panel">
        <div className="featured-badge">{project.badge}</div>
        {imgOk ? (
          <img
            src={`${process.env.PUBLIC_URL}${project.image}`}
            alt={project.title}
            onError={() => setImgOk(false)}
            loading="lazy"
          />
        ) : (
          <div className="featured-img-fallback">
            <span>{project.icon}</span>
          </div>
        )}
        <div className="featured-img-overlay" />
      </div>

      {/* Info Panel */}
      <div className="featured-info-panel">
        <span className="project-num-label">Project {project.num}</span>
        <div className="featured-icon-wrap">
          <span>{project.icon}</span>
        </div>
        <h3 className="featured-title">{project.title}</h3>
        <p className="featured-desc">{project.desc}</p>
        <div className="project-tags">
          {project.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <div className="featured-footer">
          <a href={project.link} className="project-link" target="_blank" rel="noreferrer">
            View on GitHub <span className="project-arrow">→</span>
          </a>
          <span className="project-cat">{project.category}</span>
        </div>
      </div>
    </div>
  );
}

function SmallCard({ project, delay }) {
  const ref = useReveal(0.1);

  return (
    <div
      ref={ref}
      className="small-card reveal"
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="small-card-top">
        <span className="small-num">{project.num}</span>
        <div className="small-icon">{project.icon}</div>
      </div>
      <h4 className="small-title">{project.title}</h4>
      <p className="small-desc">{project.desc}</p>
      <div className="project-tags">
        {project.tags.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      <div className="small-footer">
        <a href={project.link} className="project-link" target="_blank" rel="noreferrer">
          GitHub <span className="project-arrow">→</span>
        </a>
        <span className="project-cat">{project.category}</span>
      </div>
    </div>
  );
}

export default function Projects() {
  const headerRef = useReveal(0.2);
  const otherHeaderRef = useReveal(0.2);

  return (
    <section id="projects" className="projects-section">
      {/* Header */}
      <div ref={headerRef} className="section-header reveal">
        <span className="section-tag">What I've Built</span>
        <h2 className="section-title">
          Featured <span>Projects</span>
        </h2>
        <div className="section-line" />
      </div>

      {/* Featured Projects — large cards */}
      <div className="featured-list">
        {FEATURED_PROJECTS.map((p, i) => (
          <FeaturedCard key={p.title} project={p} reverse={i % 2 === 1} />
        ))}
      </div>

      {/* Other Projects */}
      <div ref={otherHeaderRef} className="other-header reveal">
        <span className="section-tag">More Work</span>
        <h3 className="other-title">Other <span>Projects</span></h3>
      </div>
      <div className="small-grid">
        {OTHER_PROJECTS.map((p, i) => (
          <SmallCard key={p.title} project={p} delay={i * 0.08} />
        ))}
      </div>
    </section>
  );
}
