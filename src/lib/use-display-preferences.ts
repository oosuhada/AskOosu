'use client';

import {
  detectBrowserLanguage,
  detectSystemTheme,
  parsePreferencePath,
  parsePreferenceSearchParams,
  type DisplayLanguage,
  type DisplayTheme,
} from '@/lib/preferences';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export function useDisplayPreferences() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [systemTheme, setSystemTheme] = useState<DisplayTheme>('light');
  const [browserLanguage, setBrowserLanguage] = useState<DisplayLanguage>('ko');

  useEffect(() => {
    setSystemTheme(detectSystemTheme());
    setBrowserLanguage(detectBrowserLanguage());

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onThemeChange = () => setSystemTheme(detectSystemTheme());

    media.addEventListener('change', onThemeChange);
    return () => media.removeEventListener('change', onThemeChange);
  }, []);

  const explicitPreferences = useMemo(() => {
    const fromSearch = parsePreferenceSearchParams(searchParams);
    const fromPath = parsePreferencePath(pathname);

    return {
      theme: fromSearch.theme ?? fromPath.theme,
      lang: fromSearch.lang ?? fromPath.lang,
    };
  }, [pathname, searchParams]);

  const theme = explicitPreferences.theme ?? systemTheme;
  const language = explicitPreferences.lang ?? browserLanguage;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
  }, [theme, language]);

  return {
    theme,
    language,
    explicitTheme: explicitPreferences.theme,
    explicitLanguage: explicitPreferences.lang,
  };
}
