import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';
import {
  normalizeOptionalText,
  normalizePath,
  normalizeReferrer,
  parseRequestAnalyticsContext,
  truncateText,
} from './request-context';

export type VisitorEventInput = {
  sessionId?: string | null;
  path?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  timezone?: string | null;
  language?: string | null;
};

const MAX_SESSION_ID_LENGTH = 128;
const MAX_SHORT_TEXT_LENGTH = 500;

let visitorEventsSchemaReady: Promise<void> | null = null;

export { hasPostgresDatabaseUrl };

export async function createVisitorEvent(req: Request, input: VisitorEventInput) {
  if (!hasPostgresDatabaseUrl()) return null;

  await ensureVisitorEventsSchema();

  const requestContext = parseRequestAnalyticsContext(req);
  const event = normalizeVisitorEvent(input);
  const pool = await getPostgresPool();
  const result = await pool.query<{ id: string }>(
    `
      INSERT INTO visitor_events (
        session_id,
        ip_hash,
        path,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        cf_ray,
        country,
        geo_city,
        geo_region,
        geo_region_code,
        geo_postal_code,
        geo_timezone,
        geo_latitude,
        geo_longitude,
        user_agent_hash,
        accept_language,
        device_type,
        browser,
        os,
        screen_width,
        screen_height,
        viewport_width,
        viewport_height,
        client_timezone,
        client_language
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27
      )
      RETURNING id
    `,
    [
      event.sessionId,
      requestContext.ipHash,
      event.path,
      event.referrer,
      event.utmSource,
      event.utmMedium,
      event.utmCampaign,
      requestContext.cfRay,
      requestContext.country,
      requestContext.geoCity,
      requestContext.geoRegion,
      requestContext.geoRegionCode,
      requestContext.geoPostalCode,
      requestContext.geoTimezone,
      requestContext.geoLatitude,
      requestContext.geoLongitude,
      requestContext.userAgentHash,
      requestContext.acceptLanguage,
      requestContext.deviceType,
      requestContext.browser,
      requestContext.os,
      event.screenWidth,
      event.screenHeight,
      event.viewportWidth,
      event.viewportHeight,
      event.timezone,
      event.language,
    ]
  );

  return result.rows[0]?.id ?? null;
}

function ensureVisitorEventsSchema() {
  if (!visitorEventsSchemaReady) {
    visitorEventsSchemaReady = createVisitorEventsSchema();
  }

  return visitorEventsSchemaReady;
}

async function createVisitorEventsSchema() {
  const pool = await getPostgresPool();

  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await pool.query(`
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
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS visitor_events_created_at_idx ON visitor_events (created_at DESC)');
  await pool.query('CREATE INDEX IF NOT EXISTS visitor_events_session_id_idx ON visitor_events (session_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS visitor_events_ip_hash_idx ON visitor_events (ip_hash)');
  await pool.query('CREATE INDEX IF NOT EXISTS visitor_events_path_idx ON visitor_events (path)');
  await pool.query('CREATE INDEX IF NOT EXISTS visitor_events_referrer_idx ON visitor_events (referrer)');
  await pool.query('CREATE INDEX IF NOT EXISTS visitor_events_country_idx ON visitor_events (country)');
  await pool.query('CREATE INDEX IF NOT EXISTS visitor_events_utm_source_idx ON visitor_events (utm_source)');
}

function normalizeVisitorEvent(input: VisitorEventInput) {
  return {
    sessionId: truncateText(input.sessionId ?? '', MAX_SESSION_ID_LENGTH),
    path: normalizePath(input.path),
    referrer: normalizeReferrer(input.referrer),
    utmSource: normalizeOptionalText(input.utmSource, MAX_SHORT_TEXT_LENGTH),
    utmMedium: normalizeOptionalText(input.utmMedium, MAX_SHORT_TEXT_LENGTH),
    utmCampaign: normalizeOptionalText(input.utmCampaign, MAX_SHORT_TEXT_LENGTH),
    screenWidth: normalizeInteger(input.screenWidth),
    screenHeight: normalizeInteger(input.screenHeight),
    viewportWidth: normalizeInteger(input.viewportWidth),
    viewportHeight: normalizeInteger(input.viewportHeight),
    timezone: normalizeOptionalText(input.timezone, 80),
    language: normalizeOptionalText(input.language, 80),
  };
}

function normalizeInteger(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}
