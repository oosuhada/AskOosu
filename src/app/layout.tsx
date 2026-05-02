import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Load Inter font for non-Apple devices
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

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
      </head>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          inter.variable
        )}
      >
        <main className="flex min-h-screen flex-col">{children}</main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
