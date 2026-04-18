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

export function getReviewsByUsername(username) {
  const all = readAll();
  const myReviews = [];
  for (const [vendorId, reviews] of Object.entries(all)) {
    if (!Array.isArray(reviews)) continue;
    for (const r of reviews) {
      if (r.author === username) {
        myReviews.push({ vendorId, ...r });
      }
    }
  }
  return myReviews;
}

export function editUserReview(vendorId, reviewId, { rating, text }) {
  const all = readAll();
  if (!Array.isArray(all[vendorId])) return false;
  let updated = false;
  all[vendorId] = all[vendorId].map((r) => {
    if (r.id === reviewId) {
      updated = true;
      return { ...r, rating, text };
    }
    return r;
  });
  if (updated) localStorage.setItem(KEY, JSON.stringify(all));
  return updated;
}

export function deleteUserReview(vendorId, reviewId) {
  const all = readAll();
  if (!Array.isArray(all[vendorId])) return false;
  const initLen = all[vendorId].length;
  all[vendorId] = all[vendorId].filter((r) => r.id !== reviewId);
  if (all[vendorId].length < initLen) {
    localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  }
  return false;
}
