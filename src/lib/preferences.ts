export type DisplayTheme = 'light' | 'dark';
export type DisplayLanguage = 'ko' | 'en';

type PreferenceTokens = {
  theme?: DisplayTheme;
  lang?: DisplayLanguage;
};

const themeTokens = new Set(['dark', 'light']);
const languageTokens = new Set(['ko', 'kr', 'korean', 'en', 'eng', 'english']);

export function normalizeTheme(
  value?: string | null
): DisplayTheme | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  return themeTokens.has(normalized) ? (normalized as DisplayTheme) : undefined;
}

export function normalizeLanguage(
  value?: string | null
): DisplayLanguage | undefined {
  if (!value) return undefined;

  const normalized = value.toLowerCase();
  if (['ko', 'kr', 'korean'].includes(normalized)) return 'ko';
  if (['en', 'eng', 'english'].includes(normalized)) return 'en';

  return undefined;
}

export function parsePreferenceTokens(tokens: string[]): PreferenceTokens {
  return tokens.reduce<PreferenceTokens>((result, rawToken) => {
    const decodedToken = decodeURIComponent(rawToken).toLowerCase();
    const pieces = decodedToken
      .split(/[\s_-]+/)
      .map((piece) => piece.trim())
      .filter(Boolean);

    pieces.forEach((piece) => {
      const theme = normalizeTheme(piece);
      const lang = normalizeLanguage(piece);

      if (theme) result.theme = theme;
      if (lang) result.lang = lang;
    });

    return result;
  }, {});
}

export function parsePreferenceSearchParams(searchParams: {
  get(name: string): string | null;
}): PreferenceTokens {
  return {
    theme:
      normalizeTheme(searchParams.get('theme')) ??
      normalizeTheme(searchParams.get('mode')),
    lang:
      normalizeLanguage(searchParams.get('lang')) ??
      normalizeLanguage(searchParams.get('locale')),
  };
}

export function parsePreferencePath(pathname: string): PreferenceTokens {
  return parsePreferenceTokens(pathname.split('/').filter(Boolean));
}

export function detectBrowserLanguage(): DisplayLanguage {
  if (typeof navigator === 'undefined') return 'ko';

  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  return languages.some((language) => language.toLowerCase().startsWith('ko'))
    ? 'ko'
    : 'en';
}

export function detectSystemTheme(): DisplayTheme {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
