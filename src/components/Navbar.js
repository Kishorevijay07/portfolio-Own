import React, { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="#home" className="nav-logo">
        KS<span>.dev</span>
      </a>
      <ul className="nav-links">
        {['about', 'projects', 'skills', 'contact'].map((s) => (
          <li key={s}>
            <a href={`#${s}`}>{s}</a>
          </li>
        ))}
      </ul>
      <div className="nav-status">
        <div className="status-dot" />
        Available for opportunities
      </div>
    </nav>
  );
}
