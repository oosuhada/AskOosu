import type { Metadata } from 'next';
import { oosuProfile, oosuProjects } from '@/lib/oosu-profile';

export const siteUrl = 'https://oosu.dev';
export const siteName = 'Oosu.dev';
export const defaultTitle = '장우수(Oosu) | AI·풀스택 개발자 — 우수하다';
export const defaultDescription =
  '우수하다(oosuhada)라는 이름으로 활동하는 AI·풀스택 개발자 장우수의 포트폴리오입니다. Next.js, AI·RAG 서비스, 프론트엔드와 풀스택 개발 프로젝트를 소개합니다.';

export const seoKeywords = [
  'Oosu',
  'oosuhada',
  '우수하다',
  '우수',
  '장우수',
  '장우수 개발자',
  'AI 개발자',
  '풀스택 개발자',
  '프론트엔드 개발자',
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
  '/intro',
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

export const sameAsLinks = [oosuProfile.github, oosuProfile.linkedin].filter(
  Boolean
);

export const featuredProjects = oosuProjects.slice(0, 4);

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${siteUrl}/#person`,
  name: '장우수',
  alternateName: ['Oosu', 'Oosu Jang', 'oosuhada', '우수하다', '우수'],
  url: `${siteUrl}/about`,
  jobTitle: 'AI·풀스택 개발자',
  description:
    '우수하다(oosuhada)라는 이름으로 활동하며 AI·RAG 서비스와 제품 중심 웹 애플리케이션을 만드는 풀스택 개발자 장우수.',
  knowsAbout: [
    'AI application development',
    'Fullstack development',
    'Frontend development',
    'Next.js',
    'RAG',
    'UX engineering',
    'AI agent workflow',
    'Product design',
    'AI-assisted product workflows',
  ],
  sameAs: sameAsLinks,
};

export const siteJsonLdGraph = [
  personJsonLd,
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: siteName,
    alternateName: ['Oosu', '우수하다', 'oosuhada'],
    url: siteUrl,
    description: defaultDescription,
    inLanguage: ['ko', 'en'],
    publisher: {
      '@id': `${siteUrl}/#person`,
    },
  },
];

export const homeJsonLdGraph = [
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

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function getSiteJsonLd() {
  return serializeJsonLd(siteJsonLdGraph);
}

export function getHomeJsonLd() {
  return serializeJsonLd(homeJsonLdGraph);
}
