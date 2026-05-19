import { createHmac } from 'node:crypto';

export type RequestAnalyticsContext = {
  ipHash: string | null;
  cfRay: string | null;
  country: string | null;
  geoCity: string | null;
  geoRegion: string | null;
  geoRegionCode: string | null;
  geoPostalCode: string | null;
  geoTimezone: string | null;
  geoLatitude: number | null;
  geoLongitude: number | null;
  userAgentHash: string | null;
  acceptLanguage: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
};

const MAX_SHORT_TEXT_LENGTH = 500;

export function parseRequestAnalyticsContext(req: Request): RequestAnalyticsContext {
  const userAgent = req.headers.get('user-agent') ?? '';
  const parsedUserAgent = parseUserAgent(userAgent);
  const ipAddress = getClientIpAddress(req);

  return {
    ipHash: ipAddress ? hashText(ipAddress, 'ip') : null,
    cfRay: normalizeOptionalText(req.headers.get('cf-ray'), 128),
    country: normalizeCountry(req.headers.get('cf-ipcountry')),
    geoCity: normalizeOptionalText(decodeHeaderValue(req.headers.get('cf-ipcity')), 120),
    geoRegion: normalizeOptionalText(decodeHeaderValue(req.headers.get('cf-region')), 120),
    geoRegionCode: normalizeOptionalText(req.headers.get('cf-region-code'), 40),
    geoPostalCode: normalizeOptionalText(req.headers.get('cf-postal-code'), 40),
    geoTimezone: normalizeOptionalText(req.headers.get('cf-timezone'), 80),
    geoLatitude: normalizeCoordinate(req.headers.get('cf-iplatitude'), -90, 90),
    geoLongitude: normalizeCoordinate(req.headers.get('cf-iplongitude'), -180, 180),
    userAgentHash: userAgent ? hashText(userAgent, 'ua') : null,
    acceptLanguage: normalizeOptionalText(req.headers.get('accept-language'), 200),
    deviceType: parsedUserAgent.deviceType,
    browser: parsedUserAgent.browser,
    os: parsedUserAgent.os,
  };
}

export function normalizeCountry(value: string | null | undefined) {
  const country = normalizeOptionalText(value, 8);
  if (!country || country === 'XX' || country === 'T1') return null;
  return country.toUpperCase();
}

export function normalizePath(value: string | null | undefined) {
  const text = normalizeOptionalText(value, MAX_SHORT_TEXT_LENGTH);
  if (!text) return null;

  try {
    const url = new URL(text, 'https://oosu.dev');
    return `${url.pathname}${url.search}`.slice(0, MAX_SHORT_TEXT_LENGTH);
  } catch {
    return text.startsWith('/') ? text : null;
  }
}

export function normalizeReferrer(value: string | null | undefined) {
  const text = normalizeOptionalText(value, MAX_SHORT_TEXT_LENGTH);
  if (!text) return null;

  try {
    const url = new URL(text);
    return `${url.origin}${url.pathname}`.slice(0, MAX_SHORT_TEXT_LENGTH);
  } catch {
    return null;
  }
}

export function normalizeOptionalText(value: string | null | undefined, max: number) {
  const text = truncateText(value ?? '', max);
  return text || null;
}

export function truncateText(value: string, max: number) {
  return value.trim().replace(/\s+/g, ' ').slice(0, max);
}

function getClientIpAddress(req: Request) {
  const cloudflareIp = req.headers.get('cf-connecting-ip');
  if (cloudflareIp) return cloudflareIp;

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (!forwardedFor) return null;

  return forwardedFor.split(',')[0]?.trim() || null;
}

function hashText(value: string, scope: string) {
  return createHmac('sha256', getAnalyticsHashSalt())
    .update(scope)
    .update(':')
    .update(value)
    .digest('hex');
}

function getAnalyticsHashSalt() {
  return (
    process.env.ASKOOSU_IP_HASH_SALT ||
    process.env.RAG_SYNC_SECRET ||
    process.env.ASKOOSU_RAG_ADMIN_TOKEN ||
    'askoosu-local-development-ip-hash-salt'
  );
}

function parseUserAgent(userAgent: string) {
  const lowerUserAgent = userAgent.toLowerCase();

  return {
    deviceType: /mobile|iphone|android/.test(lowerUserAgent)
      ? 'mobile'
      : /ipad|tablet/.test(lowerUserAgent)
        ? 'tablet'
        : 'desktop',
    browser: /edg\//.test(lowerUserAgent)
      ? 'Edge'
      : /chrome|crios/.test(lowerUserAgent)
        ? 'Chrome'
        : /safari/.test(lowerUserAgent)
          ? 'Safari'
          : /firefox|fxios/.test(lowerUserAgent)
            ? 'Firefox'
            : 'Other',
    os: /iphone|ipad|ios/.test(lowerUserAgent)
      ? 'iOS'
      : /android/.test(lowerUserAgent)
        ? 'Android'
        : /mac os|macintosh/.test(lowerUserAgent)
          ? 'macOS'
          : /windows/.test(lowerUserAgent)
            ? 'Windows'
            : /linux/.test(lowerUserAgent)
              ? 'Linux'
              : 'Other',
  };
}

function decodeHeaderValue(value: string | null) {
  if (!value) return null;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeCoordinate(value: string | null, min: number, max: number) {
  if (!value) return null;

  const coordinate = Number(value);
  if (!Number.isFinite(coordinate) || coordinate < min || coordinate > max) {
    return null;
  }

  return coordinate;
}
