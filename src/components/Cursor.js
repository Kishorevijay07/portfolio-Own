import React, { useEffect, useRef } from 'react';

const styles = {
  cursor: {
    position: 'fixed',
    width: 12,
    height: 12,
    background: 'var(--green)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 9999,
    transition: 'transform 0.1s',
    boxShadow: '0 0 12px var(--green), 0 0 24px rgba(0,255,136,0.4)',
    transform: 'translate(-50%, -50%)',
  },
  trail: {
    position: 'fixed',
    width: 30,
    height: 30,
    border: '1px solid rgba(0,255,136,0.4)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 9998,
    transition: 'left 0.12s ease, top 0.12s ease',
    transform: 'translate(-50%, -50%)',
  },
};

export default function Cursor() {
  const cursorRef = useRef(null);
  const trailRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return;

    const onMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top = e.clientY + 'px';
      }
      if (trailRef.current) {
        trailRef.current.style.left = e.clientX + 'px';
        trailRef.current.style.top = e.clientY + 'px';
      }
    };

    const onDown = () => {
      if (cursorRef.current)
        cursorRef.current.style.transform = 'translate(-50%,-50%) scale(1.8)';
    };
    const onUp = () => {
      if (cursorRef.current)
        cursorRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth <= 768) return null;

  return (
    <>
      <div ref={cursorRef} style={styles.cursor} />
      <div ref={trailRef} style={styles.trail} />
    </>
  );
}
