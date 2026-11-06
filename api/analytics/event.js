import { createHmac, createHash } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { databaseUrl, json, readJson, sameOrigin } from '../../lib/http.js';

function cookies(header = '') {
  return Object.fromEntries(header.split(';').map(part => {
    const index = part.indexOf('=');
    return index < 0 ? ['', ''] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
  }).filter(([key]) => key));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
  if (!sameOrigin(req)) return json(res, 403, { error: 'Request origin not allowed.' });
  let consent;
  try { consent = JSON.parse(decodeURIComponent(cookies(req.headers.cookie).site_consent || '')); } catch { consent = null; }
  if (!consent?.analytics) return json(res, 204, {});
  const url = databaseUrl();
  const hashSecret = process.env.ANALYTICS_HASH_SECRET || '';
  if (!url || hashSecret.length < 32) return json(res, 503, { error: 'Analytics storage is not configured.' });
  try {
    const body = await readJson(req, 4096);
    const visitorId = String(body.visitorId || '');
    if (!/^[a-f0-9-]{36}$/i.test(visitorId)) return json(res, 400, { error: 'Invalid visitor identifier.' });
    let path = String(body.path || '/').split('?')[0];
    if (!path.startsWith('/') || path.startsWith('//')) path = '/';
    path = path.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 300) || '/';
    let referrerHost = null;
    try { if (body.referrer) referrerHost = new URL(String(body.referrer)).hostname.slice(0, 255) || null; } catch { referrerHost = null; }
    const screenWidth = Number(String(body.screen || '').split('x')[0]);
    const device = Number.isFinite(screenWidth) ? (screenWidth < 600 ? 'mobile' : screenWidth < 1024 ? 'tablet' : 'desktop') : 'unknown';
    const visitorKey = createHmac('sha256', hashSecret).update(visitorId).digest('hex');
    const sql = neon(url);
    await sql`INSERT INTO lm_page_views (visitor_key, path, referrer_host, device_category) VALUES (${visitorKey}, ${path}, ${referrerHost}, ${device})`;
    return json(res, 202, { ok: true });
  } catch (error) {
    if (error.message === 'Request body too large') return json(res, 413, { error: 'Request body too large.' });
    if (error instanceof SyntaxError) return json(res, 400, { error: 'Invalid request.' });
    console.error('Analytics write failed:', createHash('sha256').update(String(error?.message || '')).digest('hex').slice(0, 12));
    return json(res, 503, { error: 'Analytics is temporarily unavailable.' });
  }
}
