import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ERRORS = {
  username_invalid: "Foydalanuvchi nomini kiriting.",
  username_too_long: "Foydalanuvchi nomi juda uzun (maks. 200 belgi).",
  password_too_long: "Parol juda uzun (maks. 4096 belgi).",
  mismatch: "Parollar mos kelmayapti.",
  exists: "Bu nom band — boshqa nom tanlab ko'ring.",
  credentials: "Login yoki parol noto'g'ri.",
};

function msgForError(code) {
  return ERRORS[code] || "Xatolik yuz berdi. Qayta urinib ko'ring.";
}

export default function AuthGateSheet({ open, onClose, onSuccess, hint }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setMode('login');
    setUsername('');
    setPassword('');
    setPassword2('');
    setError('');
    setLoading(false);
    setShowPass(false);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setPassword('');
    setPassword2('');
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
      reset();
      onSuccess?.();
    } catch (err) {
      setError(msgForError(err?.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="share-backdrop"
        onClick={handleClose}
        role="presentation"
        aria-hidden
      />
      <div
        className="auth-gate-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
      >
        <div className="share-sheet-handle" aria-hidden />

        <div className="auth-gate-hero">
          <div className="auth-gate-icon" aria-hidden>
            <i className="ph ph-user-circle"></i>
          </div>
          <h2 id="auth-gate-title" className="auth-gate-title">
            {mode === 'login' ? 'Tizimga kirish' : "Ro'yxatdan o'tish"}
          </h2>
          {hint ? <p className="auth-gate-hint">{hint}</p> : null}
        </div>

        <div className="auth-tabs auth-gate-tabs" role="tablist">
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
            {"Ro'yxatdan o'tish"}
          </button>
        </div>

        <form className="auth-form auth-gate-form" onSubmit={onSubmit} noValidate>
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
                placeholder="masalan, madina_26"
                minLength={3}
                maxLength={24}
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
                aria-label={showPass ? 'Yashirish' : "Ko'rsatish"}
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
                  className="auth-input"
                  type="password"
                  name="password2"
                  autoComplete="new-password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="Qayta kiriting"
                  maxLength={4096}
                />
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
            {loading
              ? 'Kutilmoqda...'
              : mode === 'login'
              ? 'Kirish'
              : 'Hisob yaratish'}
          </button>
        </form>

        <button type="button" className="share-sheet-cancel" onClick={handleClose}>
          Bekor qilish
        </button>
      </div>
    </>
  );
}
