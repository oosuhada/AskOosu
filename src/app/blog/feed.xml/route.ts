import { Feed } from 'feed';
import { getAllPosts } from '@/lib/blog';

export async function GET() {
  const posts = (await getAllPosts()).slice(0, 20);
  const feed = new Feed({
    title: 'oosu.dev Blog',
    description: '개발하면서 겪은 문제 해결 과정을 기록합니다.',
    id: 'https://oosu.dev/blog',
    link: 'https://oosu.dev/blog',
    language: 'ko',
    favicon: 'https://oosu.dev/favicon.svg',
    copyright: `All rights reserved ${new Date().getFullYear()}, Gabriel`,
    author: {
      name: 'Gabriel',
      link: 'https://oosu.dev',
    },
  });

  posts.forEach((post) => {
    const url = `https://oosu.dev/blog/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      date: new Date(post.date),
      category: post.tags.map((tag) => ({ name: tag })),
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
