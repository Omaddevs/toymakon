import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthGateSheet from '../components/AuthGateSheet';
import { useAuth } from '../context/AuthContext';
import { getVendorById } from '../data/catalog';
import { getFavoriteIds, toggleFavorite, isFavorite } from '../utils/favoritesStorage';

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const [authGateOpen, setAuthGateOpen] = useState(false);

  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    window.addEventListener('toymakon-favorites', fn);
    return () => window.removeEventListener('toymakon-favorites', fn);
  }, []);

  const favorites = useMemo(() => {
    void tick;
    const ids = getFavoriteIds();
    return ids
      .map((id) => getVendorById(id))
      .filter(Boolean);
  }, [tick]);

  if (!user) {
    return (
      <>
        <header className="mobile-header mobile-only">
          <div className="header-location">
            <i className="ph ph-heart"></i>
            <span>Sevimlilar</span>
          </div>
        </header>
        <section className="home-section last-section favorites-locked">
          <div className="favorites-locked-card">
            <div className="favorites-locked-icon" aria-hidden>
              <i className="ph ph-lock"></i>
            </div>
            <h2 className="favorites-locked-title">Sevimlilar ro‘yxati</h2>
            <p className="favorites-locked-text">
              Saqlangan to‘yxonalar va xizmatlar shu yerda ko‘rinadi. Ro‘yxatdan o‘ting yoki tizimga kiring.
            </p>
            <button type="button" className="btn-primary favorites-locked-btn" onClick={() => setAuthGateOpen(true)}>
              Kirish yoki ro‘yxatdan o‘tish
            </button>
          </div>
        </section>
        <AuthGateSheet
          open={authGateOpen}
          onClose={() => setAuthGateOpen(false)}
          hint="Sevimlilarga qo‘shish va ro‘yxatni ko‘rish uchun hisob kerak."
          onSuccess={() => setAuthGateOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <header className="mobile-header mobile-only">
        <div className="header-location">
          <i className="ph ph-heart"></i>
          <span>Sevimlilar</span>
        </div>
      </header>
      <section className="home-section last-section">
        <div className="section-header">
          <h2>Siz saqlaganlar</h2>
        </div>
        {favorites.length === 0 ? (
          <p className="muted-text">Hali hech narsa qo‘shmadingiz. Katalogdan yurakcha bosib qo‘ying.</p>
        ) : (
          <div className="listing-stack">
            {favorites.map((v) => (
              <article
                key={v.id}
                className="service-card service-card--horizontal listing-full"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/vendor/${v.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/vendor/${v.id}`)}
              >
                <div className="card-img-wrap card-img-wrap--side">
                  <button
                    type="button"
                    className={`like-btn ${isFavorite(v.id) ? 'is-active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(v.id);
                    }}
                    aria-label="Sevimlilardan olib tashlash"
                  >
                    <i className={isFavorite(v.id) ? "ph-fill ph-heart" : "ph-thin ph-heart"} />
                  </button>
                  <img src={v.image} alt="" />
                </div>
                <div className="card-body card-body--grow">
                  <p className="card-meta">
                    {v.district}
                  </p>
                  <h3 className="card-title">{v.name}</h3>
                  <p className="card-price">
                    {v.priceLabel} <span>{v.priceNote}</span>
                  </p>
                </div>
                <i className="ph ph-caret-right search-result-chev" aria-hidden />
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
