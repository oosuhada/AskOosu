import {
  checkPostgresRateLimit,
  hasPostgresDatabaseUrl,
} from './rate-limit/database';

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

type RateLimitStore = 'memory' | 'postgres';

declare global {
  // eslint-disable-next-line no-var
  var askOosuRateLimitBuckets: Map<string, RateLimitState> | undefined;
}

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanupAt = 0;

export type { RateLimitConfig, RateLimitResult };

export async function checkRateLimit(
  req: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  return checkRateLimitForKey(getClientIp(req), config);
}

export async function checkRateLimitForKey(
  rawKey: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = normalizeRateLimitKey(rawKey);
  const scope = normalizeRateLimitScope(config.scope);

  if (getRateLimitStore() === 'postgres') {
    try {
      return await checkPostgresRateLimit({
        key,
        scope,
        windowMs: config.windowMs,
        max: config.max,
      });
    } catch (error) {
      console.warn(
        'Postgres rate limit failed; using memory fallback:',
        getSafeError(error)
      );
    }
  }

  return checkMemoryRateLimit(key, scope, config);
}

function checkMemoryRateLimit(
  key: string,
  scope: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const buckets = getBuckets();
  const bucketKey = `${scope}:${key}`;
  const current = buckets.get(bucketKey);

  cleanupExpiredBuckets(buckets, now);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, {
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
  buckets.set(bucketKey, current);

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

function normalizeRateLimitScope(value: string) {
  return value.trim().replace(/\s+/g, '_').slice(0, 120) || 'default';
}

function getRateLimitStore(): RateLimitStore {
  const value = process.env.ASKOOSU_RATE_LIMIT_STORE?.toLowerCase();
  if (value === 'memory') return 'memory';
  if (value === 'postgres' && hasPostgresDatabaseUrl()) return 'postgres';
  return hasPostgresDatabaseUrl() ? 'postgres' : 'memory';
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

function getSafeError(error: unknown) {
  return error instanceof Error
    ? { name: error.name, message: error.message }
    : { message: 'Unknown error' };
}
