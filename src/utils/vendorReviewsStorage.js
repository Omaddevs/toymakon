const KEY = 'toymakon-vendor-reviews';

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getUserReviews(vendorId) {
  const all = readAll();
  const list = all[vendorId];
  return Array.isArray(list) ? list : [];
}

export function addUserReview(vendorId, { author, rating, text }) {
  const all = readAll();
  const prev = Array.isArray(all[vendorId]) ? all[vendorId] : [];
  const entry = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author: (author || '').trim() || 'Mehmon',
    rating: Math.min(5, Math.max(1, Math.round(Number(rating) || 5))),
    text: (text || '').trim(),
    date: new Date().toISOString().slice(0, 10),
    isUser: true,
  };
  all[vendorId] = [entry, ...prev];
  localStorage.setItem(KEY, JSON.stringify(all));
  return entry;
}
