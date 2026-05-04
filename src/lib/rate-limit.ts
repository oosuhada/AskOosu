type RateLimitConfig = {
  scope: string;
  windowMs: number;
  max: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

declare global {
  // eslint-disable-next-line no-var
  var askOosuRateLimitBuckets: Map<string, RateLimitState> | undefined;
}

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanupAt = 0;

export function checkRateLimit(
  req: Request,
  config: RateLimitConfig
): RateLimitResult {
  return checkRateLimitForKey(getClientIp(req), config);
}

export function checkRateLimitForKey(
  rawKey: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const buckets = getBuckets();
  const key = `${config.scope}:${normalizeRateLimitKey(rawKey)}`;
  const current = buckets.get(key);

  cleanupExpiredBuckets(buckets, now);

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      allowed: true,
      limit: config.max,
      remaining: config.max - 1,
      resetAt: now + config.windowMs,
      retryAfter: 0,
    };
  }

  current.count += 1;
  buckets.set(key, current);

  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  const remaining = Math.max(0, config.max - current.count);

  return {
    allowed: current.count <= config.max,
    limit: config.max,
    remaining,
    resetAt: current.resetAt,
    retryAfter,
  };
}

function normalizeRateLimitKey(value: string) {
  return value.trim().replace(/\s+/g, '_').slice(0, 160) || 'unknown';
}

export function rateLimitHeaders(result: RateLimitResult) {
  const headers = new Headers({
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  });

  if (!result.allowed) {
    headers.set('Retry-After', String(result.retryAfter));
  }

  return headers;
}

function getBuckets() {
  if (!globalThis.askOosuRateLimitBuckets) {
    globalThis.askOosuRateLimitBuckets = new Map();
  }

  return globalThis.askOosuRateLimitBuckets;
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const firstForwardedIp = forwardedFor
    ?.split(',')
    .map((value) => value.trim())
    .find(Boolean);

  return (
    firstForwardedIp ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function cleanupExpiredBuckets(
  buckets: Map<string, RateLimitState>,
  now: number
) {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;

  for (const [key, state] of buckets.entries()) {
    if (state.resetAt <= now) {
      buckets.delete(key);
    }
  }
}
