import Link from 'next/link';
import { LocalizedText } from '@/components/localized-content';
import { blogAuthor } from '@/lib/blog-author';

export function BlogAuthorByline() {
  return (
    <span>
      <LocalizedText ko="작성자" en="Author" />{' '}
      <Link
        href="/about"
        rel="author"
        className="text-foreground font-semibold underline-offset-4 hover:underline"
      >
        <LocalizedText ko={blogAuthor.displayName} en="Jang Oosu (oosuhada)" />
      </Link>
    </span>
  );
}

export function BlogAuthorBio({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-labelledby={compact ? 'blog-author-heading' : 'post-author-heading'}
      className="border-border/70 bg-card rounded-lg border p-5 sm:p-6"
    >
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
        <LocalizedText ko="작성자" en="Author" />
      </p>
      <h2
        id={compact ? 'blog-author-heading' : 'post-author-heading'}
        className="mt-2 text-xl font-bold"
      >
        <LocalizedText ko="작성자 소개" en="About the author" />
      </h2>
      <p className="text-muted-foreground mt-3 leading-7">
        <span className="lang-ko" lang="ko">
          <Link
            href="/about"
            rel="author"
            className="text-foreground font-semibold underline-offset-4 hover:underline"
          >
            {blogAuthor.displayName}
          </Link>
          라는 이름으로 활동하는 AI·풀스택 개발자 장우수의 블로그입니다.
        </span>
        <span className="lang-en" lang="en">
          This is the blog of Jang Oosu, an AI-connected fullstack developer
          working as{' '}
          <Link
            href="/about"
            rel="author"
            className="text-foreground font-semibold underline-offset-4 hover:underline"
          >
            oosuhada
          </Link>
          .
        </span>
      </p>
    </section>
  );
}
