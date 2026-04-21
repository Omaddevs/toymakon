import { getAccessToken, getApiBaseUrl, tryRefreshAccess } from './authApi';

function apiUrl(path) {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}

async function authFetch(path, options = {}) {
  const token = getAccessToken();
  if (!token) {
    const err = new Error('no_token');
    err.status = 401;
    throw err;
  }
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  let res = await fetch(apiUrl(path), { ...options, headers });
  if (res.status === 401) {
    const refreshed = await tryRefreshAccess();
    if (refreshed) {
      const t2 = getAccessToken();
      res = await fetch(apiUrl(path), {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${t2}` },
      });
    }
  }
  return res;
}

/**
 * @returns {Promise<number>}
 */
export async function fetchUnreadNotificationCount() {
  try {
    const res = await authFetch('/api/notifications/unread-count/');
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data.count) || 0;
  } catch {
    return 0;
  }
}

/**
 * @param {'unread'|'read'|'all'} [which]
 */
export async function fetchNotifications(which = 'all') {
  let qs = '';
  if (which === 'unread') qs = '?read=false';
  if (which === 'read') qs = '?read=true';
  const res = await authFetch(`/api/notifications/${qs}`);
  if (!res.ok) throw new Error(`notifications ${res.status}`);
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await authFetch(`/api/notifications/${encodeURIComponent(id)}/mark-read/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) throw new Error(`mark-read ${res.status}`);
  return res.json();
}

export async function deleteNotification(id) {
  const res = await authFetch(`/api/notifications/${encodeURIComponent(id)}/`, { method: 'DELETE' });
  if (res.status === 204) return true;
  if (res.status === 400) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.detail || 'delete_failed');
    err.status = 400;
    throw err;
  }
  throw new Error(`delete ${res.status}`);
}
