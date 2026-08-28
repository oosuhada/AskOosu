import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildInsufficientEvidenceAnswer,
  detectPromptLeakage,
} from '../../src/lib/chat/output-guardrails.ts';

test('detects internal prompt and retrieval metadata leakage markers', () => {
  const leaked = [
    'SYSTEM_PROMPT',
    'Retrieved Wiki Context',
    'chunk_id=abc',
    'entity_id=project.askoosu',
    'section_path=Architecture',
  ];

  for (const value of leaked) assert.equal(detectPromptLeakage(value), true);
  assert.equal(
    detectPromptLeakage('AskOosu explains its public architecture and sources.'),
    false
  );
});

test('returns localized insufficient-evidence copy', () => {
  assert.match(buildInsufficientEvidenceAnswer('ko'), /근거/);
  assert.match(buildInsufficientEvidenceAnswer('en'), /evidence/i);
});
