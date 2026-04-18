export default function Search() {
  return (
    <>
      <header className="mobile-header mobile-only">
        <div className="header-location">
          <i className="ph ph-magnifying-glass"></i>
          <span>Qidiruv natijalari</span>
        </div>
      </header>
      <section className="home-section pad-x">
        <div className="search-bar">
          <i className="ph ph-magnifying-glass search-icon"></i>
          <input type="text" placeholder="Qidirish..." />
        </div>
        <br />
        <div className="section-header"><h2>Natijalar</h2></div>
        <p>Tez orada...</p>
      </section>
    </>
  );
}
