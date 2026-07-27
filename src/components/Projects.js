import React, { useEffect, useRef } from 'react';
import './Projects.css';

const PROJECTS = [
  {
    num: '01 — FEATURED',
    icon: '🚀',
    title: 'SaaS Product Platform',
    desc: 'A production-ready multi-tenant SaaS with workspace-scoped data isolation, Stripe-powered subscription tiers (trial → pro → team), invite-based team collaboration, and a plugin dashboard where users add integrations without redeploying. Ships with usage metering, audit logs, and a self-serve admin panel — the boilerplate I wish I had when starting my first SaaS.',
    tags: ['Next.js', 'FastAPI', 'PostgreSQL', 'Stripe', 'Multi-tenant', 'Docker'],
    category: 'SaaS / Full Stack',
    featured: true,
    image: '/projects/saas.png',
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '02 — FEATURED',
    icon: '🤖',
    title: 'AgentOS',
    desc: 'A runtime for building and orchestrating LLM agents — pluggable tool registry, shared memory across agents, a planner that decomposes goals into sub-tasks, and streaming multi-agent workflows over WebSockets. Model-agnostic (OpenAI, Claude, local Llama), with built-in RAG, function-calling, and a trace viewer to debug every step an agent took.',
    tags: ['Python', 'LangGraph', 'FastAPI', 'Vector DB', 'Streaming', 'Multi-Agent'],
    category: 'AI / Agentic Systems',
    featured: true,
    image: '/projects/agentos.png',
    link: 'https://github.com/kishorevijay07',
  },
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
    desc: 'An advanced OCR system that dynamically combines multiple models to extract text from noisy, low-quality, and mixed-format documents. Handles PDFs, images, and structured documents with a multi-stage post-processing pipeline.',
    tags: ['Python', 'OpenCV', 'Tesseract', 'Deep Learning', 'Node.js'],
    category: 'AI + Full Stack',
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '05',
    icon: '🤖',
    title: 'Offline Py Pro Coach',
    desc: 'A fully offline AI-powered coding assistant for Python developers. Provides code suggestions, debugging help, and concept explanations — no internet required. Optimized for low-connectivity environments.',
    tags: ['Python', 'Local LLM', 'NLP', 'CLI/GUI'],
    category: 'AI / Offline',
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '06',
    icon: '📋',
    title: 'Attendance Digital System',
    desc: 'Comprehensive MERN-based college attendance management. Handles staff-subject allocation, batch/department filtering, and complex schema relationships with ObjectId — replacing manual tracking entirely.',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
    category: 'MERN',
    link: 'https://github.com/kishorevijay07',
  },
];

function ProjectCard({ project, delay }) {
  const ref = useRef(null);
  const [imgOk, setImgOk] = React.useState(!!project.image);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`project-card reveal ${project.featured ? 'featured' : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {project.image && imgOk && (
        <div className="project-shot">
          <img
            src={`${process.env.PUBLIC_URL}${project.image}`}
            alt={`${project.title} screenshot`}
            onError={() => setImgOk(false)}
            loading="lazy"
          />
          <span className="project-shot-overlay" aria-hidden="true" />
        </div>
      )}
      <span className="project-num">{project.num}</span>
      <div className="project-icon">{project.icon}</div>
      <div className="project-title">{project.title}</div>
      <p className="project-desc">{project.desc}</p>
      <div className="project-tags">
        {project.tags.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      <div className="project-footer">
        <a
          href={project.link}
          className="project-link"
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub <span className="project-arrow">→</span>
        </a>
        <span className="project-cat">{project.category}</span>
      </div>
    </div>
  );
}

export default function Projects() {
  const headerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      },
      { threshold: 0.2 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" className="projects-section">
      <div ref={headerRef} className="section-header reveal">
        <span className="section-tag">What I've Built</span>
        <h2 className="section-title">
          Featured <span>Projects</span>
        </h2>
        <div className="section-line" />
      </div>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.title} project={p} delay={i * 0.08} />
        ))}
      </div>
    </section>
  );
}
