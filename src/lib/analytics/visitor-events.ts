import { createHash } from 'node:crypto';

import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';

export type VisitorEventType = 'page_view' | 'click' | 'engagement';

export type VisitorEventInput = {
  sessionId?: string | null;
  eventType: VisitorEventType;
  path?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  durationMs?: number | null;
  targetTag?: string | null;
  targetText?: string | null;
  targetHref?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  clientTimezone?: string | null;
  clientLanguage?: string | null;
};

const MAX_SESSION_ID = 128;
const MAX_SHORT = 500;
const MAX_PATH = 2000;

export async function recordVisitorEvent(req: Request, input: VisitorEventInput) {
  if (!hasPostgresDatabaseUrl()) return;

  const pool = await getPostgresPool();
  const userAgent = req.headers.get('user-agent') ?? '';
  const parsed = parseUserAgent(userAgent);
  const forwardedFor = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? '';
  const ip = forwardedFor.split(',')[0]?.trim() ?? '';
  const ipHash = hashIdentity(ip, process.env.ANALYTICS_HASH_SALT);
  const uaHash = hashIdentity(userAgent, process.env.ANALYTICS_HASH_SALT);

  await pool.query(
    `INSERT INTO visitor_events (
      session_id, ip_hash, event_type, path, referrer,
      utm_source, utm_medium, utm_campaign, cf_ray, country,
      geo_city, geo_region, geo_region_code, geo_postal_code, geo_timezone,
      geo_latitude, geo_longitude, user_agent_hash, accept_language,
      device_type, browser, os, screen_width, screen_height,
      viewport_width, viewport_height, client_timezone, client_language,
      duration_ms, target_tag, target_text, target_href
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,
      $25,$26,$27,$28,$29,$30,$31,$32
    )`,
    [
      truncate(input.sessionId, MAX_SESSION_ID) ?? '',
      ipHash,
      input.eventType,
      truncate(input.path, MAX_PATH),
      truncate(input.referrer, MAX_PATH),
      truncate(input.utmSource, MAX_SHORT),
      truncate(input.utmMedium, MAX_SHORT),
      truncate(input.utmCampaign, MAX_SHORT),
      truncate(req.headers.get('cf-ray'), 128),
      truncate(req.headers.get('cf-ipcountry'), 8),
      truncate(req.headers.get('cf-ipcity'), MAX_SHORT),
      truncate(req.headers.get('cf-region'), MAX_SHORT),
      truncate(req.headers.get('cf-region-code'), 32),
      truncate(req.headers.get('cf-postal-code'), 32),
      truncate(req.headers.get('cf-timezone'), 128),
      numberOrNull(req.headers.get('cf-iplatitude')),
      numberOrNull(req.headers.get('cf-iplongitude')),
      uaHash,
      truncate(req.headers.get('accept-language'), MAX_SHORT),
      parsed.deviceType,
      parsed.browser,
      parsed.os,
      integerOrNull(input.screenWidth),
      integerOrNull(input.screenHeight),
      integerOrNull(input.viewportWidth),
      integerOrNull(input.viewportHeight),
      truncate(input.clientTimezone, 128),
      truncate(input.clientLanguage, 64),
      integerOrNull(input.durationMs),
      truncate(input.targetTag, 64),
      truncate(input.targetText, MAX_SHORT),
      truncate(input.targetHref, MAX_PATH),
    ]
  );
}

function truncate(value: string | null | undefined, max: number) {
  const normalized = value?.trim();
  if (!normalized) return null;
  return normalized.slice(0, max);
}

function numberOrNull(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function integerOrNull(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.max(0, Math.round(value));
}

function hashIdentity(value: string, salt?: string) {
  if (!value) return null;
  return createHash('sha256').update(`${salt ?? 'askoosu'}:${value}`).digest('hex');
}

function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  const deviceType = /mobile|iphone|android/.test(ua)
    ? 'mobile'
    : /ipad|tablet/.test(ua)
      ? 'tablet'
      : 'desktop';
  const browser = /edg\//.test(ua)
    ? 'Edge'
    : /chrome|crios/.test(ua)
      ? 'Chrome'
      : /safari/.test(ua)
        ? 'Safari'
        : /firefox|fxios/.test(ua)
          ? 'Firefox'
          : 'Other';
  const os = /iphone|ipad|ios/.test(ua)
    ? 'iOS'
    : /android/.test(ua)
      ? 'Android'
      : /mac os|macintosh/.test(ua)
        ? 'macOS'
        : /windows/.test(ua)
          ? 'Windows'
          : /linux/.test(ua)
            ? 'Linux'
            : 'Other';
  return { deviceType, browser, os };
}
