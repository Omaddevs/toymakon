import { getAccessToken, getApiBaseUrl, tryRefreshAccess } from './authApi';

function apiUrl(path) {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

async function adminFetch(path, options = {}) {
  let token = getAccessToken();
  if (!token) {
    const err = new Error('unauthorized');
    err.status = 401;
    throw err;
  }
  const makeReq = (t) => fetch(apiUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${t}`,
      ...(options.headers || {}),
    },
  });
  let res = await makeReq(token);
  if (res.status === 401) {
    const refreshed = await tryRefreshAccess();
    if (!refreshed) {
      const err = new Error('unauthorized');
      err.status = 401;
      throw err;
    }
    res = await makeReq(getAccessToken());
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
    throw new Error(data.detail || `save ${res.status}`);
  }
  return res.json();
}
