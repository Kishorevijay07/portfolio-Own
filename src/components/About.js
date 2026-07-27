import React, { useEffect, useRef } from 'react';
import './About.css';

/* ── Reusable scroll-reveal hook ── */
export function useReveal() {
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

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className="info-val">{value}</span>
    </div>
  );
}

export default function About() {
  const leftRef  = useReveal();
  const rightRef = useReveal();

  return (
    <section id="about" className="about-section">
      <div className="about-grid">
        {/* Text */}
        <div ref={leftRef} className="reveal about-text-col">
          <div className="section-header">
            <span className="section-tag">Who I Am</span>
            <h2 className="section-title">
              Building the <span>Future</span>,<br />
              One Commit at a Time
            </h2>
            <div className="section-line" />
          </div>
          <div className="about-text">
            <p>
              I'm <strong>Kishore Selvaraj</strong>, a developer pursuing an Integrated
              M.Sc. in Information Technology at CEG. I specialize in full-stack
              development with the MERN stack and love building systems that bridge
              real-world usability with scalable architecture.
            </p>
            <p>
              My work spans <strong>web applications</strong>,{' '}
              <strong>AI/ML pipelines</strong>, and{' '}
              <strong>data-driven platforms</strong>. Whether it's digitizing
              attendance systems or designing intelligent coding assistants — I focus
              on solving real problems.
            </p>
            <p>
              I believe in <strong>practical implementation over theory</strong>, and I
              continuously push myself to integrate new technologies into meaningful
              software.
            </p>
          </div>
          <div className="about-info-grid">
            <InfoItem label="Degree"   value="Integrated M.Sc. IT" />
            <InfoItem label="College"  value="CEG, Anna University" />
            <InfoItem label="Location" value="Chennai, Tamil Nadu" />
            <InfoItem label="Focus"    value="FullStack + AI/ML" />
          </div>
        </div>

        {/* Avatar */}
        <div ref={rightRef} className="reveal avatar-col">
          <div className="about-avatar">
            <div className="avatar-ring2" />
            <div className="avatar-ring" />
            <div className="avatar-hex">
              <img className="avatar-img" src={`${process.env.PUBLIC_URL}/kishore.jpg`} alt="Kishore Selvaraj" />
            </div>
            <div className="avatar-dot" />
          </div>
        </div>
      </div>
    </section>
  );
}
