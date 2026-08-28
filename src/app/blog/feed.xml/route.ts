import { Feed } from 'feed';
import { blogAuthor } from '@/lib/blog-author';
import { getAllPosts } from '@/lib/blog';

export async function GET() {
  const posts = (await getAllPosts()).slice(0, 20);
  const feed = new Feed({
    title: 'oosu.dev Blog',
    description: blogAuthor.description,
    id: 'https://oosu.dev/blog',
    link: 'https://oosu.dev/blog',
    language: 'ko',
    favicon: 'https://oosu.dev/favicon.svg',
    copyright: `All rights reserved ${new Date().getFullYear()}, ${blogAuthor.name}`,
    author: {
      name: `${blogAuthor.name} (${blogAuthor.displayName})`,
      link: blogAuthor.url,
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
      author: [
        {
          name: `${blogAuthor.name} (${blogAuthor.displayName})`,
          link: blogAuthor.url,
        },
      ],
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
