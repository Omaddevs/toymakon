import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRIMARY_CATEGORIES, searchVendors } from '../data/catalog';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchVendors(query), [query]);

  return (
    <>
      <header className="mobile-header mobile-header--split mobile-only">
        <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)} aria-label="Orqaga">
          <i className="ph ph-arrow-left"></i>
        </button>
        <div className="header-location">
          <span>Qidiruv</span>
        </div>
      </header>
      <section className="home-section pad-x search-page">
        <div className="search-bar">
          <i className="ph ph-magnifying-glass search-icon"></i>
          <input
            type="search"
            placeholder="Masalan: to‘yxona, fotograf, dekor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-quick">
          <p className="search-quick-label">Tez tanlov</p>
          <div className="search-chips">
            {PRIMARY_CATEGORIES.map((c) => (
              <button key={c.id} type="button" className="search-chip" onClick={() => navigate(`/category/${c.slug}`)}>
                {c.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="section-header">
          <h2>Natijalar ({results.length})</h2>
        </div>
        <div className="listing-stack">
          {results.map((v) => {
            const cat = PRIMARY_CATEGORIES.find((c) => c.id === v.categoryId);
            return (
              <div
                key={v.id}
                className="service-card listing-full service-card--horizontal"
                onClick={() => navigate(`/vendor/${v.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/vendor/${v.id}`)}
              >
                <div className="card-img-wrap card-img-wrap--side">
                  {v.badge ? <span className="card-badge">{v.badge}</span> : null}
                  <img src={v.image} alt={v.name} />
                </div>
                <div className="card-body card-body--grow">
                  <div className="card-meta">
                    {cat?.shortLabel} • {v.district}
                  </div>
                  <h4 className="card-title">{v.name}</h4>
                  <div className="card-price">
                    {v.priceLabel} <span>{v.priceNote}</span>
                  </div>
                </div>
                <i className="ph ph-caret-right search-result-chev" aria-hidden></i>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
