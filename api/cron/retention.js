import { timingSafeEqual, createHash } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { databaseUrl, json } from '../../lib/http.js';

function equal(left, right) {
  return timingSafeEqual(createHash('sha256').update(String(left)).digest(), createHash('sha256').update(String(right)).digest());
}

export default async function handler(req, res) {
  const expected = process.env.CRON_SECRET || '';
  const provided = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (expected.length < 32 || !equal(provided, expected)) return json(res, 401, { error: 'Unauthorized.' });
  if (!['GET', 'POST'].includes(req.method)) return json(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET, POST' });
  const connection = databaseUrl();
  if (!connection) return json(res, 503, { error: 'Database is not configured.' });
  try {
    const sql = neon(connection);
    const result = await sql`DELETE FROM lm_page_views WHERE created_at < NOW() - INTERVAL '90 days' RETURNING id`;
    return json(res, 200, { ok: true, deleted: result.length });
  } catch {
    return json(res, 503, { error: 'Retention job could not run. Confirm database setup.' });
  }
}
