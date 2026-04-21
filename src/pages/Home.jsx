import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PromoCarousel from '../components/PromoCarousel';
import CategoryIcon from '../components/CategoryIcon';
import AuthGateSheet from '../components/AuthGateSheet';
import { useAuth } from '../context/AuthContext';
import { useNotificationInbox } from '../context/NotificationInboxContext';
import { fetchHome, fetchVendors } from '../utils/catalogApi';
import { isFavorite, toggleFavorite } from '../utils/favoritesStorage';

const EMPTY_MSG = 'Ma’lumotlar hozircha yo‘q';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount, openInbox, highlightNew } = useNotificationInbox();
  const [favTick, setFavTick] = useState(0);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateHint, setAuthGateHint] = useState('');
  const afterAuthRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [home, setHome] = useState(null);
  const [vendorsByCategory, setVendorsByCategory] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([fetchHome(), fetchVendors()])
      .then(([h, vendors]) => {
        if (cancelled) return;
        setHome(h);
        const map = {};
        for (const v of vendors) {
          const k = v.categoryId;
          if (!map[k]) map[k] = [];
          map[k].push(v);
        }
        setVendorsByCategory(map);
      })
      .catch(() => {
        if (!cancelled) setError('Serverga ulanib bo‘lmadi. Backend ishlamoqdamimi?');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allCategories = useMemo(() => {
    if (!home) return [];
    const p = home.categories_primary ?? [];
    const e = home.categories_extra ?? [];
    return [...p, ...e];
  }, [home]);

  const venueSlug = useMemo(() => allCategories.find((c) => c.id === 'venue')?.slug ?? null, [allCategories]);

  const topVenues = home?.top_venues ?? [];
  const recommended = home?.recommended ?? [];

  useEffect(() => {
    const fn = () => setFavTick((t) => t + 1);
    window.addEventListener('toymakon-favorites', fn);
    return () => window.removeEventListener('toymakon-favorites', fn);
  }, []);

  const openNotifications = () => {
    if (!user) {
      afterAuthRef.current = () => openInbox();
      setAuthGateHint('Bildirishnomalarni ko‘rish uchun tizimga kiring yoki ro‘yxatdan o‘ting.');
      setAuthGateOpen(true);
      return;
    }
    openInbox();
  };

  const handleLikeClick = (e, vendorId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      afterAuthRef.current = () => {
        toggleFavorite(vendorId);
        setFavTick((t) => t + 1);
      };
      setAuthGateHint("Sevimlilarga qo'shish va like uchun avval tizimga kiring yoki ro'yxatdan o'ting.");
      setAuthGateOpen(true);
      return;
    }
    toggleFavorite(vendorId);
    setFavTick((t) => t + 1);
  };

  const viewCount = (v) => (typeof v.reviewCount === 'number' ? v.reviewCount * 121 + 142 : 0);

  if (loading) {
    return (
      <>
        <header className="mobile-header mobile-only">
          <div className="header-location header-location--brand" aria-label="ToyMakon">
            <img src="/logo-rings.png" alt="" className="header-brand-logo header-brand-logo--rings" />
            <span className="header-wordmark">ToyMakon</span>
          </div>
        </header>
        <section className="home-section">
          <p className="muted-text">Yuklanmoqda…</p>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header className="mobile-header mobile-only">
          <div className="header-location header-location--brand" aria-label="ToyMakon">
            <img src="/logo-rings.png" alt="" className="header-brand-logo header-brand-logo--rings" />
            <span className="header-wordmark">ToyMakon</span>
          </div>
        </header>
        <section className="home-section">
          <p className="muted-text">{error}</p>
        </section>
      </>
    );
  }

  return (
    <>
      <header className="mobile-header mobile-only">
        <div className="header-location header-location--brand" aria-label="ToyMakon">
          <img src="/logo-rings.png" alt="" className="header-brand-logo header-brand-logo--rings" />
          <span className="header-wordmark">ToyMakon</span>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className={`icon-btn icon-btn--bell-wrap ${user && unreadCount > 0 ? 'icon-btn--has-unread' : ''} ${
              highlightNew ? 'icon-btn--new-arrival' : ''
            }`}
            aria-label="Bildirishnomalar"
            onClick={openNotifications}
          >
            <i className="ph ph-bell"></i>
            {user && unreadCount > 0 ? (
              <span className="notification-bell-badge" aria-hidden>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <div className="search-section">
        <div className="search-bar">
          <i className="ph ph-magnifying-glass search-icon"></i>
          <input type="text" placeholder="Qidiruv…" onClick={() => navigate('/search')} readOnly />
          <button
            type="button"
            className="search-filter-btn"
            aria-label="Filtr"
            onClick={() => navigate('/search?openFilter=1')}
          >
            <i className="ph ph-faders"></i>
          </button>
        </div>
      </div>

      <section className="home-section">
        <div className="section-header">
          <h2>Asosiy xizmatlar</h2>
          <span
            className="see-all"
            onClick={() => navigate('/category')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/category')}
          >
            Katalog
          </span>
        </div>
        {allCategories.length === 0 ? (
          <p className="muted-text">{EMPTY_MSG}</p>
        ) : (
          <div className="horizontal-scroll hide-scrollbar primary-cats-scroll">
            {allCategories.map((cat) => (
              <div
                key={cat.id}
                className="category-chip category-chip--primary"
                onClick={() => navigate(`/category/${cat.slug}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/category/${cat.slug}`)}
              >
                <div className="cat-icon cat-icon--accent">
                  <CategoryIcon category={cat} />
                </div>
                <span className="category-chip-label">{cat.shortLabel}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="home-section">
        <PromoCarousel />
      </section>

      <section className="home-section">
        <div className="section-header">
          <h2>Top to‘yxonalar</h2>
          {venueSlug ? (
            <span
              className="see-all"
              onClick={() => navigate(`/category/${venueSlug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/category/${venueSlug}`)}
            >
              Barchasi
            </span>
          ) : null}
        </div>
        {topVenues.length === 0 ? (
          <p className="muted-text">{EMPTY_MSG}</p>
        ) : (
          <div className="horizontal-scroll hide-scrollbar circles-row">
            {topVenues.map((story) => (
              <div
                key={story.id}
                className="story-item"
                onClick={() => navigate(`/vendor/${story.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/vendor/${story.id}`)}
              >
                <div className="story-ring">
                  <img src={story.image} alt={story.name} />
                </div>
                <span className="story-name">{story.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="section-header">
          <h2>Tavsiya qilamiz</h2>
        </div>
        {recommended.length === 0 ? (
          <p className="muted-text">{EMPTY_MSG}</p>
        ) : (
          <div className="horizontal-scroll hide-scrollbar cards-row">
            {recommended.map((card) => (
              <div
                key={card.id}
                className="service-card"
                onClick={() => navigate(`/vendor/${card.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/vendor/${card.id}`)}
              >
                <div className="card-img-wrap">
                  {card.badge ? <span className="card-badge">{card.badge}</span> : null}
                  <button
                    type="button"
                    className={`like-btn ${isFavorite(card.id) ? 'is-active' : ''}`}
                    onClick={(e) => handleLikeClick(e, card.id)}
                    aria-label={isFavorite(card.id) ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo‘shish'}
                    aria-pressed={isFavorite(card.id)}
                  >
                    <i className={isFavorite(card.id) ? 'ph-fill ph-heart' : 'ph-thin ph-heart'}></i>
                  </button>
                  <img src={card.image} alt={card.name} />
                </div>
                <div className="card-body">
                  <div className="card-meta">
                    {allCategories.find((c) => c.id === card.categoryId)?.shortLabel ?? ''} • {card.district}
                  </div>
                  <h4 className="card-title">{card.name}</h4>
                  <div className="card-price">
                    {card.priceLabel} <span>{card.priceNote}</span>
                  </div>
                  <div className="card-footer">
                    <span className="capacity">
                      <i className={`ph ${card.footerIcon}`}></i> {card.footerLine}
                    </span>
                    <span className="card-views" title="Ko‘rishlar soni">
                      <i className="ph ph-eye"></i> {viewCount(card)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {allCategories.map((cat) => {
        const catVendors = vendorsByCategory[cat.id] ?? [];
        if (!catVendors.length) return null;

        return (
          <section key={`sec-${cat.id}`} className="home-section">
            <div className="section-header">
              <h2>{cat.title}</h2>
              <span
                className="see-all"
                onClick={() => navigate(`/category/${cat.slug}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/category/${cat.slug}`)}
              >
                Barchasi
              </span>
            </div>
            <div className="horizontal-scroll hide-scrollbar cards-row">
              {catVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="service-card"
                  onClick={() => navigate(`/vendor/${vendor.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/vendor/${vendor.id}`)}
                >
                  <div className="card-img-wrap">
                    {vendor.badge ? <span className="card-badge">{vendor.badge}</span> : null}
                    <button
                      type="button"
                      className={`like-btn ${isFavorite(vendor.id) ? 'is-active' : ''}`}
                      onClick={(e) => handleLikeClick(e, vendor.id)}
                      aria-label={isFavorite(vendor.id) ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
                      aria-pressed={isFavorite(vendor.id)}
                    >
                      <i className={isFavorite(vendor.id) ? 'ph-fill ph-heart' : 'ph-thin ph-heart'}></i>
                    </button>
                    <img src={vendor.image} alt={vendor.name} />
                  </div>
                  <div className="card-body">
                    <div className="card-meta">
                      {cat.shortLabel} • {vendor.district}
                    </div>
                    <h4 className="card-title">{vendor.name}</h4>
                    <div className="card-price">
                      {vendor.priceLabel} <span>{vendor.priceNote}</span>
                    </div>
                    <div className="card-footer">
                      <span className="capacity">
                        <i className={`ph ${vendor.footerIcon}`}></i> {vendor.footerLine}
                      </span>
                      <span className="card-views" title="Ko‘rishlar soni">
                        <i className="ph ph-eye"></i> {viewCount(vendor)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section className="home-section last-section">
        <div className="planning-box">
          <div className="planning-info">
            <h3>To‘y checklistingizni boshlang</h3>
            <p>Katalogdagi barcha xizmatlar admin tomonidan yangilanadi.</p>
            <button type="button" className="btn-outline" onClick={() => navigate('/category')}>
              Kategoriyalar <i className="ph ph-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      <AuthGateSheet
        open={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        hint={authGateHint}
        onSuccess={() => {
          setAuthGateOpen(false);
          const cb = afterAuthRef.current;
          afterAuthRef.current = null;
          cb?.();
        }}
      />

    </>
  );
}
