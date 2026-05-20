'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { getOrCreateAnonymousSessionId } from '@/lib/analytics/client';

const HEARTBEAT_MS = 15000;

export function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = getOrCreateAnonymousSessionId();
    if (!sessionId) return;

    const startedAt = Date.now();
    const params = new URLSearchParams(searchParams.toString());
    const base = {
      sessionId,
      path: pathname,
      referrer: document.referrer || null,
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      clientLanguage: navigator.language,
    };

    send({ ...base, eventType: 'page_view' });

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        send({ ...base, eventType: 'engagement', durationMs: Date.now() - startedAt });
      }
    }, HEARTBEAT_MS);

    const onClick = (event: MouseEvent) => {
      const element = (event.target as Element | null)?.closest('a,button,[role="button"]');
      if (!element) return;
      const text = (element.textContent || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      send({
        ...base,
        eventType: 'click',
        targetTag: element.tagName.toLowerCase(),
        targetText: text.slice(0, 500) || null,
        targetHref: element instanceof HTMLAnchorElement ? element.href : null,
      });
    };

    const onPageHide = () => {
      send({ ...base, eventType: 'engagement', durationMs: Date.now() - startedAt }, true);
    };

    document.addEventListener('click', onClick, { capture: true });
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener('click', onClick, { capture: true });
      window.removeEventListener('pagehide', onPageHide);
      send({ ...base, eventType: 'engagement', durationMs: Date.now() - startedAt }, true);
    };
  }, [pathname, searchParams]);

  return null;
}

function send(payload: Record<string, unknown>, beacon = false) {
  const body = JSON.stringify(payload);
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/event', new Blob([body], { type: 'application/json' }));
    return;
  }
  void fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
