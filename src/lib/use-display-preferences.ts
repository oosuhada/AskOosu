'use client';

import {
  detectBrowserLanguage,
  detectSystemTheme,
  parsePreferencePath,
  parsePreferenceSearchParams,
  readStoredDisplayPreferences,
  type DisplayLanguage,
  type DisplayTheme,
  type PreferenceTokens,
  writeStoredDisplayPreferences,
} from '@/lib/preferences';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useDisplayPreferences() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [systemTheme, setSystemTheme] = useState<DisplayTheme>('light');
  const [browserLanguage, setBrowserLanguage] = useState<DisplayLanguage>('ko');
  const [storedPreferences, setStoredPreferences] = useState<PreferenceTokens>(
    {}
  );

  useEffect(() => {
    setSystemTheme(detectSystemTheme());
    setBrowserLanguage(detectBrowserLanguage());
    setStoredPreferences(readStoredDisplayPreferences());

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

  const theme =
    explicitPreferences.theme ?? storedPreferences.theme ?? systemTheme;
  const language =
    explicitPreferences.lang ?? storedPreferences.lang ?? browserLanguage;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
  }, [theme, language]);

  const updateUrlPreference = useCallback(
    (key: 'theme' | 'lang', value: DisplayTheme | DisplayLanguage) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);

      const nextUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setThemePreference = useCallback(
    (nextTheme: DisplayTheme) => {
      setStoredPreferences((currentPreferences) => {
        const nextPreferences = {
          ...currentPreferences,
          theme: nextTheme,
        };

        writeStoredDisplayPreferences(nextPreferences);
        return nextPreferences;
      });
      updateUrlPreference('theme', nextTheme);
    },
    [updateUrlPreference]
  );

  const setLanguagePreference = useCallback(
    (nextLanguage: DisplayLanguage) => {
      setStoredPreferences((currentPreferences) => {
        const nextPreferences = {
          ...currentPreferences,
          lang: nextLanguage,
        };

        writeStoredDisplayPreferences(nextPreferences);
        return nextPreferences;
      });
      updateUrlPreference('lang', nextLanguage);
    },
    [updateUrlPreference]
  );

  return {
    theme,
    language,
    explicitTheme: explicitPreferences.theme,
    explicitLanguage: explicitPreferences.lang,
    setThemePreference,
    setLanguagePreference,
  };
}
