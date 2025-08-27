// src/components/HeroCarousel.jsx
import { useEffect, useRef, useState } from "react";

export default function HeroCarousel({
  slides = [],
  height = 360,
  auto = true,
  delay = 5000,
}) {
  const [i, setI] = useState(0);
  const timer = useRef(null);

  const go = (n) => setI((p) => (n + slides.length) % slides.length);
  const next = () => go(i + 1);

  useEffect(() => {
    if (!auto || slides.length < 2) return;
    timer.current = setTimeout(next, delay);
    return () => clearTimeout(timer.current);
  }, [i, auto, delay, slides.length]);

  if (!slides.length) return null;

  return (
    <div className="hero" style={{ height }}>
      <div
        className="hero__track"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {slides.map((s, idx) => (
          <div className="hero__slide" key={idx}>
            <img
              src={s.image}
              alt={s.title || "slide"}
              className="hero__image"
            />
            <div className="hero__overlay" />
            {(s.title || s.subtitle) && (
              <div className="hero__content">
                {s.title && <div className="hero__title">{s.title}</div>}
                {s.subtitle && (
                  <div className="hero__subtitle">{s.subtitle}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="hero__nav hero__nav--left" onClick={() => go(i - 1)}>
        ‹
      </button>
      <button className="hero__nav hero__nav--right" onClick={() => go(i + 1)}>
        ›
      </button>

      <div className="hero__dots">
        {slides.map((_, d) => (
          <button
            key={d}
            className={`hero__dot ${d === i ? "is-active" : ""}`}
            onClick={() => go(d)}
          />
        ))}
      </div>
    </div>
  );
}
