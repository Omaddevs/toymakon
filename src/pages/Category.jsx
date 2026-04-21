import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryIcon from '../components/CategoryIcon';
import { fetchCategories } from '../utils/catalogApi';

const EMPTY_MSG = 'Ma’lumotlar hozircha yo‘q';

export default function Category() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((rows) => {
        if (!cancelled) setCategories(rows);
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

  if (loading) {
    return (
      <>
        <header className="mobile-header mobile-only">
          <div className="header-location">
            <i className="ph ph-squares-four"></i>
            <span>Katalog</span>
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
          <div className="header-location">
            <i className="ph ph-squares-four"></i>
            <span>Katalog</span>
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
        <div className="header-location">
          <i className="ph ph-squares-four"></i>
          <span>Katalog</span>
        </div>
      </header>

      <section className="home-section">
        <div className="section-header">
          <h2>Barcha kategoriyalar</h2>
        </div>
        <p className="page-subtitle page-subtitle--tight">
          Admin panel orqali qo‘shilgan yo‘nalishlar. Ma’lumotlar bo‘lmasa, avval kategoriya yarating.
        </p>

        {categories.length === 0 ? (
          <p className="muted-text">{EMPTY_MSG}</p>
        ) : (
          <div className="primary-categories-block primary-categories-block--in-section">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className="primary-category-card"
                onClick={() => navigate(`/category/${c.slug}`)}
              >
                <div className="primary-category-card__icon">
                  <CategoryIcon category={c} />
                </div>
                <div className="primary-category-card__text">
                  <span className="primary-category-card__title">{c.title}</span>
                  <span className="primary-category-card__desc">{c.subtitle}</span>
                </div>
                <i className="ph ph-caret-right primary-category-card__chev"></i>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
