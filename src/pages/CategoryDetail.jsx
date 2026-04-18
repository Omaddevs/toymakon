import { useNavigate, useParams } from 'react-router-dom';
import CategoryIcon from '../components/CategoryIcon';
import { getCategoryBySlug, getVendorsByCategoryId } from '../data/catalog';

export default function CategoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const category = getCategoryBySlug(slug);
  const vendors = category ? getVendorsByCategoryId(category.id) : [];

  if (!category) {
    return (
      <>
        <header className="mobile-header mobile-header--split mobile-only">
          <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)} aria-label="Orqaga">
            <i className="ph ph-arrow-left"></i>
          </button>
          <div className="header-location">
            <span>Topilmadi</span>
          </div>
        </header>
        <section className="home-section pad-x">
          <p className="muted-text">Bunday kategoriya yo‘q.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/category')}>
            Katalogga qaytish
          </button>
        </section>
      </>
    );
  }

  return (
    <>
      <header className="mobile-header mobile-header--split mobile-only">
        <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)} aria-label="Orqaga">
          <i className="ph ph-arrow-left"></i>
        </button>
        <div className="header-location header-location--flex">
          <CategoryIcon category={category} />
          <span className="header-title-truncate">{category.shortLabel}</span>
        </div>
      </header>

      <div className="page-intro pad-x">
        <h1 className="page-title">{category.title}</h1>
        <p className="page-subtitle">{category.subtitle}</p>
      </div>

      <section className="home-section pad-x">
        <div className="section-header">
          <h2>Takliflar ({vendors.length})</h2>
        </div>
        <div className="listing-stack">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="service-card listing-full"
              onClick={() => navigate(`/vendor/${v.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/vendor/${v.id}`)}
            >
              <div className="card-img-wrap">
                {v.badge ? <span className="card-badge">{v.badge}</span> : null}
                <button
                  type="button"
                  className="like-btn"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Sevimlilar"
                >
                  <i className="ph ph-heart"></i>
                </button>
                <img src={v.image} alt={v.name} />
              </div>
              <div className="card-body">
                <div className="card-meta">
                  {category.shortLabel} • {v.district}
                </div>
                <h4 className="card-title">{v.name}</h4>
                <div className="card-price">
                  {v.priceLabel} <span>{v.priceNote}</span>
                </div>
                <div className="card-footer">
                  <span className="capacity">
                    <i className={`ph ${v.footerIcon}`}></i> {v.footerLine}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
