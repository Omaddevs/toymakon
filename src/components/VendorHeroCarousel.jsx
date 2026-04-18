import { useCallback, useEffect, useState } from 'react';

const TRANSITION_MS = 380;
const AUTO_SLIDE_MS = 5200;

export default function VendorHeroCarousel({ images, badge, name }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = images.length;

  const go = useCallback(
    (i) => {
      setIndex(((i % n) + n) % n);
    },
    [n]
  );

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % n);
  }, [n]);

  const onCarouselKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  useEffect(() => {
    if (n <= 1) return undefined;
    if (paused) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, AUTO_SLIDE_MS);
    return () => window.clearInterval(id);
  }, [n, paused]);

  if (!images.length) return null;

  if (n === 1) {
    return (
      <div className="vendor-hero vendor-hero--single">
        <img src={images[0]} alt={name} />
        {badge ? <span className="vendor-hero-badge">{badge}</span> : null}
      </div>
    );
  }

  return (
    <div
      className="vendor-hero vendor-hero--slider"
      aria-roledescription="carousel"
      aria-label="Rasmlar"
      tabIndex={0}
      onKeyDown={onCarouselKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="vendor-hero-viewport">
        <div
          className="vendor-hero-track"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          {images.map((src, i) => (
            <div key={src + i} className="vendor-hero-slide">
              <img src={src} alt={i === 0 ? name : ''} loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="vendor-hero-nav vendor-hero-nav--prev"
        aria-label="Oldingi rasm"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
      >
        <i className="ph ph-caret-left" aria-hidden />
      </button>
      <button
        type="button"
        className="vendor-hero-nav vendor-hero-nav--next"
        aria-label="Keyingi rasm"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
      >
        <i className="ph ph-caret-right" aria-hidden />
      </button>
      {badge && index === 0 ? <span className="vendor-hero-badge">{badge}</span> : null}
      <div className="vendor-hero-dots" role="tablist" aria-label="Slayd">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${i + 1}-rasm`}
            className={`vendor-hero-dot ${i === index ? 'is-active' : ''}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
