import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { fetchCategories, fetchVendors } from '../utils/catalogApi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [41.3111, 69.2401];
const DEFAULT_ZOOM = 12;

// Kategoriya ranglari
const CATEGORY_COLORS = {
  venue:      '#16a34a',
  attire:     '#ec4899',
  media:      '#2563eb',
  photo:      '#2563eb',
  video:      '#7c3aed',
  decor:      '#f59e0b',
  transport:  '#6d28d9',
  kartej:     '#6d28d9',
  mc:         '#dc2626',
  honanda:    '#dc2626',
  marry_me:   '#be185d',
  restaurant: '#ea580c',
  tort:       '#d97706',
  makeup:     '#db2777',
  invitation: '#0891b2',
  hotel:      '#0284c7',
  animators:  '#7c3aed',
  lawyer:     '#1d4ed8',
  catering:   '#b45309',
};

function getCategoryColor(categoryId) {
  if (!categoryId) return '#7e1d37';
  const lower = (categoryId || '').toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lower.includes(key)) return color;
  }
  // Hash-based fallback color
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = lower.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#16a34a', '#2563eb', '#dc2626', '#ea580c', '#7c3aed', '#0891b2', '#d97706'];
  return colors[Math.abs(hash) % colors.length];
}

function getCoords(vendor) {
  if (vendor.lat && vendor.lng) return [vendor.lat, vendor.lng];
  // Stable pseudo-coordinates from vendor id
  let hash = 0;
  const id = vendor.id || vendor.code || '';
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = 41.3111 + (Math.abs(hash) % 100) / 1000 - 0.05;
  const lng = 69.2401 + (Math.abs(hash >> 2) % 100) / 1000 - 0.05;
  return [lat, lng];
}

