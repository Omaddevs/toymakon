const KEY = 'toymakon-vendor-requests';

export function saveRequest({ vendorId, vendorName, name, phone, message }) {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    const arr = Array.isArray(list) ? list : [];
    arr.unshift({
      id: `req-${Date.now()}`,
      vendorId,
      vendorName,
      name: (name || '').trim(),
      phone: (phone || '').trim(),
      message: (message || '').trim(),
      at: new Date().toISOString(),
    });
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 100)));
  } catch {
    /* ignore */
  }
}
