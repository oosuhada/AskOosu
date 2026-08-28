import Link from 'next/link';
import { LocalizedText } from '@/components/localized-content';

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className="border-border/60 border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-sm font-semibold">
            oosu.dev
          </Link>
          <nav
            aria-label="Blog navigation"
            className="flex items-center gap-3 text-sm"
          >
            <Link
              className="text-muted-foreground hover:text-foreground"
              href="/blog"
            >
              Blog
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground"
              href="/ask"
            >
              AskOosu
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground"
              href="/projects"
            >
              <LocalizedText ko="프로젝트" en="Projects" />
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-border/60 border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <LocalizedText
              ko="우수하다(oosuhada)의 개발 기록."
              en="Development notes by Jang Oosu (oosuhada)."
            />
          </p>
          <Link href="/" className="font-medium underline underline-offset-4">
            <LocalizedText
              ko="포트폴리오 보기 → oosu.dev"
              en="View portfolio → oosu.dev"
            />
          </Link>
        </div>
      </footer>
    </div>
  );
}
