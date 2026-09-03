import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';
import { getIndexedGithubProjects } from '@/lib/rag/github-source';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [repositories, posts] = await Promise.all([
    getIndexedGithubProjects(12),
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
