import { getApiBaseUrl } from './authApi';

function apiUrl(path) {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}

export function unwrapList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
export async function fetchCatalogJson(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.response = res;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchHome() {
  return fetchCatalogJson('/api/home/');
}

export async function fetchCategories() {
  const data = await fetchCatalogJson('/api/categories/');
  return unwrapList(data);
}

export async function fetchCategoryBySlug(slug) {
  return fetchCatalogJson(`/api/categories/${encodeURIComponent(slug)}/`);
}

export async function fetchVendors(params = {}) {
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.search) q.set('search', params.search);
  if (params.district) q.set('district', params.district);
  if (params.minRating !== undefined && params.minRating !== null && params.minRating !== '') {
    q.set('min_rating', String(params.minRating));
  }
  if (params.maxRating !== undefined && params.maxRating !== null && params.maxRating !== '') {
    q.set('max_rating', String(params.maxRating));
  }
  if (params.ordering) q.set('ordering', params.ordering);
  const suffix = q.toString() ? `?${q}` : '';
  const data = await fetchCatalogJson(`/api/vendors/${suffix}`);
  return unwrapList(data);
}

export async function fetchVendorByCode(code) {
  return fetchCatalogJson(`/api/vendors/${encodeURIComponent(code)}/`);
}
