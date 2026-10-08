import React, { useEffect, useRef, useState } from 'react';
import { sendContact } from '../lib/api';
import './Contact.css';

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

const EMPTY = { name: '', email: '', message: '' };

export default function Contact({ onNavigateResume }) {
  const headerRef = useReveal();
  const bodyRef = useReveal();
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const handleResumeClick = (e) => {
    if (onNavigateResume) {
      e.preventDefault();
      onNavigateResume();
    }
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (state === 'sending') return;
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all fields.');
      setState('error');
      return;
    }
    setState('sending');
    setError('');
    try {
      await sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setState('sent');
      setForm(EMPTY);
    } catch (err) {
      setError(err.message || 'Could not send. Please email me directly below.');
      setState('error');
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-inner">
        <div ref={headerRef} className="section-header reveal" style={{ textAlign: 'center' }}>
          <span className="section-tag">Let's Connect</span>
          <h2 className="section-title">
            Get In <span>Touch</span>
          </h2>
          <div className="section-line" />
        </div>

        <div ref={bodyRef} className="reveal contact-body">
          <p className="contact-desc">
            I'm open to new opportunities, collaborations, and interesting projects. Send a message
            and I'll get back to you.
          </p>

          {state === 'sent' ? (
            <div className="contact-success">
              ✅ Thanks! Your message has been sent — I'll reply soon.
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit} noValidate>
              <div className="form-row">
                <input
                  name="name"
                  className="form-input"
                  placeholder="Your name"
                  value={form.name}
                  onChange={onChange}
                  maxLength={120}
                />
                <input
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="Your email"
                  value={form.email}
                  onChange={onChange}
                  maxLength={200}
                />
              </div>
              <textarea
                name="message"
                className="form-input form-textarea"
                placeholder="Your message…"
                value={form.message}
                onChange={onChange}
                rows={4}
                maxLength={3000}
              />
              {state === 'error' && <div className="form-error">{error}</div>}
              <button type="submit" className="btn btn-primary contact-submit" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}

          <div className="contact-alt">
            <span>Or reach me directly</span>
            <a href="mailto:kishore.tech.codes@gmail.com" className="contact-email">
              kishore.tech.codes@gmail.com
            </a>
          </div>

          <div className="social-links">
            <a href="https://github.com/kishorevijay07" className="social-link" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://linkedin.com/" className="social-link" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a
              href="/resume"
              onClick={handleResumeClick}
              className="social-link social-link-accent"
            >
              Résumé ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
