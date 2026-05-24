import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReviewsByUsername, deleteUserReview } from '../utils/vendorReviewsStorage';
import { fetchVendors } from '../utils/catalogApi';
import {
  sendOTPRequest,
  verifyOTPRequest,
  completeRegistrationRequest,
} from '../utils/authApi';

// ─── Math CAPTCHA ───
function useCaptcha() {
  const generate = useCallback(() => {
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * (op === '-' ? a : 10)) + 1;
    const answer = op === '+' ? a + b : a - b;
    return { question: `${a} ${op} ${b}`, answer };
  }, []);

  const [captcha, setCaptcha] = useState(() => generate());
  const refresh = useCallback(() => setCaptcha(generate()), [generate]);
  return { captcha, refresh };
}

function CaptchaField({ captcha, value, onChange, onRefresh }) {
  return (
    <div className="captcha-row">
      <div className="captcha-question" onClick={onRefresh} title="Yangilash uchun bosing">
        <span className="captcha-expr">{captcha.question} = ?</span>
        <i className="ph ph-arrows-clockwise captcha-refresh" />
      </div>
      <input
        className="auth-input captcha-input"
        type="number"
        inputMode="numeric"
        placeholder="Javobni kiriting"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}

function msgForError(code) {
  switch (code) {
    case 'username_invalid': return "Foydalanuvchi nomini kiriting.";
    case 'password_too_long': return "Parol juda uzun.";
    case 'mismatch': return "Parollar mos kelmayapti.";
    case 'exists': return "Bu foydalanuvchi nomi band.";
    case 'credentials': return "Login yoki parol noto'g'ri.";
    case 'captcha': return "Captcha javobi noto'g'ri.";
    case 'api': return "Server bilan aloqa xatosi.";
    default: return "Xatolik yuz berdi. Qayta urinib ko'ring.";
  }
}

// ─── Login Form ───
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [captchaVal, setCaptchaVal] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { captcha, refresh: refreshCaptcha } = useCaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (parseInt(captchaVal, 10) !== captcha.answer) {
      setError(msgForError('captcha'));
      refreshCaptcha();
      setCaptchaVal('');
      return;
    }
    setLoading(true);
    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err?.humanMessage || msgForError(err?.message || ''));
      refreshCaptcha();
      setCaptchaVal('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label className="auth-field">
        <span className="auth-label">Foydalanuvchi nomi</span>
        <div className="auth-input-wrap">
          <i className="ph ph-user auth-input-icon" />
          <input
            className="auth-input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="masalan, Madina"
            maxLength={200}
            required
          />
        </div>
      </label>

      <label className="auth-field">
        <span className="auth-label">Parol</span>
        <div className="auth-input-wrap">
          <i className="ph ph-lock auth-input-icon" />
          <input
            className="auth-input auth-input--with-toggle"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            maxLength={4096}
          />
          <button type="button" className="auth-toggle-pass" onClick={() => setShowPass((v) => !v)}>
            <i className={showPass ? 'ph ph-eye-slash' : 'ph ph-eye'} />
          </button>
        </div>
      </label>

      <label className="auth-field">
        <span className="auth-label">Tasdiqlash</span>
        <CaptchaField
          captcha={captcha}
          value={captchaVal}
          onChange={setCaptchaVal}
          onRefresh={() => { refreshCaptcha(); setCaptchaVal(''); }}
        />
      </label>

      {error && (
        <div className="auth-error" role="alert">
          <i className="ph ph-warning-circle" /> {error}
        </div>
      )}

      <button type="submit" className="btn-primary auth-submit" disabled={loading}>
        {loading ? 'Kutilmoqda…' : 'Kirish'}
      </button>
    </form>
  );
}

// ─── Register steps ───
// Step 1: Enter phone
// Step 2: Enter OTP code
// Step 3: Create username + password

