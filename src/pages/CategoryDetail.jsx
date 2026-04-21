import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CategoryIcon from '../components/CategoryIcon';
import AuthGateSheet from '../components/AuthGateSheet';
import { useAuth } from '../context/AuthContext';
import { fetchCategoryBySlug, fetchVendors } from '../utils/catalogApi';
import { isFavorite, toggleFavorite } from '../utils/favoritesStorage';

const EMPTY_MSG = 'Ma’lumotlar hozircha yo‘q';

export default function CategoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  const [favTick, setFavTick] = useState(0);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateHint, setAuthGateHint] = useState('');
  const afterAuthRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return undefined;
    }
    setLoading(true);
    setNotFound(false);
    setError(false);
    fetchCategoryBySlug(slug)
      .then(async (cat) => {
        if (cancelled) return;
        setCategory(cat);
        const list = await fetchVendors({ category: cat.id });
        if (!cancelled) setVendors(list);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e?.status === 404) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    const fn = () => setFavTick((t) => t + 1);
    window.addEventListener('toymakon-favorites', fn);
    return () => window.removeEventListener('toymakon-favorites', fn);
  }, []);

  const viewCount = (v) => (typeof v.reviewCount === 'number' ? v.reviewCount * 121 + 142 : 0);

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

  if (loading) {
    return (
      <>
        <header className="mobile-header mobile-header--split mobile-only">
          <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)} aria-label="Orqaga">
            <i className="ph ph-arrow-left"></i>
          </button>
          <div className="header-location">
            <span>Yuklanmoqda…</span>
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
        <header className="mobile-header mobile-header--split mobile-only">
          <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)} aria-label="Orqaga">
            <i className="ph ph-arrow-left"></i>
          </button>
          <div className="header-location">
            <span>Xato</span>
          </div>
        </header>
        <section className="home-section">
          <p className="muted-text">Serverga ulanib bo‘lmadi.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/category')}>
            Katalogga qaytish
          </button>
        </section>
      </>
    );
  }

  if (notFound || !category) {
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
        <section className="home-section">
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

      <div className="page-intro">
        <h1 className="page-title">{category.title}</h1>
        <p className="page-subtitle">{category.subtitle}</p>
      </div>

      <section className="home-section">
        <div className="section-header">
          <h2>Takliflar ({vendors.length})</h2>
        </div>
        {vendors.length === 0 ? (
          <p className="muted-text">{EMPTY_MSG}</p>
        ) : (
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
                    className={`like-btn ${isFavorite(v.id) ? 'is-active' : ''}`}
                    onClick={(e) => handleLikeClick(e, v.id)}
                    aria-label={isFavorite(v.id) ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo‘shish'}
                    aria-pressed={isFavorite(v.id)}
                  >
                    <i className={isFavorite(v.id) ? 'ph-fill ph-heart' : 'ph-thin ph-heart'}></i>
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
                    <span className="card-views" title="Ko‘rishlar soni">
                      <i className="ph ph-eye"></i> {viewCount(v)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
