import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  initAuthSession,
  loginRequest,
  logoutStorage,
  registerRequest,
} from '../utils/authApi';
import { validatePassword, validateUsername } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await initAuthSession();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (usernameRaw, passwordRaw) => {
    const vu = validateUsername(usernameRaw);
    if (!vu.ok) throw new Error(vu.code === 'long' ? 'username_too_long' : 'username_invalid');
    const vp = validatePassword(passwordRaw);
    if (!vp.ok) throw new Error('password_too_long');
    const u = await loginRequest(vu.username, vp.password);
    setUser(u);
  }, []);

  const register = useCallback(async (usernameRaw, passwordRaw, passwordConfirm) => {
    const vu = validateUsername(usernameRaw);
    if (!vu.ok) throw new Error(vu.code === 'long' ? 'username_too_long' : 'username_invalid');
    const vp = validatePassword(passwordRaw);
    if (!vp.ok) throw new Error('password_too_long');
    if (passwordRaw !== passwordConfirm) throw new Error('mismatch');
    const u = await registerRequest({
      username: vu.username,
      password: vp.password,
      password_confirm: passwordConfirm,
    });
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    logoutStorage();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
