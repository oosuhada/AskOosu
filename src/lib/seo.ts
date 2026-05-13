import type { Metadata } from 'next';
import { oosuProfile, oosuProjects } from '@/lib/oosu-profile';

export const siteUrl = 'https://oosu.dev';
export const siteName = 'Oosu.dev';
export const defaultTitle = 'Oosu — AI-connected Fullstack Developer';
export const defaultDescription =
  'AI-connected fullstack developer building product-minded web applications, RAG portfolio systems, and trustworthy AI-assisted product workflows.';

export const seoKeywords = [
  'Oosu',
  'oosuhada',
  'AI-connected fullstack developer',
  'AI portfolio',
  'RAG portfolio',
  'AskOosu',
  'AI Director',
  'AI product builder',
  'Next.js developer',
  'UX engineering',
];

export const publicRoutes = [
  '/',
  '/ask',
  '/chat',
  '/about',
  '/projects',
  '/projects/askoosu',
  '/blog',
  '/ai-director',
  '/ai-era-developer',
  '/faq/ai-competitiveness',
  '/privacy',
] as const;

export type PublicRoute = (typeof publicRoutes)[number];

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function createPageMetadata({
  title,
  description = defaultDescription,
  path,
  keywords = [],
}: {
  title: string;
  description?: string;
  path: PublicRoute;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords: [...seoKeywords, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      url,
      siteName,
      title,
      description,
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
      title,
      description,
      creator: '@oosuhada',
      images: ['/twitter-image'],
    },
  };
}

export const sameAsLinks = [
  oosuProfile.github,
  oosuProfile.linkedin,
].filter(Boolean);

export const featuredProjects = oosuProjects.slice(0, 4);

export const jsonLdGraph = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: 'Oosu',
    alternateName: ['oosuhada', 'Onjung official'],
    url: siteUrl,
    jobTitle: 'AI-connected Fullstack Developer',
    description:
      'Oosu is an AI-connected fullstack developer building product-minded web applications, RAG portfolio systems, and trustworthy AI-assisted product workflows.',
    knowsAbout: [
      'AI application development',
      'Fullstack development',
      'Next.js',
      'RAG',
      'UX engineering',
      'AI agent workflow',
      'Product design',
      'AI-assisted product workflows',
    ],
    sameAs: sameAsLinks,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    description: defaultDescription,
    inLanguage: ['ko', 'en'],
    publisher: {
      '@id': `${siteUrl}/#person`,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl}/#askoosu`,
    name: 'AskOosu',
    applicationCategory: 'PortfolioApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description:
      'AskOosu is a conversational RAG portfolio system that answers questions about Oosu through FAQ routing, Wiki documents, and source-grounded portfolio evidence.',
    creator: {
      '@id': `${siteUrl}/#person`,
    },
    keywords: [
      'RAG portfolio',
      'AI portfolio',
      'trusted AI UX',
      'Next.js',
      'portfolio chatbot',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteUrl}/#featured-projects`,
    name: 'Featured Oosu projects',
    itemListElement: featuredProjects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: project.title,
        description: project.description,
        url: project.links[0]?.url ?? siteUrl,
        creator: {
          '@id': `${siteUrl}/#person`,
        },
      },
    })),
  },
];

export function getJsonLd() {
  return JSON.stringify(jsonLdGraph).replace(/</g, '\\u003c');
}
