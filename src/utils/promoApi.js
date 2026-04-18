/** Promo postlar API — Vite devda `vite.config` proxy yoki VITE_API_BASE_URL */

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
}

/**
 * @returns {Promise<Array<{slug:string,badge:string,title:string,path:string,background_url:string,sort_order:number,view_count:number}>>}
 */
export async function fetchPromoPosts() {
  const base = getApiBaseUrl();
  const url = `${base}/api/promo-posts/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`promo-posts ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

/**
 * Korishni backendda +1 qiladi, yangilangan view_count qaytaradi.
 */
export async function recordPromoView(slug) {
  const base = getApiBaseUrl();
  const url = `${base}/api/promo-posts/${encodeURIComponent(slug)}/record-view/`;
  const res = await fetch(url, { method: 'POST', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`record-view ${res.status}`);
  return res.json();
}

/** Ko‘rishlar sonini chiroyli ko‘rinishda (o‘zbek/raqam ajratish). */
export function formatViewCount(n) {
  const x = Number(n) || 0;
  if (x >= 1_000_000) {
    const v = x / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')} mln`;
  }
  if (x >= 10_000) return `${Math.round(x / 1000)}k`;
  if (x >= 1000) return `${(x / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(x);
}
