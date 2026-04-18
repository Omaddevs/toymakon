import { useNavigate } from 'react-router-dom';
import { PRIMARY_CATEGORIES } from '../data/catalog';

export default function Category() {
  const navigate = useNavigate();

  return (
    <>
      <header className="mobile-header mobile-only">
        <div className="header-location">
          <i className="ph ph-squares-four"></i>
          <span>Katalog</span>
        </div>
      </header>

      <section className="home-section pad-x">
        <div className="section-header">
          <h2>Asosiy yo‘nalishlar</h2>
        </div>
        <p className="page-subtitle page-subtitle--tight">
          Eng ko‘p qidiriladigan uchta xizmat — tanlang, keyin takliflarni solishtiring.
        </p>
      </section>

      <section className="primary-categories-block pad-x">
        {PRIMARY_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className="primary-category-card"
            onClick={() => navigate(`/category/${c.slug}`)}
          >
            <div className="primary-category-card__icon">
              <i className={`ph ${c.icon}`}></i>
            </div>
            <div className="primary-category-card__text">
              <span className="primary-category-card__title">{c.title}</span>
              <span className="primary-category-card__desc">{c.subtitle}</span>
            </div>
            <i className="ph ph-caret-right primary-category-card__chev"></i>
          </button>
        ))}
      </section>
    </>
  );
}
