import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type PublicPageShellProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: React.ReactNode;
};

export function PublicPageShell({
  eyebrow,
  title,
  summary,
  children,
}: PublicPageShellProps) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className="border-border/60 border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-sm font-semibold">
            Oosu.dev
          </Link>
          <nav
            aria-label="Public pages"
            className="flex items-center gap-3 text-sm"
          >
            <Link className="text-muted-foreground hover:text-foreground" href="/ask">
              AskOosu
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground"
              href="/projects"
            >
              Projects
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground"
              href="/faq/ai-competitiveness"
            >
              FAQ
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.16em]">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-bold sm:text-6xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-3xl text-lg leading-8">
            {summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="bg-foreground text-background inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            >
              Ask Oosu
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/projects/askoosu"
              className="border-border hover:bg-muted inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors"
            >
              View AskOosu project
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <div className="mx-auto w-full max-w-5xl px-5 pb-20">{children}</div>
      </main>
    </div>
  );
}

export function TextSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border/60 border-t py-10">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="text-muted-foreground mt-5 space-y-4 text-base leading-7">
        {children}
      </div>
    </section>
  );
}

export function FaqList({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <div className="mt-6 grid gap-4">
      {items.map((item) => (
        <article
          key={item.question}
          className="border-border/70 bg-card rounded-lg border p-5"
        >
          <h3 className="text-lg font-semibold">{item.question}</h3>
          <p className="text-muted-foreground mt-3 leading-7">{item.answer}</p>
        </article>
      ))}
    </div>
  );
}
