import { PreferenceSync } from '@/components/preference-sync';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
  title: 'AskOosu | Oosu Jang',
  description:
    'AI-connected portfolio for Oosu Jang, an AI-connected Fullstack Developer building conversational portfolio and Notion wiki workflows.',
  keywords: [
    'AskOosu',
    'Oosu Jang',
    'oosuhada',
    'Portfolio',
    'AI',
    'Fullstack Developer',
    'Interactive',
    'Notion API',
    'Vercel AI SDK',
    'Web Development',
    'Next.js',
    'React',
  ],
  authors: [
    {
      name: 'Oosu Jang',
      url: 'https://github.com/oosuhada',
    },
  ],
  creator: 'Oosu Jang',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://github.com/oosuhada/AskOosu',
    title: 'AskOosu | Oosu Jang',
    description:
      'AskOosu is Oosu Jang’s 2026 AI-connected conversational portfolio.',
    siteName: 'AskOosu',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskOosu | Oosu Jang',
    description: 'AI-connected portfolio for Oosu Jang.',
    creator: '@oosuhada',
  },
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        sizes: 'any',
      },
    ],
    shortcut: '/favicon.svg?v=2',
    apple: '/apple-touch-icon.png?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
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
          </Suspense>
          <main className="flex min-h-screen flex-col">{children}</main>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
