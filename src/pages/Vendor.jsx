import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VendorHeroCarousel from '../components/VendorHeroCarousel';
import { StarsDisplay, StarsInput } from '../components/StarRating';
import { enrichVendorForDetail, getVendorById, ALL_CATEGORIES } from '../data/catalog';
import { isFavorite, toggleFavorite } from '../utils/favoritesStorage';
import { addUserReview, getUserReviews } from '../utils/vendorReviewsStorage';
import { saveRequest } from '../utils/vendorRequestsStorage';

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    /* fallback below */
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(ta);
  }
}

export default function Vendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const vendor = getVendorById(id);
  const category = vendor ? ALL_CATEGORIES.find((c) => c.id === vendor.categoryId) : null;

  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [favTick, setFavTick] = useState(0);

  const getShareUrl = () =>
    `${window.location.origin}/vendor/${encodeURIComponent(id ?? '')}`;

  useEffect(() => {
    if (!shareOpen && !requestOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShareOpen(false);
        setRequestOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [shareOpen, requestOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showToast = (msg) => setToast(msg);

  useEffect(() => {
    const fn = () => setFavTick((t) => t + 1);
    window.addEventListener('toymakon-favorites', fn);
    return () => window.removeEventListener('toymakon-favorites', fn);
  }, []);

  const detail = useMemo(
    () => (vendor && category ? enrichVendorForDetail(vendor) : null),
    [vendor, category]
  );

  const [userReviews, setUserReviews] = useState([]);

  useEffect(() => {
    if (!vendor?.id) return;
    setUserReviews(getUserReviews(vendor.id));
  }, [vendor?.id]);

  const allReviews = useMemo(() => {
    if (!detail) return [];
    const merged = [...detail.catalogReviews, ...userReviews].map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      text: r.text,
      date: r.date,
    }));
    merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return merged;
  }, [detail, userReviews]);

  const avgRating = useMemo(() => {
    if (!detail) return 0;
    if (!allReviews.length) return detail.displayRating;
    const s = allReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Math.round((s / allReviews.length) * 10) / 10;
  }, [allReviews, detail]);

  const isFav = useMemo(() => (vendor ? isFavorite(vendor.id) : false), [vendor?.id, favTick]);

  if (!vendor || !category || !detail) {
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
          <p className="muted-text">Bu sahifa mavjud emas yoki olib tashlangan.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/')}>
            Bosh sahifa
          </button>
        </section>
      </>
    );
  }

  const allImages = [vendor.image, ...(vendor.gallery || [])].filter(Boolean);
  const shareText = `${vendor.name} — Toymakon`;

  const closeShare = () => setShareOpen(false);

  const openTelegramShare = () => {
    const url = getShareUrl();
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    );
    closeShare();
  };

  const openFacebook = () => {
    const url = getShareUrl();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    );
    closeShare();
  };

  const shareInstagram = async () => {
    const url = getShareUrl();
    await copyTextToClipboard(url);
    showToast('Havola nusxalandi — Instagramda post yoki Storiesga qo‘shishingiz mumkin');
    closeShare();
  };

  const copyPageLink = async () => {
    const url = getShareUrl();
    await copyTextToClipboard(url);
    showToast('Havola vaqtinchalik xotiraga nusxalandi');
    closeShare();
  };

  const telegramContactUrl = vendor.telegram
    ? `https://t.me/${String(vendor.telegram).replace(/^@/, '')}`
    : `https://t.me/share/url?text=${encodeURIComponent(`Salom! «${vendor.name}» bo‘yicha ma’lumot olmoqchiman.`)}`;

  const onToggleFavorite = () => {
    const now = toggleFavorite(vendor.id);
    setFavTick((t) => t + 1);
    showToast(now ? 'Sevimlilarga qo‘shildi' : 'Sevimlilardan olib tashlandi');
  };

  const submitRequest = (e) => {
    e.preventDefault();
    const msg = reqMessage.trim();
    if (msg.length < 8) {
      showToast('So‘rov matni biroz batafsilroq bo‘lsin');
      return;
    }
    saveRequest({
      vendorId: vendor.id,
      vendorName: vendor.name,
      name: reqName,
      phone: reqPhone,
      message: msg,
    });
    setRequestOpen(false);
    setReqName('');
    setReqPhone('');
    setReqMessage('');
    showToast('So‘rov qabul qilindi — tez orada aloqaga chiqamiz');
  };

  const submitReview = (e) => {
    e.preventDefault();
    const text = reviewText.trim();
    if (text.length < 6) {
      showToast('Izohni biroz uzunroq yozing');
      return;
    }
    addUserReview(vendor.id, { author: reviewAuthor, rating: reviewRating, text });
    setUserReviews(getUserReviews(vendor.id));
    setReviewText('');
    setReviewAuthor('');
    setReviewRating(5);
    showToast('Sharhingiz saqlandi — rahmat!');
  };

  const nameLabel =
    vendor.categoryId === 'venue' ? 'To‘yxona nomi' : `${category.shortLabel} nomi`;

  return (
    <>
      {toast ? (
        <div className="share-toast" role="status">
          {toast}
        </div>
      ) : null}

      <header className="mobile-header mobile-header--split mobile-only vendor-page-header">
        <button type="button" className="icon-btn header-back" onClick={() => navigate(-1)} aria-label="Orqaga">
          <i className="ph ph-arrow-left"></i>
        </button>
        <div className="header-location">
          <span className="header-title-truncate">{vendor.name}</span>
        </div>
        <button type="button" className="icon-btn" aria-label="Ulashish" onClick={() => setShareOpen(true)}>
          <i className="ph ph-share-network"></i>
        </button>
      </header>

      <VendorHeroCarousel images={allImages} badge={vendor.badge} name={vendor.name} />

      <section className="vendor-detail">
        <p className="vendor-field-label">{nameLabel}</p>
        <div className="vendor-detail-title-row">
          <h1 className="vendor-detail-title">{vendor.name}</h1>
          <button
            type="button"
            className="icon-btn vendor-detail-share desktop-only"
            aria-label="Ulashish"
            onClick={() => setShareOpen(true)}
          >
            <i className="ph ph-share-network"></i>
          </button>
        </div>
        <p className="card-meta vendor-detail-sub">
          {category.shortLabel} • {vendor.district}
        </p>

        <div className="vendor-location-block">
          <h2 className="vendor-section-title vendor-section-title--small">Lokatsiya</h2>
          <a
            className="vendor-location-link"
            href={detail.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="ph ph-map-pin" aria-hidden />
            <span>{detail.displayLocation}</span>
            <i className="ph ph-arrow-square-out vendor-location-link__icon" aria-hidden />
          </a>
        </div>

        <div className="vendor-rating-block">
          <h2 className="vendor-section-title vendor-section-title--small">Reyting</h2>
          <div className="vendor-rating-row">
            <StarsDisplay value={avgRating} sizeClass="vendor-star--md" />
            <span className="vendor-rating-num">{avgRating.toFixed(1)}</span>
            <span className="vendor-rating-count">{allReviews.length} sharh</span>
          </div>
        </div>

        <p className="vendor-tagline">{detail.displayTagline}</p>

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

        <div className="vendor-actions">
          <a className="btn-primary vendor-phone-btn" href={`tel:${vendor.phone.replace(/[^\d+]/g, '')}`}>
            <i className="ph ph-phone" aria-hidden /> Qo‘ng‘iroq qilish
          </a>
          <a
            className="btn-outline vendor-tg-btn"
            href={telegramContactUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="ph ph-telegram-logo" aria-hidden /> Telegram
          </a>
          <button type="button" className="btn-outline vendor-request-btn" onClick={() => setRequestOpen(true)}>
            <i className="ph ph-chat-circle-dots" aria-hidden /> So‘rov yuborish
          </button>
          <button
            type="button"
            className={`btn-outline vendor-fav-btn ${isFav ? 'is-active' : ''}`}
            onClick={onToggleFavorite}
            aria-pressed={isFav}
          >
            <i className={isFav ? 'ph ph-heart-fill' : 'ph ph-heart'} aria-hidden />
            {isFav ? 'Sevimlilarda' : 'Sevimlilarga qo‘shish'}
          </button>
        </div>

        <div className="vendor-reviews">
          <h2 className="vendor-section-title">Sharhlar</h2>
          {allReviews.length ? (
            <ul className="vendor-review-list">
              {allReviews.map((r) => (
                <li key={r.id} className="vendor-review-card">
                  <div className="vendor-review-card__head">
                    <span className="vendor-review-card__author">{r.author}</span>
                    <StarsDisplay value={r.rating} sizeClass="vendor-star--sm" />
                  </div>
                  <p className="vendor-review-card__text">{r.text}</p>
                  <time className="vendor-review-card__date" dateTime={r.date}>
                    {r.date}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="vendor-reviews-empty">Hozircha sharhlar yo‘q — birinchi bo‘lib qoldiring.</p>
          )}

          <form className="vendor-review-form" onSubmit={submitReview}>
            <h3 className="vendor-review-form__title">Sharh qoldirish</h3>
            <label className="vendor-review-form__label">
              Ism (ixtiyoriy)
              <input
                type="text"
                className="vendor-review-form__input"
                value={reviewAuthor}
                onChange={(e) => setReviewAuthor(e.target.value)}
                placeholder="Masalan, Jasur"
                maxLength={60}
              />
            </label>
            <span className="vendor-review-form__label">Baholash</span>
            <StarsInput value={reviewRating} onChange={setReviewRating} />
            <label className="vendor-review-form__label">
              Izoh
              <textarea
                className="vendor-review-form__textarea"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tajribangiz haqida qisqacha yozing…"
                rows={4}
                required
                minLength={6}
              />
            </label>
            <button type="submit" className="btn-primary vendor-review-form__submit">
              Yuborish
            </button>
          </form>
        </div>

        <button type="button" className="btn-outline vendor-more-cat" onClick={() => navigate(`/category/${category.slug}`)}>
          Shu yo‘nalishdagi boshqalari
        </button>
      </section>

      {requestOpen ? (
        <>
          <div className="request-backdrop" onClick={() => setRequestOpen(false)} role="presentation" aria-hidden />
          <div
            className="request-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-sheet-title"
          >
            <div className="request-sheet-handle" aria-hidden />
            <h2 id="request-sheet-title" className="request-sheet-title">
              So‘rov yuborish
            </h2>
            <p className="request-sheet-sub">{vendor.name}</p>
            <form className="request-sheet-form" onSubmit={submitRequest}>
              <label className="request-sheet-label">
                Ism
                <input
                  type="text"
                  className="request-sheet-input"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  placeholder="Ismingiz"
                  autoComplete="name"
                />
              </label>
              <label className="request-sheet-label">
                Telefon
                <input
                  type="tel"
                  className="request-sheet-input"
                  value={reqPhone}
                  onChange={(e) => setReqPhone(e.target.value)}
                  placeholder="+998 …"
                  autoComplete="tel"
                />
              </label>
              <label className="request-sheet-label">
                Xabar <span className="request-sheet-req">*</span>
                <textarea
                  className="request-sheet-textarea"
                  value={reqMessage}
                  onChange={(e) => setReqMessage(e.target.value)}
                  placeholder="Sana, taxminiy mehmonlar soni yoki savolingiz…"
                  rows={5}
                  required
                  minLength={8}
                />
              </label>
              <button type="submit" className="btn-primary request-sheet-submit">
                Yuborish
              </button>
              <button type="button" className="request-sheet-cancel" onClick={() => setRequestOpen(false)}>
                Bekor qilish
              </button>
            </form>
          </div>
        </>
      ) : null}

      {shareOpen ? (
        <>
          <div className="share-backdrop" onClick={closeShare} role="presentation" aria-hidden />
          <div
            className="share-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-sheet-title"
          >
            <div className="share-sheet-handle" aria-hidden />
            <h2 id="share-sheet-title" className="share-sheet-title">
              Ulashish
            </h2>
            <div className="share-sheet-actions">
              <button type="button" className="share-sheet-item share-sheet-item--telegram" onClick={openTelegramShare}>
                <i className="ph ph-telegram-logo" aria-hidden />
                <span>Telegram</span>
              </button>
              <button type="button" className="share-sheet-item share-sheet-item--facebook" onClick={openFacebook}>
                <i className="ph ph-facebook-logo" aria-hidden />
                <span>Facebook</span>
              </button>
              <button type="button" className="share-sheet-item share-sheet-item--instagram" onClick={shareInstagram}>
                <i className="ph ph-instagram-logo" aria-hidden />
                <span>Instagram</span>
              </button>
              <button type="button" className="share-sheet-item share-sheet-item--copy" onClick={copyPageLink}>
                <i className="ph ph-copy" aria-hidden />
                <span>Havolani nusxalash</span>
              </button>
            </div>
            <button type="button" className="share-sheet-cancel" onClick={closeShare}>
              Bekor qilish
            </button>
          </div>
        </>
      ) : null}
    </>
  );
}
