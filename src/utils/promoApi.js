/** Promo postlar API — Vite devda `vite.config` proxy yoki VITE_API_BASE_URL */

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
}

/**
 * @returns {Promise<Array<{slug:string,badge:string,title:string,path:string,background_url:string,sort_order:number}>>}
 */
export async function fetchPromoPosts() {
  const base = getApiBaseUrl();
  const url = `${base}/api/promo-posts/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`promo-posts ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

