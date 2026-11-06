import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { json } from './http.js';

export const ADMIN_EMAIL = 'admin@lamasion.com';
const COOKIE_NAME = 'lm_admin_session';
const SESSION_SECONDS = 8 * 60 * 60;

function safeEqual(left, right) {
  const a = createHash('sha256').update(String(left)).digest();
  const b = createHash('sha256').update(String(right)).digest();
  return timingSafeEqual(a, b);
}
function secret() { return process.env.ADMIN_SESSION_SECRET || ''; }
function sign(value) { return createHmac('sha256', secret()).update(value).digest('base64url'); }
function cookieValue(req) {
  const row = (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE_NAME}=`));
  return row ? row.slice(COOKIE_NAME.length + 1) : '';
}
function cookieOptions(req, maxAge) {
  const secure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

export function setSessionCookie(req, res, email) {
  const payload = Buffer.from(JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`);
}

export function clearSessionCookie(req, res) {
  const secure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`);
}

export function validPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD || '';
  return expected.length >= 12 && typeof candidate === 'string' && safeEqual(candidate, expected);
}

export function verifySession(req) {
  const sessionSecret = secret();
  if (sessionSecret.length < 32) return null;
  const [payload, signature, extra] = cookieValue(req).split('.');
  if (!payload || !signature || extra) return null;
  if (!safeEqual(signature, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (session.sub !== ADMIN_EMAIL || !Number.isFinite(session.exp) || session.exp < Date.now() / 1000) return null;
    return session;
  } catch { return null; }
}

export function requireAdmin(req, res) {
  if (secret().length < 32) {
    json(res, 503, { error: 'Admin authentication is not configured. Set ADMIN_SESSION_SECRET in the deployment environment.' });
    return false;
  }
  if (!verifySession(req)) {
    json(res, 401, { error: 'Please sign in to view analytics.' });
    return false;
  }
  return true;
}

export { cookieOptions };
