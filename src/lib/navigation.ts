import type { DisplayLanguage, DisplayTheme } from '@/lib/preferences';

export function buildChatHref({
  query,
  language,
  theme,
}: {
  query: string;
  language: DisplayLanguage;
  theme: DisplayTheme;
}) {
  const params = new URLSearchParams({
    query,
    lang: language,
    theme,
  });

  return `/chat?${params.toString()}`;
}
