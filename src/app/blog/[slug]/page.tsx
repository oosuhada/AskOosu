import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { BlogCTA } from '@/components/blog/blog-cta';
import { CodeCopyEnhancer } from '@/components/blog/code-copy-enhancer';
import { getAllPosts, getPostBySlug, getRelatedPosts, mdxOptions } from '@/lib/blog';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post not found | oosu.dev',
    };
  }

  return {
    title: `${post.title} | oosu.dev`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://oosu.dev/blog/${post.slug}`,
      siteName: 'oosu.dev',
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://oosu.dev/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: 'Gabriel',
      url: 'https://oosu.dev',
    },
    publisher: {
      '@type': 'Person',
      name: 'Gabriel',
      url: 'https://oosu.dev',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://oosu.dev/blog/${post.slug}`,
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Blog
        </Link>
        <header className="mt-8 border-b pb-8">
          <p className="text-muted-foreground text-sm">
            <time dateTime={post.date}>{post.date}</time>
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-bold sm:text-5xl">
            {post.title}
          </h1>
          <p className="text-muted-foreground mt-5 text-lg leading-8">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>
        <div className="blog-prose prose mt-10">
          <MDXRemote
            source={post.body}
            options={mdxOptions}
            components={{
              BlogCTA,
            }}
          />
          <CodeCopyEnhancer />
        </div>
        {relatedPosts.length > 0 ? (
          <section className="border-border mt-14 border-t pt-8">
            <h2 className="text-2xl font-bold">관련 포스트</h2>
            <div className="mt-5 grid gap-3">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="border-border/70 hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                >
                  <span className="text-muted-foreground text-sm">
                    {relatedPost.date}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-3 font-semibold">
                    {relatedPost.title}
                    <ArrowUpRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
