'use client';

const SESSION_STORAGE_KEY = 'askOosuSessionId';
const SESSION_ID_PATTERN = /^[A-Za-z0-9_.:-]{8,128}$/;

export function getOrCreateAnonymousSessionId() {
  if (typeof window === 'undefined') return null;

  try {
    const storedValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedValue && SESSION_ID_PATTERN.test(storedValue)) {
      return storedValue;
    }

    const sessionId =
      typeof window.crypto?.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : createFallbackSessionId();
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
  } catch {
    return null;
  }
}

export function getClientEventContext() {
  if (typeof window === 'undefined') {
    return {
      pagePath: null,
      referrer: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    pagePath: window.location.pathname,
    referrer: document.referrer || null,
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
  };
}

function createFallbackSessionId() {
  const randomPart = Math.random().toString(36).slice(2);
  return `anon_${Date.now().toString(36)}_${randomPart}`;
}
