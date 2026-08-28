import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hasRedactionMarker,
  redactSensitiveText,
} from '../../src/lib/privacy/redact.ts';

test('redacts common secrets and personal identifiers', () => {
  const input = [
    'email=test.person@example.com',
    'phone=010-1234-5678',
    'card=4242 4242 4242 4242',
    'token=ghp_abcdefghijklmnopqrstuvwxyz123456',
    'password=super-secret-password',
  ].join(' ');

  const redacted = redactSensitiveText(input);

  assert.equal(redacted.includes('test.person@example.com'), false);
  assert.equal(redacted.includes('010-1234-5678'), false);
  assert.equal(redacted.includes('4242 4242 4242 4242'), false);
  assert.equal(redacted.includes('ghp_abcdefghijklmnopqrstuvwxyz123456'), false);
  assert.equal(redacted.includes('super-secret-password'), false);
  assert.equal(hasRedactionMarker(redacted), true);
});

test('keeps ordinary product text readable and respects output limits', () => {
  const input = 'AskOosu uses deterministic routing before RAG generation.';
  assert.equal(redactSensitiveText(input), input);
  assert.equal(redactSensitiveText('abcdefghij', 5), 'abcde');
});
