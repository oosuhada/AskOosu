CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE ask_events
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS cf_ray text,
  ADD COLUMN IF NOT EXISTS geo_city text,
  ADD COLUMN IF NOT EXISTS geo_region text,
  ADD COLUMN IF NOT EXISTS geo_region_code text,
  ADD COLUMN IF NOT EXISTS geo_postal_code text,
  ADD COLUMN IF NOT EXISTS geo_timezone text,
  ADD COLUMN IF NOT EXISTS geo_latitude numeric(9, 6),
  ADD COLUMN IF NOT EXISTS geo_longitude numeric(9, 6),
  ADD COLUMN IF NOT EXISTS user_agent_hash text,
  ADD COLUMN IF NOT EXISTS accept_language text;

CREATE INDEX IF NOT EXISTS ask_events_ip_hash_idx
  ON ask_events (ip_hash);

CREATE TABLE IF NOT EXISTS visitor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL DEFAULT '' CHECK (char_length(session_id) <= 128),
  ip_hash text,
  event_type text NOT NULL DEFAULT 'page_view' CHECK (event_type IN ('page_view')),
  path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  cf_ray text,
  country text,
  geo_city text,
  geo_region text,
  geo_region_code text,
  geo_postal_code text,
  geo_timezone text,
  geo_latitude numeric(9, 6),
  geo_longitude numeric(9, 6),
  user_agent_hash text,
  accept_language text,
  device_type text,
  browser text,
  os text,
  screen_width integer CHECK (screen_width IS NULL OR screen_width >= 0),
  screen_height integer CHECK (screen_height IS NULL OR screen_height >= 0),
  viewport_width integer CHECK (viewport_width IS NULL OR viewport_width >= 0),
  viewport_height integer CHECK (viewport_height IS NULL OR viewport_height >= 0),
  client_timezone text,
  client_language text
);

CREATE INDEX IF NOT EXISTS visitor_events_created_at_idx
  ON visitor_events (created_at DESC);
CREATE INDEX IF NOT EXISTS visitor_events_session_id_idx
  ON visitor_events (session_id);
CREATE INDEX IF NOT EXISTS visitor_events_ip_hash_idx
  ON visitor_events (ip_hash);
CREATE INDEX IF NOT EXISTS visitor_events_path_idx
  ON visitor_events (path);
CREATE INDEX IF NOT EXISTS visitor_events_referrer_idx
  ON visitor_events (referrer);
CREATE INDEX IF NOT EXISTS visitor_events_country_idx
  ON visitor_events (country);
CREATE INDEX IF NOT EXISTS visitor_events_utm_source_idx
  ON visitor_events (utm_source);
