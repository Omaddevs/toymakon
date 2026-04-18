import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVendorById } from '../data/catalog';
import { getFavoriteIds } from '../utils/favoritesStorage';

export default function Favorites() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

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
