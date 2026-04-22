import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Kishore Selvaraj — Built with passion &amp; precision</span>
      <span className="footer-right">Full Stack Developer • AI Engineer</span>
    </footer>
  );

}