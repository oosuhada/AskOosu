import Link from 'next/link';
import { blogAuthor } from '@/lib/blog-author';

export function BlogAuthorByline() {
  return (
    <span>
      작성자{' '}
      <Link
        href="/about"
        rel="author"
        className="text-foreground font-semibold underline-offset-4 hover:underline"
      >
        {blogAuthor.displayName}
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
        Author
      </p>
      <h2
        id={compact ? 'blog-author-heading' : 'post-author-heading'}
        className="mt-2 text-xl font-bold"
      >
        작성자 소개
      </h2>
      <p className="text-muted-foreground mt-3 leading-7">
        <Link
          href="/about"
          rel="author"
          className="text-foreground font-semibold underline-offset-4 hover:underline"
        >
          {blogAuthor.displayName}
        </Link>
        라는 이름으로 활동하는 AI·풀스택 개발자 장우수의 블로그입니다.
      </p>
    </section>
  );
}
