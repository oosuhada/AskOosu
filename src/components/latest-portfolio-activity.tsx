'use client';

import { ArrowUpRight, BookOpenText, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDisplayPreferences } from '@/lib/use-display-preferences';

type PortfolioLanguage = {
  name: string;
  percentage: number;
};

type PortfolioRepository = {
  name: string;
  fullName: string;
  url: string;
  homepage: string | null;
  description: string | null;
  updatedAt: string;
  pushedAt: string;
  languages: PortfolioLanguage[];
  readmeImages: Array<{
    url: string;
    alt: string;
  }>;
};

type PortfolioPost = {
  title: string;
  date: string;
  description: string;
  slug: string;
  url: string;
};

type PortfolioResponse = {
  generatedAt: string;
  github: {
    repositories: PortfolioRepository[];
  };
  blog: {
    posts: PortfolioPost[];
  };
};

type ActivityItem =
  | {
      kind: 'repository';
      date: string;
      repository: PortfolioRepository;
    }
  | {
      kind: 'post';
      date: string;
      post: PortfolioPost;
    };

export function LatestPortfolioActivity() {
  const { language } = useDisplayPreferences();
  const [data, setData] = useState<PortfolioResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/portfolio', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Portfolio API ${response.status}`);
        return response.json() as Promise<PortfolioResponse>;
      })
      .then(setData)
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') {
          console.warn('Unable to load latest portfolio activity.', error);
        }
      });

    return () => controller.abort();
  }, []);

  const activities = useMemo(() => {
    if (!data) return [];

    const repositories: ActivityItem[] = data.github.repositories
      .slice(0, 4)
      .map((repository) => ({
        kind: 'repository',
        date: repository.pushedAt || repository.updatedAt,
        repository,
      }));
    const posts: ActivityItem[] = data.blog.posts.slice(0, 4).map((post) => ({
      kind: 'post',
      date: post.date,
      post,
    }));

    return [...repositories, ...posts]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 6);
  }, [data]);

  if (!data || activities.length === 0) return null;

  return (
    <section className="relative z-10 mt-24 w-full max-w-5xl px-1 pb-40 md:mt-14 md:px-4 md:pb-36">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
            {language === 'ko' ? '자동 업데이트' : 'Auto-updated'}
          </p>
          <h2 className="mt-1 text-xl font-bold md:text-2xl">
            {language === 'ko' ? '최근 활동' : 'Latest Activity'}
          </h2>
        </div>
        <div className="flex gap-3 text-sm font-semibold">
          <Link href="/projects" className="inline-flex items-center gap-1 underline">
            {language === 'ko' ? '프로젝트' : 'Projects'}
            <ArrowUpRight size={14} />
          </Link>
          <Link href="/blog" className="inline-flex items-center gap-1 underline">
            Blog <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {activities.map((activity) =>
          activity.kind === 'repository' ? (
            <RepositoryActivityCard
              key={`repo-${activity.repository.fullName}`}
              repository={activity.repository}
              language={language}
            />
          ) : (
            <PostActivityCard
              key={`post-${activity.post.slug}`}
              post={activity.post}
              language={language}
            />
          )
        )}
      </div>
    </section>
  );
}

function RepositoryActivityCard({
  repository,
  language,
}: {
  repository: PortfolioRepository;
  language: 'ko' | 'en';
}) {
  const image = repository.readmeImages[0];

  return (
    <a
      href={repository.homepage ?? repository.url}
      target="_blank"
      rel="noreferrer"
      className="bg-background/45 hover:bg-background/70 group overflow-hidden rounded-2xl border border-white/55 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/[0.07] dark:hover:bg-white/[0.11]"
    >
      {image ? (
        <div className="bg-muted aspect-[16/8] overflow-hidden border-b border-white/40 dark:border-white/10">
          {/* README media can be hosted on GitHub or a project-owned CDN. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : null}
      <div className="p-4">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <GitBranch size={13} />
          <span>GitHub</span>
          <span>·</span>
          <time dateTime={repository.updatedAt}>
            {formatDate(repository.updatedAt, language)}
          </time>
        </div>
        <h3 className="mt-2 truncate text-base font-bold">{repository.name}</h3>
        {repository.description ? (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-5">
            {repository.description}
          </p>
        ) : null}
        {repository.languages.length > 0 ? (
          <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs">
            {repository.languages.slice(0, 4).map((item) => (
              <span key={item.name}>
                {item.name} {item.percentage}%
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </a>
  );
}

function PostActivityCard({
  post,
  language,
}: {
  post: PortfolioPost;
  language: 'ko' | 'en';
}) {
  return (
    <Link
      href={post.url}
      className="bg-background/45 hover:bg-background/70 rounded-2xl border border-white/55 p-4 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/[0.07] dark:hover:bg-white/[0.11]"
    >
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <BookOpenText size={13} />
        <span>Blog</span>
        <span>·</span>
        <time dateTime={post.date}>{formatDate(post.date, language)}</time>
      </div>
      <h3 className="mt-2 line-clamp-2 text-base font-bold">{post.title}</h3>
      <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-5">
        {post.description}
      </p>
    </Link>
  );
}

function formatDate(value: string, language: 'ko' | 'en') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
