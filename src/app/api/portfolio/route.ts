import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';
import { getGithubPortfolioRepositories } from '@/lib/github-portfolio';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [repositories, posts] = await Promise.all([
    getGithubPortfolioRepositories(),
    getAllPosts(),
  ]);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    github: {
      owner: 'oosuhada',
      repositories,
    },
    blog: {
      posts: posts.slice(0, 12).map((post) => ({
        ...post,
        url: `/blog/${post.slug}`,
      })),
    },
  });
}