function createCategoryMarkerIcon(categoryId, priceLabel) {
  const color = getCategoryColor(categoryId);
  const label = priceLabel ? String(priceLabel).slice(0, 12) : '—';
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="background:${color};color:#fff;border:2px solid #fff;border-radius:20px;padding:4px 10px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);">${label}</div>`,
    iconSize: [null, 28],
    iconAnchor: [40, 28],
    popupAnchor: [0, -32],
  });
}

const userDotIcon = L.divIcon({
  className: 'user-loc-marker',
  html: '<div class="user-loc-marker__dot"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapFitBounds({ positions, userPos }) {
  const map = useMap();
  const prevPositions = useRef(null);

  useEffect(() => {
    const key = JSON.stringify(positions);
    if (prevPositions.current === key) return;
    prevPositions.current = key;

    const pts = userPos ? [userPos, ...positions] : [...positions];
    if (!pts.length) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (pts.length === 1) {
      map.setView(pts[0], 14);
      return;
    }
    const bounds = L.latLngBounds(pts);
    if (!bounds.isValid()) return;
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 15, animate: true });
  }, [map, positions, userPos]);

  return null;
}

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [mapAccess, setMapAccess] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [minRating, setMinRating] = useState('');
  const [ordering, setOrdering] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCategories(), fetchVendors()])
      .then(([cats, vens]) => {
        if (!cancelled) {
          setCategories(cats);
          setDistricts(
            [...new Set(vens.map((v) => (v.district || '').trim()).filter(Boolean))].sort((a, b) =>
              a.localeCompare(b)
            )
          );
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError("Serverga ulanib bo'lmadi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loadError) return;
    let cancelled = false;
    setLoadingResults(true);
    fetchVendors({
      search: query.trim() || undefined,
      category: selectedCategory || undefined,
      district: selectedDistrict || undefined,
      minRating: minRating || undefined,
      ordering: ordering || undefined,
    })
      .then((rows) => { if (!cancelled) setVendors(rows); })
      .catch(() => { if (!cancelled) setVendors([]); })
      .finally(() => { if (!cancelled) setLoadingResults(false); });
    return () => { cancelled = true; };
  }, [query, selectedCategory, selectedDistrict, minRating, ordering, loadError]);

  const results = vendors;
  const markerPositions = useMemo(() => results.map((v) => getCoords(v)), [results]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (selectedCategory) n++;
    if (selectedDistrict) n++;
    if (minRating) n++;
    if (ordering) n++;
    return n;
  }, [selectedCategory, selectedDistrict, minRating, ordering]);

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSelectedDistrict('');
    setMinRating('');
    setOrdering('');
  }, []);

  useEffect(() => {
    const openFromQuery = new URLSearchParams(location.search).get('openFilter') === '1';
    if (openFromQuery) setShowFilters(true);
  }, [location.search]);

  useEffect(() => {
    if (!showFilters) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setShowFilters(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [showFilters]);

  const openMapView = useCallback(() => {
    setViewMode('map');
    setMapAccess(false);
    setUserPos(null);
    setGeoError('');
  }, []);

  const openListView = useCallback(() => {
    setViewMode('list');
    setMapAccess(false);
  }, []);

  const confirmDeviceLocation = useCallback(() => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError("Brauzeringiz joylashuvni qo'llab-quvvatlamaydi.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setMapAccess(true);
      },
      () => {
        setGeoError("Joylashuvni olish mumkin emas. Ruxsat bering yoki «Toshkent markazi»ni tanlang.");
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 0 }
    );
  }, []);

  const confirmCenterOnly = useCallback(() => {
    setUserPos(null);
    setMapAccess(true);
    setGeoError('');
  }, []);

  // Kategoriya chip bosish — map viewda filter, list viewda navigate
  const handleCategoryChip = useCallback((cat) => {
    if (viewMode === 'map' && mapAccess) {
      setSelectedCategory((prev) => (prev === cat.id ? '' : cat.id));
    } else if (viewMode === 'map') {
      setSelectedCategory((prev) => (prev === cat.id ? '' : cat.id));
    } else {
      navigate(`/category/${cat.slug}`);
    }
  }, [viewMode, mapAccess, navigate]);

  if (loading) {
    return (
      <>
        <header className="mobile-header mobile-header--split mobile-only" style={{ zIndex: 1001 }}>
          <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)}>
            <i className="ph ph-arrow-left" />
          </button>
          <div className="header-location"><span>Qidiruv & Karta</span></div>
        </header>
        <section className="home-section"><p className="muted-text">Yuklanmoqda…</p></section>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <header className="mobile-header mobile-header--split mobile-only" style={{ zIndex: 1001 }}>
          <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)}>
            <i className="ph ph-arrow-left" />
          </button>
          <div className="header-location"><span>Qidiruv & Karta</span></div>
        </header>
        <section className="home-section"><p className="muted-text">{loadError}</p></section>
      </>
    );
  }

  return (
    <>
      <header className="mobile-header mobile-header--split mobile-only" style={{ zIndex: 1001 }}>
        <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)}>
          <i className="ph ph-arrow-left" />
        </button>
        <div className="header-location"><span>Qidiruv & Karta</span></div>
      </header>

      <section
        className={`home-section search-page ${viewMode === 'map' ? 'search-page--map' : ''}`}
        style={viewMode === 'map' && mapAccess ? { padding: 0, overflow: 'hidden' } : {}}
      >
        <div className={`search-bar ${viewMode === 'map' ? 'search-bar--map' : ''}`}>
          <i className="ph ph-magnifying-glass search-icon" />
          <input
            type="search"
            placeholder="Izlash... hudud, nom, yoki kategoriya"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="search-filter-btn"
            onClick={() => setShowFilters((s) => !s)}
          >
            <i className="ph ph-sliders-horizontal" />
          </button>
        </div>

        <div className={`search-view-toggle ${viewMode === 'map' ? 'search-view-toggle--floating' : ''}`}>
          <div className="search-view-toggle__inner auth-tabs">
            <button
              type="button"
              className={`auth-tab ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={openListView}
            >
              Ro'yxat
            </button>
            <button
              type="button"
              className={`auth-tab ${viewMode === 'map' ? 'is-active' : ''}`}
              onClick={openMapView}
            >
              Karta
            </button>
          </div>
        </div>

        {/* LIST VIEW */}
        {viewMode === 'list' ? (
          <>
            <div className="search-quick">
              <p className="search-quick-label">Kategoriyalar</p>
              {categories.length === 0 ? (
                <p className="muted-text" style={{ marginTop: 8 }}>Ma'lumotlar hozircha yo'q</p>
              ) : (
                <div className="search-chips">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="search-chip"
                      onClick={() => handleCategoryChip(c)}
                    >
                      {c.shortLabel}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="section-header">
              <h2>Natijalar ({results.length})</h2>
            </div>
            <div className="listing-stack">
              {loadingResults ? (
                <p className="muted-text">Yuklanmoqda…</p>
              ) : results.length === 0 ? (
                <p className="muted-text">Ma'lumotlar hozircha yo'q</p>
              ) : (
                results.map((v) => {
                  const cat = categories.find((c) => c.id === v.categoryId);
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
                        <div
                          className="card-meta"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span
                            className="map-cat-dot"
                            style={{ background: getCategoryColor(v.categoryId) }}
                          />
                          {cat?.shortLabel} • {v.district}
                        </div>
                        <h4 className="card-title">{v.name}</h4>
                        <div className="card-price">
                          {v.priceLabel} <span>{v.priceNote}</span>
                        </div>
                      </div>
                      <i className="ph ph-caret-right search-result-chev" />
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : null}

        {/* MAP GATE */}
        {viewMode === 'map' && !mapAccess ? (
          <div className="search-location-gate">
            <div className="search-location-gate__card">
              <div className="search-location-gate__icon"><i className="ph ph-map-pin" /></div>
              <h2 className="search-location-gate__title">Joylashuvni tasdiqlang</h2>
              <p className="search-location-gate__text">
                Xaritada yaqin takliflarni ko'rsatish uchun hozirgi joylashuvingizni ulashing yoki
                Toshkent markazidan foydalaning.
              </p>
              {geoError ? <p className="search-location-gate__error">{geoError}</p> : null}
              <button type="button" className="btn-primary search-location-gate__btn" onClick={confirmDeviceLocation}>
                <i className="ph ph-crosshair" /> Joylashuvimni ulashish
              </button>
              <button type="button" className="btn-outline search-location-gate__btn" onClick={confirmCenterOnly}>
                Toshkent markazi bo'yicha
              </button>
              <button type="button" className="search-location-gate__back" onClick={openListView}>
                Ro'yxatga qaytish
              </button>
            </div>
          </div>
        ) : null}

        {/* MAP VIEW */}
        {viewMode === 'map' && mapAccess ? (
          <div className="search-map-wrap" style={{ position: 'relative' }}>
            {/* Kategoriya filter chips (map ustida) */}
            <div className="map-cat-chips">
              <button
                type="button"
                className={`map-cat-chip ${!selectedCategory ? 'map-cat-chip--active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                Barchasi
                <span className="map-cat-chip__count">{results.length}</span>
              </button>
              {categories.map((c) => {
                const cnt = vendors.filter((v) => v.categoryId === c.id).length;
                if (!cnt) return null;
                const color = getCategoryColor(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`map-cat-chip ${selectedCategory === c.id ? 'map-cat-chip--active' : ''}`}
                    style={selectedCategory === c.id ? { background: color, borderColor: color, color: '#fff' } : { borderColor: color, color: color }}
                    onClick={() => setSelectedCategory((prev) => (prev === c.id ? '' : c.id))}
                  >
                    <span className="map-cat-chip__dot" style={{ background: color }} />
                    {c.shortLabel}
                    <span className="map-cat-chip__count">{cnt}</span>
                  </button>
                );
              })}
            </div>

            <MapContainer
              center={userPos ?? DEFAULT_CENTER}
              zoom={userPos ? 13 : DEFAULT_ZOOM}
              className="search-map-wrap__leaflet"
              zoomControl
              scrollWheelZoom
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              <MapFitBounds positions={markerPositions} userPos={userPos} />

              {userPos ? (
                <Marker position={userPos} icon={userDotIcon}>
                  <Popup>Sizning taxminiy joylashuvingiz</Popup>
                </Marker>
              ) : null}

              {results.map((v) => {
                const coords = getCoords(v);
                return (
                  <Marker
                    key={v.id}
                    position={coords}
                    icon={createCategoryMarkerIcon(v.categoryId, v.priceLabel)}
                  >
                    <Popup closeButton={false}>
                      <div
                        style={{
                          margin: '-14px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          width: '220px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                        onClick={() => navigate(`/vendor/${v.id}`)}
                        role="presentation"
                      >
                        <div style={{ position: 'relative' }}>
                          <img src={v.image} alt={v.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                          <span
                            style={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              background: getCategoryColor(v.categoryId),
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 20,
                            }}
                          >
                            {categories.find((c) => c.id === v.categoryId)?.shortLabel || v.categoryId}
                          </span>
                        </div>
                        <div style={{ padding: '12px' }}>
                          <h4 style={{ margin: '0 0 4px', fontSize: 15, color: '#111', fontWeight: 700 }}>{v.name}</h4>
                          <p style={{ margin: '0 0 6px', fontSize: 13, color: '#666' }}>{v.district}</p>
                          {v.map_link ? (
                            <a
                              href={v.map_link}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ fontSize: 12, color: '#2563eb', display: 'block', marginBottom: 6 }}
                            >
                              <i className="ph ph-map-pin" /> Xaritada ko'rish
                            </a>
                          ) : null}
                          <p style={{ margin: 0, fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>
                            {v.priceLabel}{' '}
                            <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{v.priceNote}</span>
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        ) : null}
      </section>

      {/* FILTER SHEET */}
      {showFilters ? (
        <>
          <div className="share-backdrop" onClick={() => setShowFilters(false)} />
          <div className="share-sheet" role="dialog">
            <div className="share-sheet-handle" />
            <h3 className="share-sheet-title">Filtrlar</h3>

            <div className="search-filter-panel" style={{ marginTop: 0, border: 'none', padding: 0 }}>
              <div className="search-filter-grid">
                <label className="search-filter-field">
                  <span>Kategoriya</span>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">Barchasi</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.shortLabel}</option>
                    ))}
                  </select>
                </label>
                <label className="search-filter-field">
                  <span>Tuman</span>
                  <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                    <option value="">Barchasi</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>
                <label className="search-filter-field">
                  <span>Min. reyting</span>
                  <select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                    <option value="">Hammasi</option>
                    <option value="4.5">4.5+</option>
                    <option value="4.0">4.0+</option>
                    <option value="3.5">3.5+</option>
                  </select>
                </label>
                <label className="search-filter-field">
                  <span>Tartiblash</span>
                  <select value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                    <option value="">Standart</option>
                    <option value="-rating">Reyting bo'yicha</option>
                    <option value="name">Nom A-Z</option>
                    <option value="-name">Nom Z-A</option>
                  </select>
                </label>
              </div>
              <div className="search-filter-actions">
                <button type="button" className="btn-outline" onClick={clearFilters}>Tozalash</button>
                <span className="search-filter-count">
                  {activeFilterCount ? `${activeFilterCount} ta filter` : "Filter yo'q"}
                </span>
              </div>
            </div>

            <button type="button" className="share-sheet-cancel" onClick={() => setShowFilters(false)}>
              Tayyor
            </button>
          </div>
        </>
      ) : null}
    </>
  );
}