function RegisterFlow({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [regToken, setRegToken] = useState('');
  const [botUsername, setBotUsername] = useState('ayol_karyera_bot');
  const [botLink, setBotLink] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [captchaVal, setCaptchaVal] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { captcha, refresh: refreshCaptcha } = useCaptcha();

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) { setError("Telefon raqamini kiriting."); return; }
    setLoading(true);
    try {
      const res = await sendOTPRequest(phone.trim());
      setBotUsername(res.bot_username || 'ayol_karyera_bot');
      setBotLink(res.bot_link || '');
      if (res.debug_code) setDebugCode(res.debug_code);
      setStep(2);
    } catch (err) {
      setError(err?.humanMessage || "Xato yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpCode.trim()) { setError("Tasdiqlash kodini kiriting."); return; }
    setLoading(true);
    try {
      const res = await verifyOTPRequest(phone, otpCode.trim());
      setRegToken(res.reg_token);
      setStep(3);
    } catch (err) {
      setError(err?.humanMessage || "Kod noto'g'ri.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete registration
  const handleComplete = async (e) => {
    e.preventDefault();
    setError('');
    if (parseInt(captchaVal, 10) !== captcha.answer) {
      setError(msgForError('captcha'));
      refreshCaptcha();
      setCaptchaVal('');
      return;
    }
    if (!username.trim()) { setError("Foydalanuvchi nomini kiriting."); return; }
    if (password.length < 6) { setError("Parol kamida 6 belgidan iborat bo'lishi kerak."); return; }
    if (password !== password2) { setError(msgForError('mismatch')); return; }
    setLoading(true);
    try {
      await completeRegistrationRequest({ phone, reg_token: regToken, username, password, password_confirm: password2 });
      onSuccess();
    } catch (err) {
      setError(err?.humanMessage || msgForError(err?.message || ''));
      refreshCaptcha();
      setCaptchaVal('');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <form className="auth-form" onSubmit={handleSendOTP} noValidate>
        <div className="auth-otp-intro">
          <div className="auth-otp-icon"><i className="ph ph-telegram-logo" /></div>
          <p>Telefon raqamingizni kiriting. Tasdiqlash kodi Telegram bot orqali yuboriladi.</p>
        </div>
        <label className="auth-field">
          <span className="auth-label">Telefon raqam</span>
          <div className="auth-input-wrap">
            <i className="ph ph-phone auth-input-icon" />
            <input
              className="auth-input"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              required
            />
          </div>
        </label>
        {error && <div className="auth-error" role="alert"><i className="ph ph-warning-circle" /> {error}</div>}
        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
          {loading ? 'Yuklanmoqda…' : 'Kod olish'}
        </button>
      </form>
    );
  }

  if (step === 2) {
    return (
      <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
        <div className="auth-otp-intro">
          <div className="auth-otp-icon auth-otp-icon--success"><i className="ph ph-telegram-logo" /></div>
          <p>Telegram botni oching — u sizga <b>6 xonali kod</b> yuboradi.</p>
        </div>
        <a
          href={botLink || `https://t.me/${botUsername}`}
          target="_blank"
          rel="noreferrer"
          className="auth-otp-bot-link auth-otp-bot-link--big"
        >
          <i className="ph ph-telegram-logo" /> Telegram botni ochish
        </a>
        <p className="auth-otp-step-hint">
          Botda <b>Start</b> tugmasini bosing — kod avtomatik yuboriladi.
        </p>
        {debugCode && (
          <div className="auth-otp-debug">
            <i className="ph ph-bug" /> Debug kod: <b>{debugCode}</b>
          </div>
        )}
        <div className="auth-otp-divider">Kodni oldingizmi?</div>
        <label className="auth-field">
          <span className="auth-label">Tasdiqlash kodi (6 ta raqam)</span>
          <div className="auth-input-wrap">
            <i className="ph ph-key auth-input-icon" />
            <input
              className="auth-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              required
            />
          </div>
        </label>
        {error && <div className="auth-error" role="alert"><i className="ph ph-warning-circle" /> {error}</div>}
        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
          {loading ? 'Tekshirilmoqda…' : 'Tasdiqlash'}
        </button>
        <button
          type="button"
          className="auth-back-btn"
          onClick={() => { setStep(1); setError(''); setOtpCode(''); }}
        >
          <i className="ph ph-arrow-left" /> Orqaga
        </button>
      </form>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleComplete} noValidate>
      <div className="auth-otp-intro">
        <div className="auth-otp-icon auth-otp-icon--done"><i className="ph ph-check-circle" /></div>
        <p>Telefon <b>{phone}</b> tasdiqlandi! Hisob yarating.</p>
      </div>
      <label className="auth-field">
        <span className="auth-label">Foydalanuvchi nomi</span>
        <div className="auth-input-wrap">
          <i className="ph ph-user auth-input-icon" />
          <input
            className="auth-input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="masalan, Madina92"
            maxLength={150}
            required
          />
        </div>
      </label>
      <label className="auth-field">
        <span className="auth-label">Parol</span>
        <div className="auth-input-wrap">
          <i className="ph ph-lock auth-input-icon" />
          <input
            className="auth-input auth-input--with-toggle"
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kamida 6 belgi"
            maxLength={128}
          />
          <button type="button" className="auth-toggle-pass" onClick={() => setShowPass((v) => !v)}>
            <i className={showPass ? 'ph ph-eye-slash' : 'ph ph-eye'} />
          </button>
        </div>
      </label>
      <label className="auth-field">
        <span className="auth-label">Parolni tasdiqlang</span>
        <div className="auth-input-wrap">
          <i className="ph ph-lock auth-input-icon" />
          <input
            className="auth-input"
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="Parolni qayta kiriting"
            maxLength={128}
          />
        </div>
      </label>
      <label className="auth-field">
        <span className="auth-label">Tasdiqlash</span>
        <CaptchaField
          captcha={captcha}
          value={captchaVal}
          onChange={setCaptchaVal}
          onRefresh={() => { refreshCaptcha(); setCaptchaVal(''); }}
        />
      </label>
      {error && <div className="auth-error" role="alert"><i className="ph ph-warning-circle" /> {error}</div>}
      <button type="submit" className="btn-primary auth-submit" disabled={loading}>
        {loading ? 'Yaratilmoqda…' : 'Hisob yaratish'}
      </button>
    </form>
  );
}

export default function Profile() {
  const { user, ready, login, logout } = useAuth();
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  const [vendorNames, setVendorNames] = useState({});

  useEffect(() => {
    if (user && activeModal === 'reviews') {
      const revs = getReviewsByUsername(user.username);
      setMyReviews(revs);
      fetchVendors()
        .then((list) => {
          const m = {};
          for (const v of list) m[v.id] = v.name;
          setVendorNames(m);
        })
        .catch(() => setVendorNames({}));
    }
  }, [user, activeModal]);

  const handleDeleteReview = (vendorId, reviewId) => {
    if (window.confirm("Rostdan ham ushbu sharhni o'chirishni xohlaysizmi?")) {
      deleteUserReview(vendorId, reviewId);
      setMyReviews(getReviewsByUsername(user.username));
    }
  };

  const handleLogin = async (username, password) => {
    await login(username, password);
  };

  const switchMode = (next) => { setMode(next); };

  if (!ready) {
    return (
      <div className="profile-auth profile-auth--loading">
        <header className="mobile-header mobile-only">
          <div className="header-location">
            <i className="ph ph-user" /><span>Profil</span>
          </div>
        </header>
        <p className="auth-loading-text">Yuklanmoqda…</p>
      </div>
    );
  }

  return (
    <>
      <header className="mobile-header mobile-only">
        <div className="header-location">
          <i className="ph ph-user" /><span>Profil</span>
        </div>
      </header>

      <section className="home-section profile-auth last-section">
        {user ? (
          <div className="auth-card auth-card--welcome">
            <div className="auth-welcome-hero" style={{ paddingBottom: 16 }}>
              <div className="auth-avatar"><i className="ph ph-user-circle" /></div>
              <h1 className="auth-welcome-title">Xush kelibsiz</h1>
              <p className="auth-welcome-name" style={{ fontSize: 22, marginBottom: 8 }}>{user.username}</p>
              <p className="auth-welcome-hint">Barcha ma'lumotlar saqlangan va xavfsiz.</p>
            </div>

            <div className="profile-menu">
              <button type="button" className="profile-menu-item" onClick={() => navigate('/favorites')}>
                <div className="profile-menu-icon" style={{ color: 'var(--accent)' }}><i className="ph ph-heart" /></div>
                <span>Saqlangan e'lonlar</span>
                <i className="ph ph-caret-right profile-menu-chev" />
              </button>
              <button type="button" className="profile-menu-item" onClick={() => setActiveModal('reviews')}>
                <div className="profile-menu-icon" style={{ color: '#4B88E5' }}><i className="ph ph-chat-circle-text" /></div>
                <span>Mening sharhlarim</span>
                <i className="ph ph-caret-right profile-menu-chev" />
              </button>
              <button type="button" className="profile-menu-item" onClick={() => setActiveModal('settings')}>
                <div className="profile-menu-icon" style={{ color: '#10b981' }}><i className="ph ph-gear" /></div>
                <span>Sozlamalar</span>
                <i className="ph ph-caret-right profile-menu-chev" />
              </button>
              <button type="button" className="profile-menu-item" onClick={() => setActiveModal('help')}>
                <div className="profile-menu-icon" style={{ color: '#f59e0b' }}><i className="ph ph-question" /></div>
                <span>Yordam qidirish</span>
                <i className="ph ph-caret-right profile-menu-chev" />
              </button>
              {user?.is_staff ? (
                <>
                  <button type="button" className="profile-menu-item profile-menu-item--admin" onClick={() => navigate('/admin')}>
                    <div className="profile-menu-icon" style={{ color: '#fff' }}><i className="ph ph-shield-check" /></div>
                    <span>Admin Panel</span>
                    <i className="ph ph-caret-right profile-menu-chev" style={{ color: '#fff' }} />
                  </button>
                  <button type="button" className="profile-menu-item" onClick={() => navigate('/profile/top-venues')}>
                    <div className="profile-menu-icon" style={{ color: 'var(--primary)' }}><i className="ph ph-sliders" /></div>
                    <span>Top to'yxonalarni boshqarish</span>
                    <i className="ph ph-caret-right profile-menu-chev" />
                  </button>
                </>
              ) : null}
            </div>

            <button type="button" className="btn-outline auth-logout-btn" onClick={logout}>
              <i className="ph ph-sign-out" /> Hisobdan chiqish
            </button>
          </div>
        ) : (
          <div className="auth-layout">
            <div className="auth-hero-strip">
              <div className="auth-hero-strip__glow" />
              <div className="auth-hero-strip__icon"><i className="ph ph-heart" /></div>
              <h2 className="auth-hero-strip__title">Toymakon</h2>
              <p className="auth-hero-strip__sub">To'yingiz uchun bitta joy</p>
            </div>

            <div className="auth-card">
              <div className="auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
                  onClick={() => switchMode('login')}
                >
                  Kirish
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'register'}
                  className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
                  onClick={() => switchMode('register')}
                >
                  Ro'yxatdan o'tish
                </button>
              </div>

              {mode === 'login' ? (
                <LoginForm onLogin={handleLogin} />
              ) : (
                <RegisterFlow onSuccess={() => {}} />
              )}

              <p className="auth-footnote">
                Ma'lumotlaringiz xavfsiz saqlanadi. Parolingizni hech kimga bermang.
              </p>
            </div>
          </div>
        )}
      </section>

      {activeModal && (
        <>
          <div className="share-backdrop" onClick={() => setActiveModal(null)} />
          <div className="share-sheet">
            <div className="share-sheet-handle" />

            {activeModal === 'settings' && (
              <>
                <h3 className="share-sheet-title">Sozlamalar</h3>
                <div style={{ padding: '4px 8px 16px' }}>
                  <label className="auth-field">
                    <span className="auth-label">Viloyatni tanlang</span>
                    <select className="auth-input" defaultValue="Toshkent">
                      <option value="Toshkent">Toshkent (barcha tumanlar)</option>
                      <option value="Samarqand">Samarqand viloyati</option>
                      <option value="Buxoro">Buxoro viloyati</option>
                      <option value="Xorazm">Xorazm viloyati</option>
                      <option value="Andijon">Andijon viloyati</option>
                      <option value="Fargona">Farg'ona viloyati</option>
                      <option value="Namangan">Namangan viloyati</option>
                    </select>
                  </label>
                </div>
              </>
            )}

            {activeModal === 'help' && (
              <>
                <h3 className="share-sheet-title">Yordam qidirish</h3>
                <p className="auth-welcome-hint" style={{ textAlign: 'center', marginBottom: 16 }}>
                  G'oyalar, takliflar yoki texnik yordam uchun biz bilan bog'laning.
                </p>
                <div className="share-sheet-actions">
                  <a href="tel:+998877353636" className="share-sheet-item" style={{ textDecoration: 'none' }}>
                    <i className="ph ph-phone" style={{ color: 'var(--accent)' }} />
                    <span>+998 (87) 735-36-36</span>
                  </a>
                  <a href="https://t.me/toymakon_admin" target="_blank" rel="noreferrer" className="share-sheet-item" style={{ textDecoration: 'none' }}>
                    <i className="ph ph-telegram-logo" style={{ color: '#229ed9' }} />
                    <span>Telegram orqali yozish</span>
                  </a>
                </div>
              </>
            )}

            {activeModal === 'reviews' && (
              <>
                <h3 className="share-sheet-title">Mening sharhlarim ({myReviews.length})</h3>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '12px 4px 16px' }}>
                  {myReviews.length === 0 ? (
                    <p className="auth-welcome-hint" style={{ textAlign: 'center', marginTop: 30, marginBottom: 30 }}>
                      Siz hali hech qanday sharh qoldirmagansiz.
                    </p>
                  ) : myReviews.map((r) => {
                    const name = vendorNames[r.vendorId];
                    return (
                      <div key={r.id} style={{ background: 'var(--bg-surface)', padding: 14, borderRadius: 'var(--radius-sm)', marginBottom: 12, border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontSize: 14, fontWeight: 'bold' }}>{name || "Noma'lum xizmat"}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.date}</div>
                        </div>
                        <div style={{ fontSize: 14, color: '#fbbf24', marginBottom: 10, letterSpacing: 2 }}>
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>
                        <p style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.45 }}>{r.text}</p>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleDeleteReview(r.vendorId, r.id)}
                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                          >
                            O'chirish
                          </button>
                          <button
                            onClick={() => navigate(`/vendor/${r.vendorId}`)}
                            style={{ background: 'var(--accent-light)', border: 'none', color: 'var(--accent)', padding: '6px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                          >
                            Ko'rish
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <button type="button" className="share-sheet-cancel" onClick={() => setActiveModal(null)}>
              Yopish
            </button>
          </div>
        </>
      )}
    </>
  );
}
