import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsRow from './components/StatsRow';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ChatWidget from './components/Assistant/ChatWidget';

function App() {
  return (
    <>
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
      <ChatWidget />
    </>
  );
}

export default App;
