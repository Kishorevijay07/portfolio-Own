import React, { useMemo } from 'react';

export default function Particles() {
  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      drift: (Math.random() - 0.5) * 100,
      duration: 8 + Math.random() * 12,
      delay: -(Math.random() * 20),
    }));
  }, []);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            width: 2,
            height: 2,
            background: 'var(--green)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 1,
            left: `${p.left}%`,
            opacity: 0,
            animation: `floatParticle ${p.duration}s ${p.delay}s linear infinite`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </>
  );
}
