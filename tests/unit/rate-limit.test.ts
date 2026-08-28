import assert from 'node:assert/strict';
import test from 'node:test';

import {
  checkRateLimitForKey,
  rateLimitHeaders,
} from '../../src/lib/rate-limit.ts';

test('enforces a memory rate-limit window and exposes standard headers', async () => {
  process.env.ASKOOSU_RATE_LIMIT_STORE = 'memory';
  const scope = `test:${Date.now()}:${Math.random()}`;
  const config = { scope, windowMs: 60_000, max: 2 };

  const first = await checkRateLimitForKey('visitor', config);
  const second = await checkRateLimitForKey('visitor', config);
  const third = await checkRateLimitForKey('visitor', config);

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal(third.allowed, false);
  assert.equal(third.remaining, 0);
  assert.ok(third.retryAfter >= 1);

  const headers = rateLimitHeaders(third);
  assert.equal(headers.get('X-RateLimit-Limit'), '2');
  assert.equal(headers.get('X-RateLimit-Remaining'), '0');
  assert.ok(headers.get('Retry-After'));
});
