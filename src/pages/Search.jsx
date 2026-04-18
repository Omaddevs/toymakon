import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { ALL_CATEGORIES, searchVendors } from '../data/catalog';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [41.3111, 69.2401];
const DEFAULT_ZOOM = 12;

function getStableCoords(vendorId) {
  let hash = 0;
  for (let i = 0; i < vendorId.length; i++) {
    hash = vendorId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = 41.3111 + (Math.abs(hash) % 100) / 1000 - 0.05;
  const lng = 69.2401 + (Math.abs(hash >> 2) % 100) / 1000 - 0.05;
  return [lat, lng];
}

const createCustomIcon = (price) =>
  L.divIcon({
    className: 'custom-map-marker',
    html: `<div>${price}</div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 30],
    popupAnchor: [0, -30],
  });

const userDotIcon = L.divIcon({
  className: 'user-loc-marker',
  html: '<div class="user-loc-marker__dot"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapFitBounds({ positions, userPos }) {
  const map = useMap();

  useEffect(() => {
    const pts = userPos ? [userPos, ...positions] : [...positions];
    if (!pts.length) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (pts.length === 1) {
      map.setView(pts[0], 13);
      return;
    }
    const bounds = L.latLngBounds(pts);
    if (!bounds.isValid()) return;
    map.fitBounds(bounds, {
      padding: [56, 56],
      maxZoom: 14,
      animate: true,
    });
  }, [map, positions, userPos]);

  return null;
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  /** Karta ko‘rinishida joylashuv tasdiqlanguncha xarita ochilmaydi */
  const [mapAccess, setMapAccess] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [geoError, setGeoError] = useState('');

  const results = useMemo(() => searchVendors(query), [query]);
  const markerPositions = useMemo(() => results.map((v) => getStableCoords(v.id)), [results]);

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
      setGeoError('Brauzeringiz joylashuvni qo‘llab-quvvatlamaydi. «Toshkent markazi»ni tanlang.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setMapAccess(true);
      },
      () => {
        setGeoError('Joylashuvni olish mumkin emas. Ruxsat bering yoki «Toshkent markazi»ni tanlang.');
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 0 }
    );
  }, []);

  const confirmCenterOnly = useCallback(() => {
    setUserPos(null);
    setMapAccess(true);
    setGeoError('');
  }, []);

  return (
    <>
      <header className="mobile-header mobile-header--split mobile-only" style={{ zIndex: 1001 }}>
        <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)} aria-label="Orqaga">
          <i className="ph ph-arrow-left"></i>
        </button>
        <div className="header-location">
          <span>Qidiruv & Karta</span>
        </div>
      </header>

      <section
        className={`home-section search-page ${viewMode === 'map' ? 'search-page--map' : ''}`}
        style={viewMode === 'map' && mapAccess ? { padding: 0, overflow: 'hidden' } : {}}
      >
        <div
          className={`search-bar ${viewMode === 'map' ? 'search-bar--map' : ''}`}
        >
          <i className="ph ph-magnifying-glass search-icon"></i>
          <input
            type="search"
            placeholder="Izlash... hudud, nom, yoki kategoriya"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div
          className={`search-view-toggle ${viewMode === 'map' ? 'search-view-toggle--floating' : ''}`}
        >
          <div className="search-view-toggle__inner auth-tabs">
            <button
              type="button"
              className={`auth-tab ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={openListView}
            >
              Ro‘yxat
            </button>
            <button type="button" className={`auth-tab ${viewMode === 'map' ? 'is-active' : ''}`} onClick={openMapView}>
              Karta
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
            <div className="search-quick">
              <p className="search-quick-label">Kategoriyalar</p>
              <div className="search-chips">
                {ALL_CATEGORIES.map((c) => (
                  <button key={c.id} type="button" className="search-chip" onClick={() => navigate(`/category/${c.slug}`)}>
                    {c.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="section-header">
              <h2>Natijalar ({results.length})</h2>
            </div>
            <div className="listing-stack">
              {results.map((v) => {
                const cat = ALL_CATEGORIES.find((c) => c.id === v.categoryId);
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
                      <div className="card-meta">
                        {cat?.shortLabel} • {v.district}
                      </div>
                      <h4 className="card-title">{v.name}</h4>
                      <div className="card-price">
                        {v.priceLabel} <span>{v.priceNote}</span>
                      </div>
                    </div>
                    <i className="ph ph-caret-right search-result-chev" aria-hidden></i>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {viewMode === 'map' && !mapAccess ? (
          <div className="search-location-gate" role="dialog" aria-modal="true" aria-labelledby="loc-gate-title">
            <div className="search-location-gate__card">
              <div className="search-location-gate__icon" aria-hidden>
                <i className="ph ph-map-pin"></i>
              </div>
              <h2 id="loc-gate-title" className="search-location-gate__title">
                Joylashuvni tasdiqlang
              </h2>
              <p className="search-location-gate__text">
                Xaritada yaqin takliflarni ko‘rsatish uchun hozirgi joylashuvingizni ulashing yoki Toshkent markazidan
                foydalaning.
              </p>
              {geoError ? (
                <p className="search-location-gate__error" role="alert">
                  {geoError}
                </p>
              ) : null}
              <button type="button" className="btn-primary search-location-gate__btn" onClick={confirmDeviceLocation}>
                <i className="ph ph-crosshair" aria-hidden /> Joylashuvimni ulashish
              </button>
              <button type="button" className="btn-outline search-location-gate__btn" onClick={confirmCenterOnly}>
                Toshkent markazi bo‘yicha
              </button>
              <button type="button" className="search-location-gate__back" onClick={openListView}>
                Ro‘yxatga qaytish
              </button>
            </div>
          </div>
        ) : null}

        {viewMode === 'map' && mapAccess ? (
          <div className="search-map-wrap">
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
                const coords = getStableCoords(v.id);
                return (
                  <Marker key={v.id} position={coords} icon={createCustomIcon(v.priceLabel)}>
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
                        <img src={v.image} alt={v.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                        <div style={{ padding: '12px' }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111', fontWeight: 700 }}>{v.name}</h4>
                          <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#666', fontWeight: 500 }}>{v.district}</p>
                          <p style={{ margin: 0, fontSize: '14px', color: 'var(--accent)', fontWeight: 700 }}>
                            {v.priceLabel}{' '}
                            <span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>{v.priceNote}</span>
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
    </>
  );
}
