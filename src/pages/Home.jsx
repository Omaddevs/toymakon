import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

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
          <button className="icon-btn"><i className="ph ph-bell"></i></button>
        </div>
      </header>
      
      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <i className="ph ph-magnifying-glass search-icon"></i>
          <input type="text" placeholder="To‘yxona, fotograf, dekor qidiring" onClick={() => navigate('/search')} />
          <button className="search-filter-btn"><i className="ph ph-faders"></i></button>
        </div>
      </div>

      {/* Categories Row */}
      <section className="home-section pad-x-desktop">
        <div className="horizontal-scroll hide-scrollbar">
          {[
            { icon: "ph-buildings", label: "To‘yxonalar" },
            { icon: "ph-camera", label: "Fotograf" },
            { icon: "ph-confetti", label: "Dekor" },
            { icon: "ph-envelope-open", label: "Taklifnoma" },
            { icon: "ph-dress", label: "Liboslar" },
            { icon: "ph-car-profile", label: "Avto xizmat" },
            { icon: "ph-microphone-stage", label: "Tamada" }
          ].map((cat, idx) => (
            <div key={idx} className="category-chip" onClick={() => navigate('/category')}>
              <div className="cat-icon"><i className={`ph ${cat.icon}`}></i></div>
              <span>{cat.label}</span>
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
            <button className="btn-primary">Ko'rish <i className="ph ph-arrow-right"></i></button>
          </div>
          <div className="banner-bg"></div>
        </div>
      </section>

      {/* Featured Circular Vendors */}
      <section className="home-section">
        <div className="section-header pad-x">
          <h2>Top To‘yxonalar</h2>
          <a onClick={() => navigate('/category')} className="see-all" style={{cursor: 'pointer'}}>Barchasi</a>
        </div>
        <div className="horizontal-scroll hide-scrollbar circles-row">
          {[
            { img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=150&q=80", name: "Osiyo Grand" },
            { img: "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=150&q=80", name: "Yakkasaroy" },
            { img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=150&q=80", name: "Humo Event" },
            { img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=150&q=80", name: "Turkiston" },
            { img: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=150&q=80", name: "Mumtoz" }
          ].map((story, idx) => (
            <div key={idx} className="story-item" onClick={() => navigate('/vendor')}>
              <div className="story-ring"><img src={story.img} alt={story.name} /></div>
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
          {/* Card 1 */}
          <div className="service-card" onClick={() => navigate('/vendor')}>
            <div className="card-img-wrap">
              <span className="card-badge">Top</span>
              <button className="like-btn" onClick={(e) => e.stopPropagation()}><i className="ph ph-heart"></i></button>
              <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80" alt="Event" />
            </div>
            <div className="card-body">
              <div className="card-meta">To'yxona • Yunusobod</div>
              <h4 className="card-title">Versal Restaurant</h4>
              <div className="card-price">50 000 so'm <span>/ kishi</span></div>
              <div className="card-footer">
                <span className="capacity"><i className="ph ph-users"></i> 400 - 800 kishi</span>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="service-card" onClick={() => navigate('/vendor')}>
            <div className="card-img-wrap">
              <span className="card-badge">Yangi</span>
              <button className="like-btn" onClick={(e) => e.stopPropagation()}><i className="ph ph-heart"></i></button>
              <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80" alt="Photographer" />
            </div>
            <div className="card-body">
              <div className="card-meta">Fotograf • Chilonzor</div>
              <h4 className="card-title">Azizov Studio</h4>
              <div className="card-price">2 000 000 so'm <span>ko'p</span></div>
              <div className="card-footer">
                <span className="capacity"><i className="ph ph-star"></i> 4.9 (120 sharh)</span>
              </div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="service-card" onClick={() => navigate('/vendor')}>
            <div className="card-img-wrap">
              <button className="like-btn" onClick={(e) => e.stopPropagation()}><i className="ph ph-heart"></i></button>
              <img src="https://images.unsplash.com/photo-1561571994-3f61c114d1d9?auto=format&fit=crop&w=400&q=80" alt="Decor" />
            </div>
            <div className="card-body">
              <div className="card-meta">Dekor • Mirzo Ulug'bek</div>
              <h4 className="card-title">Royal Decorators</h4>
              <div className="card-price">5 000 000 so'm <span>boshlab</span></div>
              <div className="card-footer">
                <span className="capacity"><i className="ph ph-sparkle"></i> Premium dizayn</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wedding planning helper section */}
      <section className="home-section pad-x last-section">
         <div className="planning-box">
           <div className="planning-info">
             <h3>To'y checklistingizni boshlang</h3>
             <p>Nimalar kerakligini bilmayapsizmi? Biz sizga yordam beramiz, maxsus xizmatlarni tanlang.</p>
             <button className="btn-outline">Rejalashtirish <i className="ph ph-arrow-right"></i></button>
           </div>
         </div>
      </section>
    </>
  );
}
