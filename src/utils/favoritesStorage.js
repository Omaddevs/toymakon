const KEY = 'toymakon-favorites';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('toymakon-favorites'));
}

export function getFavoriteIds() {
  return read();
}

export function isFavorite(vendorId) {
  return read().includes(vendorId);
}

export function toggleFavorite(vendorId) {
  const ids = read();
  const next = ids.includes(vendorId) ? ids.filter((x) => x !== vendorId) : [...ids, vendorId];
  write(next);
  return !ids.includes(vendorId);
}
