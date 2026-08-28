import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Rss } from 'lucide-react';
import { BlogAuthorBio } from '@/components/blog/blog-author';
import { LocalizedText } from '@/components/localized-content';
import { blogAuthor } from '@/lib/blog-author';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: '우수하다(oosuhada) 개발 블로그 | 장우수',
  description: blogAuthor.description,
  authors: [{ name: blogAuthor.name, url: blogAuthor.url }],
  alternates: { canonical: 'https://oosu.dev/blog' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://oosu.dev/blog',
    siteName: 'Oosu.dev',
    title: '우수하다(oosuhada) 개발 블로그 | 장우수',
    description: blogAuthor.description,
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://oosu.dev/blog#blog',
    name: '우수하다(oosuhada) 개발 블로그',
    url: 'https://oosu.dev/blog',
    description: blogAuthor.description,
    inLanguage: 'ko-KR',
    author: {
      '@type': 'Person',
      '@id': 'https://oosu.dev/#person',
      name: blogAuthor.name,
      alternateName: ['Oosu', 'oosuhada', '우수하다'],
      url: blogAuthor.url,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `https://oosu.dev/blog/${post.slug}`,
      datePublished: post.date,
      author: { '@id': 'https://oosu.dev/#person' },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <section className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-semibold uppercase">
              Blog
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-bold sm:text-6xl">
              <LocalizedText
                ko="문제를 고친 흔적을 검색 가능한 글로 남깁니다."
                en="Searchable notes from problems solved in practice."
              />
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
              <LocalizedText
                ko="macOS 자동화, AI 제품 개발, 배포 운영처럼 실제로 겪은 문제와 해결 과정을 기록합니다."
                en="Practical problem-solving notes on macOS automation, AI product development, deployment, and operations."
              />
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
        <div className="mb-10">
          <BlogAuthorBio compact />
        </div>
        {posts.length > 0 ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-border/70 bg-card hover:border-foreground/30 rounded-lg border p-5 transition-colors"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        <time dateTime={post.date}>{post.date}</time>
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">{post.title}</h2>
                    </div>
                    <ArrowUpRight
                      className="mt-1 hidden shrink-0 sm:block"
                      size={20}
                    />
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
          <p className="text-muted-foreground">
            <LocalizedText
              ko="아직 공개된 포스트가 없습니다."
              en="No posts have been published yet."
            />
          </p>
        )}
      </section>
    </main>
  );
}
