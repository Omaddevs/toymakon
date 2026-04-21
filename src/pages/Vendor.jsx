import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VendorHeroCarousel from '../components/VendorHeroCarousel';
import { StarsDisplay, StarsInput } from '../components/StarRating';
import AuthGateSheet from '../components/AuthGateSheet';
import { useAuth } from '../context/AuthContext';
import { enrichVendorForDetail } from '../data/catalog';
import { fetchCategories, fetchVendorByCode } from '../utils/catalogApi';
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
  const [vendor, setVendor] = useState(null);
  const [category, setCategory] = useState(null);
  const [pageState, setPageState] = useState('loading');

  const { user } = useAuth();

  useEffect(() => {
    if (!id) {
      setPageState('notfound');
      return;
    }
    let cancelled = false;
    setPageState('loading');
    setVendor(null);
    setCategory(null);
    (async () => {
      try {
        const v = await fetchVendorByCode(id);
        const cats = await fetchCategories();
        if (cancelled) return;
        setVendor(v);
        const cat = cats.find((c) => c.id === v.categoryId);
        setCategory(cat ?? { id: v.categoryId, shortLabel: v.categoryId, slug: '', title: '', icon: 'ph-storefront' });
        setPageState('ok');
      } catch (e) {
        if (cancelled) return;
        if (e?.status === 404) setPageState('notfound');
        else setPageState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [favTick, setFavTick] = useState(0);

  // Auth gate
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateHint, setAuthGateHint] = useState('');
  const afterAuthRef = useRef(null); // callback to run after successful login

  const getShareUrl = () =>
    `${window.location.origin}/vendor/${encodeURIComponent(id ?? '')}`;

  useEffect(() => {
    if (!shareOpen && !requestOpen && !authGateOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShareOpen(false);
        setRequestOpen(false);
        setAuthGateOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [shareOpen, requestOpen, authGateOpen]);

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

  if (pageState === 'loading') {
    return (
      <>
        <header className="mobile-header mobile-header--split mobile-only vendor-page-header">
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

  if (pageState === 'error') {
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
          <button type="button" className="btn-primary" onClick={() => navigate('/')}>
            Bosh sahifa
          </button>
        </section>
      </>
    );
  }

  if (pageState === 'notfound' || !vendor || !category || !detail) {
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
    showToast("Havola nusxalandi — Instagramda post yoki Storiesga qo'shishingiz mumkin");
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

  const doToggleFavorite = () => {
    const now = toggleFavorite(vendor.id);
    setFavTick((t) => t + 1);
    showToast(now ? "Sevimlilarga qo'shildi ❤️" : 'Sevimlilardan olib tashlandi');
  };

  const onToggleFavorite = () => {
    if (!user) {
      afterAuthRef.current = doToggleFavorite;
      setAuthGateHint("Sevimlilar ro'yxatiga qo'shish uchun tizimga kiring.");
      setAuthGateOpen(true);
      return;
    }
    doToggleFavorite();
  };

  const openRequestModal = () => {
    if (!user) {
      afterAuthRef.current = () => setRequestOpen(true);
      setAuthGateHint("So'rov yuborish uchun avval tizimga kiring yoki ro'yxatdan o'ting.");
      setAuthGateOpen(true);
      return;
    }
    setRequestOpen(true);
  };

  const submitRequest = (e) => {
    e.preventDefault();
    const msg = reqMessage.trim();
    if (msg.length < 8) {
      showToast("So'rov matni biroz batafsilroq bo'lsin");
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
    showToast("So'rov qabul qilindi — tez orada aloqaga chiqamiz");
  };

  const doSubmitReview = (text) => {
    const authorName = user?.username || 'Foydalanuvchi';
    addUserReview(vendor.id, { author: authorName, rating: reviewRating, text });
    setUserReviews(getUserReviews(vendor.id));
    setReviewText('');
    setReviewRating(5);
    showToast('Sharhingiz saqlandi — rahmat! ⭐');
  };

  const submitReview = (e) => {
    e.preventDefault();
    const text = reviewText.trim();
    if (text.length < 6) {
      showToast('Izohni biroz uzunroq yozing');
      return;
    }
    if (!user) {
      afterAuthRef.current = () => doSubmitReview(text);
      setAuthGateHint("Sharhni saqlash uchun tizimga kiring yoki ro'yxatdan o'ting.");
      setAuthGateOpen(true);
      return;
    }
    doSubmitReview(text);
  };

  const nameLabel =
    vendor.categoryId === 'venue' ? "To'yxona nomi" : `${category.shortLabel} nomi`;

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

      <VendorHeroCarousel key={vendor.id} images={allImages} badge={vendor.badge} name={vendor.name} />

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
          {(vendor.specs ?? []).map((s) => (
            <div key={s.label} className="vendor-spec-row">
              <span className="vendor-spec-label">{s.label}</span>
              <span className="vendor-spec-value">{s.value}</span>
            </div>
          ))}
        </div>

        <div className="vendor-actions">
          {vendor.phone ? (
            <a className="btn-primary vendor-phone-btn" href={`tel:${String(vendor.phone).replace(/[^\d+]/g, '')}`}>
              <i className="ph ph-phone" aria-hidden /> Qo‘ng‘iroq qilish
            </a>
          ) : null}
          <a
            className="btn-outline vendor-tg-btn"
            href={telegramContactUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="ph ph-telegram-logo" aria-hidden /> Telegram
          </a>
          <button type="button" className="btn-outline vendor-request-btn" onClick={openRequestModal}>
            <i className="ph ph-chat-circle-dots" aria-hidden /> So‘rov yuborish
          </button>
          <button
            type="button"
            className={`btn-outline vendor-fav-btn ${isFav ? 'is-active' : ''}`}
            onClick={onToggleFavorite}
            aria-pressed={isFav}
          >
            <i className={isFav ? 'ph-fill ph-heart' : 'ph-thin ph-heart'} aria-hidden />
            {isFav ? 'Sevimlilarda' : "Sevimlilarga qo'shish"}
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
            <p className="vendor-reviews-empty">Hozircha sharhlar yo'q — birinchi bo'lib qoldiring.</p>
          )}

          <form className="vendor-review-form" onSubmit={submitReview}>
            <h3 className="vendor-review-form__title">Sharh qoldirish</h3>
            {user ? (
              <div className="vendor-review-form__author-row">
                <i className="ph ph-user-circle vendor-review-author-icon" aria-hidden />
                <span className="vendor-review-author-name">{user.username}</span>
              </div>
            ) : (
              <p className="vendor-review-form__guest-hint">
                <i className="ph ph-info" aria-hidden />
                Baholash va izohni yozing. Yuborishda tizimga kirish yoki ro‘yxatdan o‘tish so‘raladi.
              </p>
            )}
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
              {user ? 'Yuborish' : 'Tizimga kirib yuborish'}
            </button>
          </form>
        </div>

        {category.slug ? (
          <button type="button" className="btn-outline vendor-more-cat" onClick={() => navigate(`/category/${category.slug}`)}>
            Shu yo‘nalishdagi boshqalari
          </button>
        ) : null}
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
