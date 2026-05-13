import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

const disallowedPrivatePaths = [
  '/api/',
  '/admin/',
  '/dashboard/',
  '/private/',
  '/answer-design-lab/',
];

const allowedSearchAgents = [
  '*',
  'Googlebot',
  'bingbot',
  'OAI-SearchBot',
  'GPTBot',
  'PerplexityBot',
  'Claude-SearchBot',
  'ClaudeBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: allowedSearchAgents.map((userAgent) => ({
      userAgent,
      allow: '/',
      disallow: disallowedPrivatePaths,
    })),
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
