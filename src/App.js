import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsRow from './components/StatsRow';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ChatWidget from './components/Assistant/ChatWidget';
import ResumePage from './components/Resume/ResumePage';

function getNormalizedPath() {
  const p = window.location.pathname.toLowerCase().replace(/\/$/, '');
  return p || '/';
}

function App() {
  const [currentPath, setCurrentPath] = useState(getNormalizedPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(getNormalizedPath());
    window.scrollTo(0, 0);
  };

  if (currentPath === '/resume') {
    return <ResumePage onNavigateHome={() => navigateTo('/')} />;
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero onNavigateResume={() => navigateTo('/resume')} />
        <StatsRow />
        <About />
        <Projects />
        <Skills />
        <Contact onNavigateResume={() => navigateTo('/resume')} />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

export default App;
