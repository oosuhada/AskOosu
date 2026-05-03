'use client';

import { useDisplayPreferences } from '@/lib/use-display-preferences';

export function PreferenceSync() {
  useDisplayPreferences();
  return null;
}
