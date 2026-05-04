import React, { useState, useEffect, useRef, useCallback } from 'react';

const SLIDE_DURATION = 5000;

export default function HeroSlider({ slides = [] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const next = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides]);

  const go = (idx) => {
    clearInterval(timerRef.current);
    setCurrent(idx);
    timerRef.current = setInterval(next, SLIDE_DURATION);
  };

  useEffect(() => {
    if (!slides || slides.length < 2) return;
    timerRef.current = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(timerRef.current);
  }, [next, slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1)    translateX(0)    translateY(0); }
          50%  { transform: scale(1.08) translateX(-1%)  translateY(-1%); }
          100% { transform: scale(1.12) translateX(1%)   translateY(0.5%); }
        }
        @keyframes slideFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {slides.map((slide, i) => (
        <div
          key={slide.id || i}
          style={{
            position: 'absolute', inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        >
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${slide.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: i === current ? `kenBurns ${SLIDE_DURATION}ms ease-in-out forwards` : 'none',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(47,56,15,0.72) 0%, rgba(26,58,92,0.68) 55%, rgba(37,99,168,0.60) 100%)'
          }} />
        </div>
      ))}

      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              style={{
                width: i === current ? 24 : 8,
                height: 8, borderRadius: 4, border: 'none',
                cursor: 'pointer',
                background: i === current ? '#c8a951' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.3s ease', padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => go((current - 1 + slides.length) % slides.length)}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ‹
          </button>
          <button
            onClick={() => go((current + 1) % slides.length)}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ›
          </button>
        </>
      )}
    </div>
  );
}