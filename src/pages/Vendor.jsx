import { useNavigate, useParams } from 'react-router-dom';
import { getVendorById, ALL_CATEGORIES } from '../data/catalog';

export default function Vendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const vendor = getVendorById(id);
  const category = vendor ? ALL_CATEGORIES.find((c) => c.id === vendor.categoryId) : null;

  if (!vendor || !category) {
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
          <p className="muted-text">Bu sahifa mavjud emas yoki olib tashlangan.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/')}>
            Bosh sahifa
          </button>
        </section>
      </>
    );
  }

  const allImages = [vendor.image, ...(vendor.gallery || [])].filter(Boolean);

  return (
    <>
      <header className="mobile-header mobile-header--split mobile-only vendor-page-header">
        <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)} aria-label="Orqaga">
          <i className="ph ph-arrow-left"></i>
        </button>
        <div className="header-location">
          <span className="header-title-truncate">{vendor.name}</span>
        </div>
        <button type="button" className="icon-btn" aria-label="Ulashish">
          <i className="ph ph-share-network"></i>
        </button>
      </header>

      <div className="vendor-hero">
        <img src={vendor.image} alt={vendor.name} />
        {vendor.badge ? <span className="vendor-hero-badge">{vendor.badge}</span> : null}
      </div>

      <section className="vendor-detail pad-x">
        <p className="card-meta vendor-detail-meta">
          {category.shortLabel} • {vendor.district}
        </p>
        <h1 className="vendor-detail-title">{vendor.name}</h1>
        <div className="vendor-price-row">
          <span className="card-price vendor-detail-price">
            {vendor.priceLabel} <span>{vendor.priceNote}</span>
          </span>
        </div>
        <p className="vendor-description">{vendor.description}</p>

        <div className="vendor-specs">
          {vendor.specs.map((s) => (
            <div key={s.label} className="vendor-spec-row">
              <span className="vendor-spec-label">{s.label}</span>
              <span className="vendor-spec-value">{s.value}</span>
            </div>
          ))}
        </div>

        {allImages.length > 1 ? (
          <div className="vendor-gallery">
            <h3 className="vendor-section-title">Galereya</h3>
            <div className="horizontal-scroll hide-scrollbar vendor-gallery-scroll">
              {allImages.map((src, i) => (
                <div key={i} className="vendor-gallery-thumb">
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="vendor-cta">
          <a className="btn-primary vendor-phone-btn" href={`tel:${vendor.phone.replace(/[^\d+]/g, '')}`}>
            <i className="ph ph-phone"></i> Qo‘ng‘iroq qilish
          </a>
          <button type="button" className="btn-outline" onClick={() => navigate(`/category/${category.slug}`)}>
            Shu yo‘nalishdagi boshqalari
          </button>
        </div>
      </section>
    </>
  );
}
