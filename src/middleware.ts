import { NextRequest, NextResponse } from 'next/server';
import { parsePreferenceTokens } from '@/lib/preferences';

const ignoredPathPrefixes = ['/api', '/_next'];
const publicFilePattern = /\.[^/]+$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    ignoredPathPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    publicFilePattern.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return NextResponse.next();

  const routeSegments = segments.filter((segment) => segment === 'chat');
  const preferenceSegments = segments.filter((segment) => segment !== 'chat');
  const preferences = parsePreferenceTokens(preferenceSegments);
  const hasPreference = Boolean(preferences.theme || preferences.lang);

  if (!hasPreference) return NextResponse.next();

  const unknownSegments = preferenceSegments.filter((segment) => {
    const parsed = parsePreferenceTokens([segment]);
    return !parsed.theme && !parsed.lang;
  });

  if (unknownSegments.length > 0) return NextResponse.next();

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = routeSegments.length > 0 ? '/chat' : '/';

  if (preferences.theme) {
    rewriteUrl.searchParams.set('theme', preferences.theme);
  }

  if (preferences.lang) {
    rewriteUrl.searchParams.set('lang', preferences.lang);
  }

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.svg|apple-touch-icon.png).*)',
  ],
};
