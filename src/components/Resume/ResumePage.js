import React from 'react';
import './ResumePage.css';

export default function ResumePage({ onNavigateHome }) {
  const resumePdfUrl = `${process.env.PUBLIC_URL}/resume.pdf`;
  const profilePicUrl = `${process.env.PUBLIC_URL}/kishore.jpg`;

  const handleBack = (e) => {
    if (onNavigateHome) {
      e.preventDefault();
      onNavigateHome();
    }
  };

  return (
    <div className="resume-page-wrapper">
      {/* Top Navigation */}
      <header className="resume-topbar">
        <div className="resume-topbar-inner">
          <a href="/" onClick={handleBack} className="resume-back-link">
            <span className="back-arrow">←</span> Back to Portfolio
          </a>
          <div className="resume-topbar-actions">
            <a
              href={resumePdfUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm"
              title="Open raw PDF in new browser tab"
            >
              Open Fullscreen ↗
            </a>
            <a
              href={resumePdfUrl}
              download="Kishore_Selvaraj_Resume.pdf"
              className="btn btn-primary btn-sm"
            >
              Download PDF ↓
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="resume-container">
        {/* Recruiter Header Card with Photo & Contact */}
        <section className="resume-profile-card">
          <div className="resume-photo-box">
            <img
              src={profilePicUrl}
              alt="Kishore Selvaraj"
              className="resume-photo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="resume-status-badge">
              <span className="status-dot"></span> Available for Hire
            </span>
          </div>

          <div className="resume-profile-info">
            <div className="resume-name-row">
              <h1 className="resume-name">Kishore Selvaraj</h1>
              <span className="resume-badge-role">Full-Stack &amp; AI/ML</span>
            </div>

            <p className="resume-headline">
              Integrated M.Sc. Information Technology • College of Engineering, Guindy (CEG), Anna University
            </p>

            <p className="resume-bio">
              Software engineer specializing in MERN stack, AI/ML pipelines, and scalable backend architecture. 
              Proven track record building real-world automation, agentic systems, and high-performance applications.
            </p>

            {/* Quick Contact & Social Links */}
            <div className="resume-links-row">
              <a
                href="mailto:kishore.tech.codes@gmail.com"
                className="resume-contact-pill"
                title="Send an email"
              >
                <span className="pill-icon">✉</span> kishore.tech.codes@gmail.com
              </a>
              <a
                href="https://github.com/kishorevijay07"
                target="_blank"
                rel="noreferrer"
                className="resume-contact-pill"
                title="View GitHub"
              >
                <span className="pill-icon">💻</span> github.com/kishorevijay07
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="resume-contact-pill"
                title="View LinkedIn"
              >
                <span className="pill-icon">💼</span> LinkedIn Profile
              </a>
              <span className="resume-contact-pill pill-neutral">
                <span className="pill-icon">📍</span> Chennai, Tamil Nadu, India
              </span>
            </div>
          </div>
        </section>

        {/* Action Bar Above Viewer */}
        <div className="resume-toolbar">
          <div className="resume-toolbar-left">
            <span className="toolbar-tag">DOCUMENT PREVIEW</span>
            <span className="toolbar-title">Curriculum Vitae / Resume</span>
          </div>
          <div className="resume-toolbar-right">
            <a
              href={resumePdfUrl}
              download="Kishore_Selvaraj_Resume.pdf"
              className="btn btn-primary"
            >
              Download PDF ↓
            </a>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="resume-viewer-card">
          <object
            data={`${resumePdfUrl}#toolbar=1&navpanes=0`}
            type="application/pdf"
            className="resume-pdf-embed"
            title="Kishore Selvaraj Resume PDF"
          >
            {/* Fallback for devices / browsers that don't support inline PDF objects */}
            <div className="resume-viewer-fallback">
              <div className="fallback-content">
                <span className="fallback-icon">📄</span>
                <h3>Resume Document Ready</h3>
                <p>
                  Your browser does not support inline PDF previews. You can view or download the resume directly below:
                </p>
                <div className="fallback-actions">
                  <a
                    href={resumePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost"
                  >
                    Open in New Tab ↗
                  </a>
                  <a
                    href={resumePdfUrl}
                    download="Kishore_Selvaraj_Resume.pdf"
                    className="btn btn-primary"
                  >
                    Download PDF Document ↓
                  </a>
                </div>
              </div>
            </div>
          </object>
        </div>
      </main>

      {/* Footer */}
      <footer className="resume-footer">
        <p>© {new Date().getFullYear()} Kishore Selvaraj • Built with React &amp; passion</p>
        <a href="/" onClick={handleBack} className="footer-return-link">
          ← Back to Portfolio Home
        </a>
      </footer>
    </div>
  );
}
