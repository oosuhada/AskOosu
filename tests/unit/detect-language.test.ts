import assert from 'node:assert/strict';
import test from 'node:test';

import {
  detectLanguage,
  parsePreferredLanguage,
} from '../../src/lib/i18n/detect-language.ts';

test('detects Korean and English while preserving a preference for ambiguous text', () => {
  assert.equal(detectLanguage('우수는 어떤 개발자예요?'), 'ko');
  assert.equal(detectLanguage('What kind of developer is Oosu?'), 'en');
  assert.equal(detectLanguage('12345', 'en'), 'en');
  assert.equal(detectLanguage('12345'), 'ko');
});

test('accepts only supported preferred languages', () => {
  assert.equal(parsePreferredLanguage('ko'), 'ko');
  assert.equal(parsePreferredLanguage('en'), 'en');
  assert.equal(parsePreferredLanguage('ja'), null);
});
