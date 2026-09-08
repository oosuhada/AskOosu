import assert from 'node:assert/strict';
import test from 'node:test';

import { createRequestTrace } from '../../src/lib/observability/request-trace.ts';

test('request trace records correlated stage timings without request payloads', async () => {
  const records: Array<{ event: string; data: Record<string, unknown> }> = [];
  const ticks = [0, 2, 7, 8, 11, 15];
  const trace = createRequestTrace({
    requestId: 'req-test',
    route: 'api/chat',
    now: () => ticks.shift() ?? 15,
    logger: (event, data) => records.push({ event, data }),
  });

  await trace.measure('routing', async () => 'ok');
  trace.measureSync('guardrail', () => true);
  trace.finish();
  trace.finish();

  assert.equal(records.length, 1);
  assert.equal(records[0].event, 'chat.trace_completed');
  assert.equal(records[0].data.requestId, 'req-test');
  assert.deepEqual(records[0].data.stages, [
    { name: 'routing', durationMs: 5, success: true },
    { name: 'guardrail', durationMs: 3, success: true },
  ]);
  assert.equal(records[0].data.totalLatencyMs, 15);
  assert.equal('question' in records[0].data, false);
  assert.equal('answer' in records[0].data, false);
});

test('request trace marks failed stages before rethrowing', async () => {
  const records: Array<{ event: string; data: Record<string, unknown> }> = [];
  const ticks = [0, 10, 16, 20];
  const trace = createRequestTrace({
    requestId: 'req-failure',
    route: 'api/chat',
    now: () => ticks.shift() ?? 20,
    logger: (event, data) => records.push({ event, data }),
  });

  await assert.rejects(
    trace.measure('provider', async () => {
      throw new Error('injected provider timeout');
    }),
    /injected provider timeout/
  );
  trace.finish();

  assert.deepEqual(records[0].data.stages, [
    { name: 'provider', durationMs: 6, success: false },
  ]);
});
