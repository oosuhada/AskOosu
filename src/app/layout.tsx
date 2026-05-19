import { PreferenceSync } from '@/components/preference-sync';
import { VisitorTracker } from '@/components/analytics/visitor-tracker';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import {
  defaultDescription,
  defaultTitle,
  seoKeywords,
  siteName,
  siteUrl,
} from '@/lib/seo';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import type { Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';
import './globals.css';

// Load Inter font for non-Apple devices
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const preferenceInitScript = `
(() => {
  const themeTokens = new Set(['dark', 'light']);
  const languageMap = new Map([
    ['ko', 'ko'],
    ['kr', 'ko'],
    ['korean', 'ko'],
    ['en', 'en'],
    ['eng', 'en'],
    ['english', 'en'],
  ]);

  const tokensFromPath = window.location.pathname
    .split('/')
    .filter(Boolean)
    .flatMap((token) => decodeURIComponent(token).toLowerCase().split(/[\\s_-]+/));

  const search = new URLSearchParams(window.location.search);
  const tokens = [
    search.get('theme'),
    search.get('mode'),
    search.get('lang'),
    search.get('locale'),
    ...tokensFromPath,
  ].filter(Boolean).map((token) => String(token).toLowerCase());

  const explicitTheme = tokens.find((token) => themeTokens.has(token));
  const explicitLanguage = tokens.map((token) => languageMap.get(token)).find(Boolean);
  let storedTheme;
  let storedLanguage;
  try {
    const storedPreferences = JSON.parse(window.localStorage.getItem('ask-oosu-display-preferences') || '{}');
    storedTheme = themeTokens.has(storedPreferences.theme) ? storedPreferences.theme : undefined;
    storedLanguage = languageMap.get(storedPreferences.lang);
  } catch {}
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const browserLanguage = (navigator.languages || [navigator.language])
    .some((language) => language.toLowerCase().startsWith('ko')) ? 'ko' : 'en';
  const theme = explicitTheme || storedTheme || systemTheme;
  const language = explicitLanguage || storedLanguage || browserLanguage;

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = language;
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: '%s | Oosu',
  },
  description: defaultDescription,
  keywords: seoKeywords,
  authors: [
    {
      name: 'Oosu Jang',
      url: 'https://github.com/oosuhada',
    },
  ],
  creator: 'Oosu Jang',
  publisher: 'Oosu Jang',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    title: defaultTitle,
    description: defaultDescription,
    siteName,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: defaultTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    creator: '@oosuhada',
    images: ['/twitter-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon.svg',
        sizes: 'any',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png?v=2',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const shouldLoadVercelAnalytics =
  process.env.VERCEL === '1' ||
  process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true';
const cloudflareAnalyticsToken =
  process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <script dangerouslySetInnerHTML={{ __html: preferenceInitScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <PreferenceSync />
            <VisitorTracker />
          </Suspense>
          <main className="flex min-h-screen flex-col">{children}</main>
          <Toaster />
          {cloudflareAnalyticsToken ? (
            <Script
              src="https://static.cloudflareinsights.com/beacon.min.js"
              strategy="afterInteractive"
              defer
              data-cf-beacon={JSON.stringify({
                token: cloudflareAnalyticsToken,
              })}
            />
          ) : null}
          {shouldLoadVercelAnalytics ? <Analytics /> : null}
        </ThemeProvider>
      </body>
    </html>
  );
}
