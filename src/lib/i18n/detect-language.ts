export type ChatLanguage = 'ko' | 'en';

export function detectLanguage(
  input: string,
  preferredLanguage?: ChatLanguage | null
): ChatLanguage {
  const koreanChars = input.match(/[가-힣]/g)?.length ?? 0;
  const latinChars = input.match(/[a-zA-Z]/g)?.length ?? 0;

  if (koreanChars >= 2) return 'ko';
  if (latinChars > koreanChars) return 'en';

  return preferredLanguage ?? 'ko';
}

export function parsePreferredLanguage(value: unknown): ChatLanguage | null {
  if (value === 'ko' || value === 'en') return value;
  return null;
}
