import { ADMIN_EMAIL, setSessionCookie, validPassword } from '../../lib/admin-session.js';
import { json, readJson, sameOrigin } from '../../lib/http.js';

const attempts = globalThis.__lmLoginAttempts || (globalThis.__lmLoginAttempts = new Map());

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
  if (!sameOrigin(req)) return json(res, 403, { error: 'Request origin not allowed.' });
  if (!process.env.ADMIN_PASSWORD || (process.env.ADMIN_SESSION_SECRET || '').length < 32) {
    return json(res, 503, { error: 'Set ADMIN_PASSWORD and a 32-character ADMIN_SESSION_SECRET in the deployment environment.' });
  }
  const key = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim().slice(0, 80);
  const now = Date.now();
  const state = attempts.get(key) || { count: 0, start: now, lockedUntil: 0 };
  if (state.lockedUntil > now) return json(res, 429, { error: 'Too many attempts. Please wait a few minutes and try again.' }, { 'Retry-After': String(Math.ceil((state.lockedUntil - now) / 1000)) });
  try {
    const body = await readJson(req, 4096);
    const email = String(body.email || '').trim().toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const valid = email === ADMIN_EMAIL && validPassword(password);
    if (!valid) {
      if (now - state.start > 10 * 60 * 1000) { state.count = 0; state.start = now; }
      state.count += 1;
      if (state.count >= 8) state.lockedUntil = now + 10 * 60 * 1000;
      attempts.set(key, state);
      return json(res, 401, { error: 'Email or password is incorrect.' });
    }
    attempts.delete(key);
    setSessionCookie(req, res, ADMIN_EMAIL);
    return json(res, 200, { ok: true, email: ADMIN_EMAIL });
  } catch {
    return json(res, 400, { error: 'Invalid request.' });
  }
}
