import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getSessionUsername,
  saveUser,
  setSessionUsername,
  validatePassword,
  validateUsername,
  verifyCredentials,
} from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const name = getSessionUsername();
    if (name) setUser({ username: name });
    setReady(true);
  }, []);

  const login = useCallback(async (usernameRaw, passwordRaw) => {
    const vu = validateUsername(usernameRaw);
    if (!vu.ok) throw new Error(vu.code === 'long' ? 'username_too_long' : 'username_invalid');
    const vp = validatePassword(passwordRaw);
    if (!vp.ok) throw new Error('password_too_long');
    const ok = await verifyCredentials(vu.username, vp.password);
    if (!ok) throw new Error('credentials');
    setSessionUsername(vu.username);
    setUser({ username: vu.username });
  }, []);

  const register = useCallback(async (usernameRaw, passwordRaw, passwordConfirm) => {
    const vu = validateUsername(usernameRaw);
    if (!vu.ok) throw new Error(vu.code === 'long' ? 'username_too_long' : 'username_invalid');
    const vp = validatePassword(passwordRaw);
    if (!vp.ok) throw new Error('password_too_long');
    if (passwordRaw !== passwordConfirm) throw new Error('mismatch');
    const created = await saveUser(vu.username, vp.password);
    if (!created) throw new Error('exists');
    setSessionUsername(vu.username);
    setUser({ username: vu.username });
  }, []);

  const logout = useCallback(() => {
    setSessionUsername(null);
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
