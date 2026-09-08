import assert from 'node:assert/strict';
import test from 'node:test';

import { logInfo } from '../../src/lib/observability/logger.ts';

test('structured logger redacts prompts, questions, source ids, and credentials', () => {
  const originalInfo = console.info;
  const lines: string[] = [];
  console.info = (...args: unknown[]) => lines.push(args.join(' '));
  try {
    logInfo('security.redaction_test', {
      requestId: 'req-safe',
      question: 'private home address?',
      rawPrompt: 'system secret',
      sourceChunkIds: ['private-chunk'],
      authorization: 'Bearer secret-token',
      safeMetric: 7,
    });
  } finally {
    console.info = originalInfo;
  }

  const payload = JSON.parse(lines[0]) as Record<string, unknown>;
  assert.equal(payload.requestId, 'req-safe');
  assert.equal(payload.question, '[redacted]');
  assert.equal(payload.rawPrompt, '[redacted]');
  assert.equal(payload.sourceChunkIds, '[redacted]');
  assert.equal(payload.authorization, '[redacted]');
  assert.equal(payload.safeMetric, 7);
  assert.equal(lines[0].includes('private home address'), false);
  assert.equal(lines[0].includes('secret-token'), false);
});
