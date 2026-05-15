import type { MetadataRoute } from 'next';
import { absoluteUrl, publicRoutes } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route === '/chat' || route === '/ask' ? 0.9 : 0.7,
  }));
}
