import { clearSessionCookie } from '../../lib/admin-session.js';
import { json, sameOrigin } from '../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
  if (!sameOrigin(req)) return json(res, 403, { error: 'Request origin not allowed.' });
  clearSessionCookie(req, res);
  return json(res, 200, { ok: true });
}
