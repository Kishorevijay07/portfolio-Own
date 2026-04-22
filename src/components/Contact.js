import React, { useEffect, useRef } from 'react';
import './Contact.css';

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

export default function Contact() {
  const headerRef = useReveal();
  const bodyRef   = useReveal();

  return (
    <section id="contact" className="contact-section">
      <div className="contact-inner">
        <div ref={headerRef} className="section-header reveal" style={{ textAlign: 'center' }}>
          <span className="section-tag" style={{ display: 'block', textAlign: 'center' }}>
            Let's Connect
          </span>
          <h2 className="section-title">
            Get In <span>Touch</span>
          </h2>
          <div className="section-line" style={{ margin: '20px auto 0' }} />
        </div>

        <div ref={bodyRef} className="reveal contact-body">
          <p className="contact-desc">
            I'm currently open to new opportunities, collaborations, and interesting
            projects. Drop me a message and let's build something remarkable together.
          </p>

          {/* ── Replace with your real email ── */}
          <a href="mailto:kishore.tech.codes@gmail.com" className="contact-email">
            kishore.tech.codes@gmail.com
          </a>

          <div className="social-links">
            <a
              href="https://github.com/kishorevijay07"
              className="social-link"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            {/* ── Replace # with your real LinkedIn / Twitter URLs ── */}
            <a href="#" className="social-link">LinkedIn</a>
            <a href="#" className="social-link">Twitter</a>
          </div>
        </div>
      </div>
    </section>
  );
}
