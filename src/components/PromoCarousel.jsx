import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPromoPosts, recordPromoView } from '../utils/promoApi';

const SLIDE_MS = 5500;
const TRANSITION_MS = 600;

function sortSlides(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export default function PromoCarousel() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const n = Math.max(slides.length, 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPromoPosts()
      .then((rows) => {
        if (!cancelled) setSlides(sortSlides(rows ?? []));
      })
      .catch(() => {
        if (!cancelled) setSlides([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const go = useCallback(
    (i) => {
      setIndex(((i % n) + n) % n);
    },
    [n]
  );

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return undefined;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const onNavigateSlide = useCallback(
    (path, slug) => {
      if (slug) {
        recordPromoView(slug).catch(() => {});
      }
      navigate(path);
    },
    [navigate]
  );

  if (loading) {
    return (
      <div className="promo-carousel" aria-label="Reklama bannerlari">
        <p className="muted-text" style={{ padding: '24px 16px' }}>
          Yuklanmoqda…
        </p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="promo-carousel" aria-label="Reklama bannerlari">
        <p className="muted-text" style={{ padding: '24px 16px' }}>
          Ma’lumotlar hozircha yo‘q
        </p>
      </div>
    );
  }

  return (
    <div className="promo-carousel" aria-roledescription="carousel" aria-label="Reklama bannerlari">
      <div className="promo-carousel-viewport">
        <div
          className="promo-carousel-track"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          {slides.map((slide, i) => {
            return (
              <div key={slide.slug || slide.path + i} className="promo-carousel-slide" aria-hidden={i !== index}>
                <div className="banner-card">
                  <div className="banner-content">
                    <span className="banner-badge">{slide.badge}</span>
                    <h3>{slide.title}</h3>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => onNavigateSlide(slide.path, slide.slug)}
                    >
                      Ko‘rish <i className="ph ph-arrow-right"></i>
                    </button>
                  </div>
                  <div
                    className="banner-bg"
                    style={{ backgroundImage: `url(${slide.background_url})` }}
                    role="presentation"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="promo-carousel-dots" role="tablist" aria-label="Slaydlar">
        {slides.map((s, i) => (
          <button
            key={s.slug || i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${i + 1}-slayd`}
            className={`promo-carousel-dot ${i === index ? 'is-active' : ''}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
