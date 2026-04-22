import React from 'react';
import Cursor from './components/Cursor';
import MatrixCanvas from './components/MatrixCanvas';
import Particles from './components/Particles';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsRow from './components/StatsRow';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Cursor />
      <MatrixCanvas />
      <Particles />
      <Navbar />
      <main>
        <Hero />
        <StatsRow />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
