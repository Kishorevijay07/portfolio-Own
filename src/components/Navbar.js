import React, { useState, useEffect } from 'react';
import './Navbar.css';

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openAssistant = () => {
    window.dispatchEvent(new CustomEvent('open-assistant'));
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="#home" className="nav-logo">
        Kishore<span>.</span>
      </a>
      <ul className="nav-links">
        {LINKS.map((l) => (
          <li key={l.id}>
            <a href={`#${l.id}`}>{l.label}</a>
          </li>
        ))}
      </ul>
      <button type="button" className="nav-cta" onClick={openAssistant}>
        <span className="nav-cta-spark">✦</span> Ask AI
      </button>
    </nav>
  );
}
