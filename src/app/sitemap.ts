import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { absoluteUrl, publicRoutes } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getAllPosts();

  const publicPages = publicRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === '/' ? ('weekly' as const) : ('monthly' as const),
    priority: route === '/' ? 1 : route === '/chat' || route === '/ask' ? 0.9 : route === '/blog' ? 0.8 : 0.7,
  }));

  const blogPosts = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...publicPages, ...blogPosts];
}
