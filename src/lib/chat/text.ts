import { createHash } from 'node:crypto';

export function normalizeQuestion(input: string) {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[“”‘’]/g, "'")
    .toLowerCase();
}

export function normalizeQuestionForMatch(input: string) {
  return normalizeQuestion(input)
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hashQuestion(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

export function truncateText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}
