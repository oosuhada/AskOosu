import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Rss } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog | oosu.dev',
  description: '개발하면서 겪은 문제 해결 과정을 기록합니다.',
  alternates: { canonical: 'https://oosu.dev/blog' },
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <main>
      <section className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-semibold uppercase">
              Blog
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-bold sm:text-6xl">
              문제를 고친 흔적을 검색 가능한 글로 남깁니다.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
              macOS 자동화, AI 제품 개발, 배포 운영처럼 실제로 겪은 문제와 해결 과정을 기록합니다.
            </p>
          </div>
          <Link
            href="/blog/feed.xml"
            className="border-border hover:bg-muted inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Rss size={16} />
            RSS
          </Link>
        </div>
      </section>
      <section className="mx-auto w-full max-w-5xl px-5 pb-20">
        {posts.length > 0 ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-border/70 bg-card rounded-lg border p-5 transition-colors hover:border-foreground/30"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        <time dateTime={post.date}>{post.date}</time>
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">{post.title}</h2>
                    </div>
                    <ArrowUpRight className="mt-1 hidden shrink-0 sm:block" size={20} />
                  </div>
                  <p className="text-muted-foreground mt-4 leading-7">
                    {post.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">아직 공개된 포스트가 없습니다.</p>
        )}
      </section>
    </main>
  );
}
