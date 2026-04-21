/** Validatsiya (klient) — akkauntlar MySQL + Django orqali saqlanadi */

const USERNAME_MAX = 200;
const PASSWORD_MAX = 4096;

export function validateUsername(raw) {
  const u = (raw || '').trim();
  if (!u) return { ok: false, code: 'empty' };
  if (u.length > USERNAME_MAX) return { ok: false, code: 'long' };
  return { ok: true, username: u.toLowerCase() };
}

export function validatePassword(raw) {
  const p = raw == null ? '' : String(raw);
  if (p.length > PASSWORD_MAX) return { ok: false, code: 'long' };
  return { ok: true, password: p };
}
