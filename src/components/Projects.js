import React, { useEffect, useRef } from 'react';
import './Projects.css';

const PROJECTS = [
  {
    num: '01 — FEATURED',
    icon: '🔬',
    title: 'Multimodel OCR System',
    desc: 'An advanced OCR system that dynamically combines multiple models to extract text from noisy, low-quality, and mixed-format documents. Handles PDFs, images, and structured documents with a multi-stage post-processing pipeline.',
    tags: ['Python', 'OpenCV', 'Tesseract', 'Deep Learning', 'Node.js'],
    category: 'AI + Full Stack',
    featured: true,
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '02',
    icon: '🤖',
    title: 'Offline Py Pro Coach',
    desc: 'A fully offline AI-powered coding assistant for Python developers. Provides code suggestions, debugging help, and concept explanations — no internet required. Optimized for low-connectivity environments.',
    tags: ['Python', 'Local LLM', 'NLP', 'CLI/GUI'],
    category: 'AI / Offline',
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '03',
    icon: '📋',
    title: 'Attendance Digital System',
    desc: 'Comprehensive MERN-based college attendance management. Handles staff-subject allocation, batch/department filtering, and complex schema relationships with ObjectId — replacing manual tracking entirely.',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
    category: 'MERN',
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '04',
    icon: '⚡',
    title: 'EV Charging Booking System',
    desc: 'Map-based EV charging station discovery, slot booking, and secure Stripe payment integration. Includes booking history tracking and complex pricing logic with webhook handling.',
    tags: ['React (Vite)', 'Stripe', 'Leaflet', 'MongoDB'],
    category: 'MERN + Payments',
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '05',
    icon: '🏠',
    title: 'Airbnb-style Room Booking',
    desc: 'Full-stack booking platform with image upload via Cloudinary, dynamic pricing, search & filtering, and Stripe payments. Async data handled with React Query for optimized performance.',
    tags: ['React', 'Cloudinary', 'Stripe', 'React Query'],
    category: 'Full Stack',
    link: 'https://github.com/kishorevijay07',
  },
  {
    num: '06',
    icon: '📊',
    title: 'ML Prediction Models',
    desc: 'Collection of machine learning models: food delivery time prediction, book sales forecasting, and stock price prediction. Built with real datasets and production-ready preprocessing pipelines.',
    tags: ['Python', 'Scikit-learn', 'Pandas', 'ML'],
    category: 'Machine Learning',
    link: 'https://github.com/kishorevijay07',
  },
];

function ProjectCard({ project, delay }) {
  const ref = useRef(null);

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
