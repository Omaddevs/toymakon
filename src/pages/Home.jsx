import { useNavigate } from 'react-router-dom';
import PromoCarousel from '../components/PromoCarousel';
import CategoryIcon from '../components/CategoryIcon';
import { ALL_CATEGORIES, getVendorsByCategoryId, VENDORS } from '../data/catalog';

const FEATURED_VENDOR_IDS = ['v-versal', 'v-azizov', 'v-bloom'];

export default function Home() {
  const navigate = useNavigate();
  const venueStories = getVendorsByCategoryId('venue');
  const featuredCards = FEATURED_VENDOR_IDS.map((id) => VENDORS.find((v) => v.id === id)).filter(Boolean);

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header mobile-only">
        <div className="header-location header-location--brand">
          <img src="/logo.png" alt="ToyMakon" className="header-brand-logo" />
          <i className="ph ph-caret-down" aria-hidden></i>
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
            placeholder="To‘yxona, FotoStudio, dekor, marry me..."
            onClick={() => navigate('/search')}
            readOnly
          />
          <button type="button" className="search-filter-btn" aria-label="Filtr">
            <i className="ph ph-faders"></i>
          </button>
        </div>
      </div>

      {/* Barcha kategoriyalar (asosiy + qo‘shimcha) */}
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
          {ALL_CATEGORIES.map((cat) => (
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
      </section>

      {/* Reklama carousel */}
      <section className="home-section">
        <PromoCarousel />
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
                  {ALL_CATEGORIES.find((c) => c.id === card.categoryId)?.shortLabel ?? ''} • {card.district}
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
            <p>Nimalar kerakligini bilmayapsizmi? To‘yxona, FotoStudio, dekor, marry me, taklifnoma va boshqa xizmatlar — barchasi katalogda.</p>
            <button type="button" className="btn-outline" onClick={() => navigate('/category')}>
              Kategoriyalar <i className="ph ph-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
