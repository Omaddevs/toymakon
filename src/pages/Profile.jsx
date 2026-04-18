import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReviewsByUsername, deleteUserReview } from '../utils/vendorReviewsStorage';
import { VENDORS } from '../data/catalog';

function msgForError(code) {
  switch (code) {
    case 'username_invalid':
      return 'Foydalanuvchi nomini kiriting.';
    case 'username_too_long':
      return 'Foydalanuvchi nomi juda uzun (maks. 200 belgi).';
    case 'password_too_long':
      return 'Parol juda uzun (maks. 4096 belgi).';
    case 'mismatch':
      return 'Parollar mos kelmayapti.';
    case 'exists':
      return 'Bu foydalanuvchi nomi band. Boshqa nom tanlang.';
    case 'credentials':
      return 'Login yoki parol noto‘g‘ri.';
    default:
      return 'Xatolik yuz berdi. Qayta urinib ko‘ring.';
  }
}

export default function Profile() {
  const { user, ready, login, register, logout } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && activeModal === 'reviews') {
      const revs = getReviewsByUsername(user.username);
      setMyReviews(revs);
    }
  }, [user, activeModal]);

  const handleDeleteReview = (vendorId, reviewId) => {
    if (window.confirm("Rostdan ham ushbu sharhni o'chirishni xohlaysizmi?")) {
      deleteUserReview(vendorId, reviewId);
      setMyReviews(getReviewsByUsername(user.username));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password, password2);
      }
      setPassword('');
      setPassword2('');
    } catch (err) {
      const code = err?.message || 'unknown';
      setError(msgForError(code));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setPassword('');
    setPassword2('');
  };

  if (!ready) {
    return (
      <div className="profile-auth profile-auth--loading">
        <header className="mobile-header mobile-only">
          <div className="header-location">
            <i className="ph ph-user"></i>
            <span>Profil</span>
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
          <i className="ph ph-user"></i>
          <span>Profil</span>
        </div>
      </header>

      <section className="home-section profile-auth last-section">
        {user ? (
          <div className="auth-card auth-card--welcome">
            <div className="auth-welcome-hero" style={{ paddingBottom: '16px' }}>
              <div className="auth-avatar" aria-hidden>
                <i className="ph ph-user-circle"></i>
              </div>
              <h1 className="auth-welcome-title">Xush kelibsiz</h1>
              <p className="auth-welcome-name" style={{ fontSize: '22px', marginBottom: '8px' }}>{user.username}</p>
              <p className="auth-welcome-hint">Barcha ma'lumotlar saqlangan va xavfsiz.</p>
            </div>
            
            <div className="profile-menu">
              <button type="button" className="profile-menu-item" onClick={() => navigate('/favorites')}>
                <div className="profile-menu-icon" style={{color: 'var(--accent)'}}>
                  <i className="ph ph-heart"></i>
                </div>
                <span>Saqlangan e'lonlar</span>
                <i className="ph ph-caret-right profile-menu-chev"></i>
              </button>
              
              <button type="button" className="profile-menu-item" onClick={() => setActiveModal('reviews')}>
                <div className="profile-menu-icon" style={{color: '#4B88E5'}}>
                  <i className="ph ph-chat-circle-text"></i>
                </div>
                <span>Mening sharhlarim</span>
                <i className="ph ph-caret-right profile-menu-chev"></i>
              </button>

              <button type="button" className="profile-menu-item" onClick={() => setActiveModal('settings')}>
                <div className="profile-menu-icon" style={{color: '#10b981'}}>
                  <i className="ph ph-gear"></i>
                </div>
                <span>Sozlamalar</span>
                <i className="ph ph-caret-right profile-menu-chev"></i>
              </button>
              
              <button type="button" className="profile-menu-item" onClick={() => setActiveModal('help')}>
                <div className="profile-menu-icon" style={{color: '#f59e0b'}}>
                  <i className="ph ph-question"></i>
                </div>
                <span>Yordam qidirish</span>
                <i className="ph ph-caret-right profile-menu-chev"></i>
              </button>
            </div>

            <button type="button" className="btn-outline auth-logout-btn" onClick={logout}>
              <i className="ph ph-sign-out" aria-hidden />
              Hisobdan chiqish
            </button>
          </div>
        ) : (
          <div className="auth-layout">
            <div className="auth-hero-strip" aria-hidden>
              <div className="auth-hero-strip__glow" />
              <div className="auth-hero-strip__icon">
                <i className="ph ph-heart"></i>
              </div>
              <h2 className="auth-hero-strip__title">Toymakon</h2>
              <p className="auth-hero-strip__sub">To‘yingiz uchun bitta joy</p>
            </div>

            <div className="auth-card">
              <div className="auth-tabs" role="tablist" aria-label="Kirish yoki ro‘yxatdan o‘tish">
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
                  Ro‘yxatdan o‘tish
                </button>
              </div>

              <form className="auth-form" onSubmit={onSubmit} noValidate>
                <label className="auth-field">
                  <span className="auth-label">Foydalanuvchi nomi</span>
                  <div className="auth-input-wrap">
                    <i className="ph ph-user auth-input-icon" aria-hidden />
                    <input
                      className="auth-input"
                      type="text"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="masalan, Madina yoki @nick"
                      maxLength={200}
                      required
                    />
                  </div>
                </label>

                <label className="auth-field">
                  <span className="auth-label">Parol</span>
                  <div className="auth-input-wrap">
                    <i className="ph ph-lock auth-input-icon" aria-hidden />
                    <input
                      className="auth-input auth-input--with-toggle"
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      maxLength={4096}
                    />
                    <button
                      type="button"
                      className="auth-toggle-pass"
                      tabIndex={-1}
                      aria-label={showPass ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                      onClick={() => setShowPass((v) => !v)}
                    >
                      <i className={showPass ? 'ph ph-eye-slash' : 'ph ph-eye'} aria-hidden />
                    </button>
                  </div>
                </label>

                {mode === 'register' ? (
                  <label className="auth-field">
                    <span className="auth-label">Parolni tasdiqlang</span>
                    <div className="auth-input-wrap">
                      <i className="ph ph-lock auth-input-icon" aria-hidden />
                      <input
                        className="auth-input auth-input--with-toggle"
                        type={showPass2 ? 'text' : 'password'}
                        name="password2"
                        autoComplete="new-password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="Parolni qayta kiriting"
                        maxLength={4096}
                      />
                      <button
                        type="button"
                        className="auth-toggle-pass"
                        tabIndex={-1}
                        aria-label={showPass2 ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                        onClick={() => setShowPass2((v) => !v)}
                      >
                        <i className={showPass2 ? 'ph ph-eye-slash' : 'ph ph-eye'} aria-hidden />
                      </button>
                    </div>
                  </label>
                ) : null}

                {error ? (
                  <div className="auth-error" role="alert">
                    <i className="ph ph-warning-circle" aria-hidden />
                    <span>{error}</span>
                  </div>
                ) : null}

                <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                  {loading ? 'Kutilmoqda…' : mode === 'login' ? 'Kirish' : 'Hisob yaratish'}
                </button>
              </form>

              <p className="auth-footnote">
                Ma’lumotlaringiz faqat bu qurilmada saqlanadi (demo). Parolingizni hech kimga bermang.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Profile Function Modals */}
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
                      <option value="Sirdaryo">Sirdaryo viloyati</option>
                      <option value="Jizzax">Jizzax viloyati</option>
                      <option value="Navoiy">Navoiy viloyati</option>
                      <option value="Qashqadaryo">Qashqadaryo viloyati</option>
                      <option value="Surxondaryo">Surxondaryo viloyati</option>
                      <option value="Qoraqalpogiston">Qoraqalpog'iston Res.</option>
                    </select>
                  </label>
                  
                  <label className="auth-field" style={{marginTop: '16px'}}>
                    <span className="auth-label">Tilni tanlang</span>
                    <select className="auth-input" defaultValue="uz">
                      <option value="uz">O'zbekcha</option>
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                </div>
              </>
            )}

            {activeModal === 'help' && (
              <>
                <h3 className="share-sheet-title">Yordam qidirish</h3>
                <p className="auth-welcome-hint" style={{textAlign: 'center', marginBottom: '16px'}}>G'oyalar, takliflar yoki texnik yordam uchun biz bilan bog'laning.</p>
                <div className="share-sheet-actions">
                  <a href="tel:+998877353636" className="share-sheet-item" style={{textDecoration: 'none'}}>
                    <i className="ph ph-phone" style={{color: 'var(--accent)'}} />
                    <span>+998 (87) 735-36-36 (Qo'ng'iroq)</span>
                  </a>
                  <a href="https://t.me/toymakon_admin" target="_blank" rel="noreferrer" className="share-sheet-item" style={{textDecoration: 'none'}}>
                    <i className="ph ph-telegram-logo" style={{color: '#229ed9'}} />
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
                    <p className="auth-welcome-hint" style={{textAlign: 'center', marginTop: '30px', marginBottom: '30px'}}>Siz hali hech qanday sharh qoldirmagansiz.</p>
                  ) : (
                    myReviews.map(r => {
                      const v = VENDORS.find(ven => ven.id === r.vendorId);
                      return (
                        <div key={r.id} style={{background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                            <div style={{fontSize: '14px', fontWeight: 'bold', color: 'var(--text-dark)'}}>
                              {v ? v.name : 'Noma\'lum xizmat'}
                            </div>
                            <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>
                              {r.date}
                            </div>
                          </div>
                          
                          <div style={{fontSize: '14px', color: '#fbbf24', marginBottom: '10px', letterSpacing: '2px'}}>
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </div>
                          
                          <p style={{fontSize: '14px', color: 'var(--text-dark)', marginBottom: '16px', lineHeight: '1.45'}}>{r.text}</p>
                          
                          <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                            <button onClick={() => handleDeleteReview(r.vendorId, r.id)} style={{background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', fontWeight: 600}}>O'chirish</button>
                            <button onClick={() => {
                              navigate(`/vendor/${r.vendorId}`);
                            }} style={{background: 'var(--accent-light)', border: 'none', color: 'var(--accent)', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', fontWeight: 600}}>Tahrirlash</button>
                          </div>
                        </div>
                      );
                    })
                  )}
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
