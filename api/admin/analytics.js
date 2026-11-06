import { neon } from '@neondatabase/serverless';
import { requireAdmin } from '../../lib/admin-session.js';
import { databaseUrl, json } from '../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET' });
  if (!requireAdmin(req, res)) return;
  const connection = databaseUrl();
  if (!connection) return json(res, 503, { error: 'Add DATABASE_URL to the Vercel environment and apply db/schema.sql to Neon.' });
  const range = [7, 30, 90].includes(Number(req.query?.range)) ? Number(req.query.range) : 30;
  try {
    const sql = neon(connection);
    const [overviewRows, daily, pages, referrers, devices] = await Promise.all([
      sql`SELECT COUNT(*)::int AS page_views, COUNT(DISTINCT visitor_key)::int AS unique_visitors,
                 COUNT(DISTINCT path)::int AS unique_pages
          FROM lm_page_views WHERE created_at >= NOW() - (${range}::int * INTERVAL '1 day')`,
      sql`SELECT TO_CHAR(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
                 COUNT(*)::int AS views, COUNT(DISTINCT visitor_key)::int AS visitors
          FROM lm_page_views WHERE created_at >= NOW() - (${range}::int * INTERVAL '1 day')
          GROUP BY date_trunc('day', created_at) ORDER BY day ASC`,
      sql`SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT visitor_key)::int AS visitors
          FROM lm_page_views WHERE created_at >= NOW() - (${range}::int * INTERVAL '1 day')
          GROUP BY path ORDER BY views DESC, path ASC LIMIT 10`,
      sql`SELECT COALESCE(referrer_host, 'Direct / unknown') AS source, COUNT(*)::int AS visits
          FROM lm_page_views WHERE created_at >= NOW() - (${range}::int * INTERVAL '1 day')
          GROUP BY referrer_host ORDER BY visits DESC LIMIT 8`,
      sql`SELECT device_category AS device, COUNT(*)::int AS views
          FROM lm_page_views WHERE created_at >= NOW() - (${range}::int * INTERVAL '1 day')
          GROUP BY device_category ORDER BY views DESC`
    ]);
    return json(res, 200, {
      rangeDays: range,
      overview: overviewRows[0] || { page_views: 0, unique_visitors: 0, unique_pages: 0 },
      daily, pages, referrers, devices,
      generatedAt: new Date().toISOString(),
      note: 'Only page views from visitors who opted into analytics are included. No raw IP addresses or full URLs are stored.'
    });
  } catch (error) {
    console.error('Admin analytics query failed:', error?.code || 'unknown');
    return json(res, 503, { error: 'Analytics database is unavailable. Confirm DATABASE_URL and apply db/schema.sql.' });
  }
}
