'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getOrCreateAnonymousSessionId } from '@/lib/analytics/client';

export function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/api')) return;

    const params = new URLSearchParams(searchParams?.toString());
    const payload = {
      sessionId: getOrCreateAnonymousSessionId(),
      path: `${pathname}${params.toString() ? `?${params.toString()}` : ''}`,
      referrer: document.referrer || null,
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      screenWidth: window.screen?.width ?? null,
      screenHeight: window.screen?.height ?? null,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon('/api/analytics/page-view', blob)) return;
    }

    void fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
