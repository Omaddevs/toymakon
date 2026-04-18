import { useNavigate } from 'react-router-dom';
import { PRIMARY_CATEGORIES, getVendorsByCategoryId, VENDORS } from '../data/catalog';

const FEATURED_VENDOR_IDS = ['v-versal', 'v-azizov', 'v-royal'];

export default function Home() {
  const navigate = useNavigate();
  const venueStories = getVendorsByCategoryId('venue');
  const featuredCards = FEATURED_VENDOR_IDS.map((id) => VENDORS.find((v) => v.id === id)).filter(Boolean);

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header mobile-only">
        <div className="header-location">
          <i className="ph ph-map-pin"></i>
          <span>Toshkent</span>
          <i className="ph ph-caret-down"></i>
        </div>
        <div className="header-actions">
          <button type="button" className="icon-btn" aria-label="Bildirishnomalar">
            <i className="ph ph-bell"></i>
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <i className="ph ph-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="To‘yxona, foto, dekor qidiring"
            onClick={() => navigate('/search')}
            readOnly
          />
          <button type="button" className="search-filter-btn" aria-label="Filtr">
            <i className="ph ph-faders"></i>
          </button>
        </div>
      </div>

      {/* Asosiy 3 kategoriya */}
      <section className="home-section">
        <div className="section-header pad-x">
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
        <div className="horizontal-scroll hide-scrollbar primary-cats-scroll">
          {PRIMARY_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="category-chip category-chip--primary"
              onClick={() => navigate(`/category/${cat.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/category/${cat.slug}`)}
            >
              <div className="cat-icon cat-icon--accent">
                <i className={`ph ${cat.icon}`}></i>
              </div>
              <span className="category-chip-label">{cat.shortLabel}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Banners Carousel */}
      <section className="home-section pad-x">
        <div className="banner-card">
          <div className="banner-content">
            <span className="banner-badge">Yangi mavsum</span>
            <h3>2026 mavsum uchun eng yaxshi to‘yxonalar</h3>
            <button type="button" className="btn-primary" onClick={() => navigate('/category/toyxona')}>
              Ko‘rish <i className="ph ph-arrow-right"></i>
            </button>
          </div>
          <div className="banner-bg"></div>
        </div>
      </section>

      {/* Featured Circular Vendors */}
      <section className="home-section">
        <div className="section-header pad-x">
          <h2>Top to‘yxonalar</h2>
          <span
            className="see-all"
            onClick={() => navigate('/category/toyxona')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/category/toyxona')}
          >
            Barchasi
          </span>
        </div>
        <div className="horizontal-scroll hide-scrollbar circles-row">
          {venueStories.map((story) => (
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
      </section>

      {/* Recommended Section Horizontal Scroll */}
      <section className="home-section">
        <div className="section-header pad-x">
          <h2>Tavsiya qilamiz</h2>
        </div>
        <div className="horizontal-scroll hide-scrollbar cards-row">
          {featuredCards.map((card) => (
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
                  className="like-btn"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Sevimlilar"
                >
                  <i className="ph ph-heart"></i>
                </button>
                <img src={card.image} alt={card.name} />
              </div>
              <div className="card-body">
                <div className="card-meta">
                  {PRIMARY_CATEGORIES.find((c) => c.id === card.categoryId)?.shortLabel ?? ''} • {card.district}
                </div>
                <h4 className="card-title">{card.name}</h4>
                <div className="card-price">
                  {card.priceLabel} <span>{card.priceNote}</span>
                </div>
                <div className="card-footer">
                  <span className="capacity">
                    <i className={`ph ${card.footerIcon}`}></i> {card.footerLine}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wedding planning helper section */}
      <section className="home-section pad-x last-section">
        <div className="planning-box">
          <div className="planning-info">
            <h3>To‘y checklistingizni boshlang</h3>
            <p>Nimalar kerakligini bilmayapsizmi? Avvalo to‘yxona, keyin foto va dekor — katalogdan tanlang.</p>
            <button type="button" className="btn-outline" onClick={() => navigate('/category')}>
              Kategoriyalar <i className="ph ph-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
