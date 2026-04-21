import { getAccessToken, tryRefreshAccess } from './authApi';

async function adminFetch(path, options = {}) {
  let token = getAccessToken();
  if (!token) {
    const err = new Error('unauthorized');
    err.status = 401;
    throw err;
  }
  let res = await fetch(path, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    const refreshed = await tryRefreshAccess();
    if (!refreshed) {
      const err = new Error('unauthorized');
      err.status = 401;
      throw err;
    }
    token = getAccessToken();
    res = await fetch(path, {
      ...options,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  }
  return res;
}

export async function fetchTopVenuesManage() {
  const res = await adminFetch('/api/admin/top-venues/');
  if (!res.ok) throw new Error(`top-venues ${res.status}`);
  return res.json();
}

export async function saveTopVenuesManage(items) {
  const res = await adminFetch('/api/admin/top-venues/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.detail || `save ${res.status}`);
    throw err;
  }
  return res.json();
}
