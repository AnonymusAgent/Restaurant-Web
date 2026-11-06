-- La Maison first-party analytics schema (Neon PostgreSQL)
-- Apply this file once to the Neon project before enabling analytics collection.
-- Page views are created only after visitors opt into analytics cookies.
-- Do not store raw IP addresses, names, emails, full referrer URLs, or query strings here.

CREATE TABLE IF NOT EXISTS lm_page_views (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visitor_key CHAR(64) NOT NULL,
  path VARCHAR(300) NOT NULL,
  referrer_host VARCHAR(255),
  device_category VARCHAR(12) NOT NULL DEFAULT 'unknown'
    CHECK (device_category IN ('mobile', 'tablet', 'desktop', 'unknown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lm_page_views_created_at_idx ON lm_page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS lm_page_views_visitor_created_idx ON lm_page_views (visitor_key, created_at DESC);
CREATE INDEX IF NOT EXISTS lm_page_views_path_created_idx ON lm_page_views (path, created_at DESC);

-- Optional maintenance job (e.g. schedule with pg_cron or a Vercel Cron Job)
-- DELETE FROM lm_page_views WHERE created_at < NOW() - INTERVAL '90 days';
