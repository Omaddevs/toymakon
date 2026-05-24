import { fetchCatalogJson } from './catalogApi';
import { getAccessToken, getApiBaseUrl } from './authApi';

function apiUrl(path) {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

async function adminFetch(path, options = {}) {
  const token = getAccessToken();
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    let errData = {};
    try { errData = await res.json(); } catch { /* ignore */ }
    const err = new Error(errData.detail || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = errData;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

function jsonPost(path, body) {
  return adminFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function jsonPut(path, body) {
  return adminFetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function jsonPatch(path, body) {
  return adminFetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function del(path) {
  return adminFetch(path, { method: 'DELETE' });
}

// Stats
export function fetchAdminStats() {
  return adminFetch('/api/admin/stats/');
}

// Vendors CRUD
export function fetchAdminVendors(params = {}) {
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.search) q.set('search', params.search);
  if (params.is_published !== undefined && params.is_published !== '') q.set('is_published', params.is_published);
  const suffix = q.toString() ? `?${q}` : '';
  return adminFetch(`/api/admin/vendors/${suffix}`);
}

export function fetchAdminVendorByCode(code) {
  return adminFetch(`/api/admin/vendors/${encodeURIComponent(code)}/`);
}

export function createAdminVendor(data) {
  return jsonPost('/api/admin/vendors/', data);
}

export function updateAdminVendor(code, data) {
  return jsonPut(`/api/admin/vendors/${encodeURIComponent(code)}/`, data);
}

export function patchAdminVendor(code, data) {
  return jsonPatch(`/api/admin/vendors/${encodeURIComponent(code)}/`, data);
}

export function deleteAdminVendor(code) {
  return del(`/api/admin/vendors/${encodeURIComponent(code)}/`);
}

// Categories CRUD
export function fetchAdminCategories() {
  return adminFetch('/api/admin/categories/');
}

export function createAdminCategory(data) {
  return jsonPost('/api/admin/categories/', data);
}

export function updateAdminCategory(code, data) {
  return jsonPut(`/api/admin/categories/${encodeURIComponent(code)}/`, data);
}

export function deleteAdminCategory(code) {
  return del(`/api/admin/categories/${encodeURIComponent(code)}/`);
}

// Promo Posts CRUD
export function fetchAdminPromoPosts() {
  return adminFetch('/api/admin/promo-posts/');
}

export function createAdminPromoPost(data) {
  return jsonPost('/api/admin/promo-posts/', data);
}

export function updateAdminPromoPost(slug, data) {
  return jsonPut(`/api/admin/promo-posts/${encodeURIComponent(slug)}/`, data);
}

export function deleteAdminPromoPost(slug) {
  return del(`/api/admin/promo-posts/${encodeURIComponent(slug)}/`);
}

// Users
export function fetchAdminUsers() {
  return adminFetch('/api/admin/users/');
}

export function patchAdminUser(userId, data) {
  return jsonPatch(`/api/admin/users/${userId}/`, data);
}

// Top Venues
export function fetchAdminTopVenues() {
  return adminFetch('/api/admin/top-venues/');
}

export function saveAdminTopVenues(items) {
  return adminFetch('/api/admin/top-venues/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
}

// Recommended (Tavsiya qilamiz)
export function fetchAdminRecommended() {
  return adminFetch('/api/admin/recommended/');
}

export function saveAdminRecommended(items) {
  return adminFetch('/api/admin/recommended/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
}

// Image Upload
export async function uploadAdminImage(file) {
  const token = getAccessToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(apiUrl('/api/admin/upload/'), {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP ${res.status}`);
  }
  return res.json();
}
