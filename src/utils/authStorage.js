const USERS_KEY = 'toymakon-auth-users';
const SESSION_KEY = 'toymakon-auth-session';

/** @returns {Record<string, string>} username -> password hash */
function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return o && typeof o === 'object' ? o : {};
  } catch {
    return {};
  }
}

function writeUsers(map) {
  localStorage.setItem(USERS_KEY, JSON.stringify(map));
}

export async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(`toymakon-auth-v1|${password}`));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getStoredPasswordHash(username) {
  const users = readUsers();
  return users[username] ?? null;
}

export async function saveUser(username, password) {
  const users = readUsers();
  if (users[username]) return false;
  users[username] = await hashPassword(password);
  writeUsers(users);
  return true;
}

export async function verifyCredentials(username, password) {
  const stored = getStoredPasswordHash(username);
  if (!stored) return false;
  const h = await hashPassword(password);
  return h === stored;
}

export function getSessionUsername() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    return typeof o?.username === 'string' ? o.username : null;
  } catch {
    return null;
  }
}

export function setSessionUsername(username) {
  if (!username) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
}

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
