/** JWT auth — Vite devda `/api` proxy, productionda VITE_API_BASE_URL */

const ACCESS_KEY = 'toymakon-auth-access';
const REFRESH_KEY = 'toymakon-auth-refresh';

const LEGACY_USERS_KEY = 'toymakon-auth-users';
const LEGACY_SESSION_KEY = 'toymakon-auth-session';

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
}

function apiUrl(path) {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}

export function clearLegacyLocalAuth() {
  try {
    localStorage.removeItem(LEGACY_USERS_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setTokens(access, refresh) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

function firstErrorMessage(data) {
  if (!data || typeof data !== 'object') return null;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail) && data.detail[0]?.msg) return String(data.detail[0].msg);
  for (const key of Object.keys(data)) {
    const v = data[key];
    if (Array.isArray(v) && v.length) {
      const m = v[0];
      if (typeof m === 'string') return `${key}: ${m}`;
    }
    if (typeof v === 'string') return `${key}: ${v}`;
  }
  return null;
}

function mapErrorToCode(data, status) {
  if (status === 400 && data && Array.isArray(data.username)) return 'exists';
  const text = firstErrorMessage(data) || '';
  const lower = text.toLowerCase();
  if (status === 401 || lower.includes('credentials') || lower.includes('no active account')) {
    return 'credentials';
  }
  if (status === 400 && lower.includes('band')) return 'exists';
  return 'api';
}

export async function tryRefreshAccess() {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  let res;
  try {
    res = await fetch(apiUrl('/api/auth/token/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh }),
    });
  } catch {
    clearTokens();
    return false;
  }
  if (!res.ok) {
    clearTokens();
    return false;
  }
  const data = await res.json();
  if (data.access) {
    localStorage.setItem(ACCESS_KEY, data.access);
    return true;
  }
  clearTokens();
  return false;
}

export async function fetchMe() {
  const access = getAccessToken();
  if (!access) throw new Error('no_token');
  let res;
  try {
    res = await fetch(apiUrl('/api/auth/me/'), {
      headers: { Authorization: `Bearer ${access}`, Accept: 'application/json' },
    });
  } catch {
    throw new Error('network');
  }
  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error('me_failed');
    err.details = data;
    throw err;
  }
  return res.json();
}

export async function initAuthSession() {
  clearLegacyLocalAuth();
  const hasRefresh = !!getRefreshToken();
  const hasAccess = !!getAccessToken();
  if (!hasAccess && hasRefresh) {
    await tryRefreshAccess();
  }
  if (!getAccessToken()) return null;
  try {
    return await fetchMe();
  } catch {
    if (await tryRefreshAccess()) {
      try {
        return await fetchMe();
      } catch {
        clearTokens();
        return null;
      }
    }
    clearTokens();
    return null;
  }
}

export async function loginRequest(username, password) {
  let res;
  try {
    res = await fetch(apiUrl('/api/auth/token/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    const err = new Error('api');
    err.humanMessage = "Serverga ulanib bo'lmadi. Backend ishlamoqdamimi (python manage.py runserver)?";
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = mapErrorToCode(data, res.status);
    const err = new Error(code);
    err.details = data;
    err.humanMessage = firstErrorMessage(data);
    throw err;
  }
  if (data.access && data.refresh) {
    setTokens(data.access, data.refresh);
  }
  return data.user;
}

export async function registerRequest(payload) {
  let res;
  try {
    res = await fetch(apiUrl('/api/auth/register/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    const err = new Error('api');
    err.humanMessage = "Serverga ulanib bo'lmadi. Backend ishlamoqdamimi (python manage.py runserver)?";
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = mapErrorToCode(data, res.status);
    const err = new Error(code);
    err.details = data;
    err.humanMessage = firstErrorMessage(data);
    throw err;
  }
  if (data.access && data.refresh) {
    setTokens(data.access, data.refresh);
  }
  return data.user;
}

export function logoutStorage() {
  clearTokens();
}
