import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategoryBySlug, getVendorsByCategoryId, VENDORS } from '../data/catalog';

const SLIDE_MS = 5500;
const TRANSITION_MS = 600;

/** API ishlamasa — statik fallback (slug backend seed bilan mos) */
const FALLBACK_SLIDES = [
  {
    slug: 'banner-toyxona',
    badge: 'Yangi mavsum',
    title: '2026 mavsum uchun eng yaxshi to‘yxonalar',
    path: '/category/toyxona',
    background_url:
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    sort_order: 0,
  },
  {
    slug: 'banner-fotostudio',
    badge: 'FotoStudio',
    title: 'To‘y va love story — professional foto va video',
    path: '/category/fotostudio',
    background_url:
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    sort_order: 1,
  },
  {
    slug: 'banner-marry-me',
    badge: 'Marry me',
    title: 'Romantik taklif joylari va maxsus bezatish',
    path: '/category/marry-me',
    background_url:
      'https://images.unsplash.com/photo-1522673607200-164506f2ce48?auto=format&fit=crop&w=800&q=80',
    sort_order: 2,
  },
  {
    slug: 'banner-katalog',
    badge: 'Katalog',
    title: 'Barcha xizmatlar — bitta ilovada',
    path: '/category',
    background_url:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    sort_order: 3,
  },
];

function sortSlides(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export default function PromoCarousel() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const n = slides.length;



  const go = useCallback(
    (i) => {
      setIndex(((i % n) + n) % n);
    },
    [n]
  );

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, SLIDE_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [n]);
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
                    <button type="button" className="btn-primary" onClick={() => navigate(slide.path)}>
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
