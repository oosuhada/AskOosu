import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpenText, GitFork, Star } from 'lucide-react';
import { LocalizedText } from '@/components/localized-content';
import {
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { getAllPosts } from '@/lib/blog';
import type {
  GithubLanguageShare,
  GithubPortfolioRepository,
} from '@/lib/github-portfolio';
import { getIndexedGithubProjects } from '@/lib/rag/github-source';
import { oosuProjects } from '@/lib/oosu-profile';
import { createPageMetadata } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
  title: 'Oosu Projects',
  description:
    'Selected Oosu projects including AskOosu, Aigram, Sticks & Stones, Portfoli-Oh, and learning/product experiments.',
  path: '/projects',
  keywords: ['Oosu projects', 'AskOosu project', 'RAG portfolio project'],
});

const projectDescriptionsKo: Record<string, string> = {
  'AskOosu 2026':
    'Mac mini 홈 서버에 배포한 대화형 AI 포트폴리오입니다. Next.js, FAQ 라우팅, Notion RAG, PostgreSQL 기반 근거를 연결해 프로젝트와 기술에 답합니다.',
  Aigram:
    '피드, 팔로우, 댓글, 백엔드 API 흐름을 구현한 풀스택 SNS 프로젝트입니다.',
  'Sticks & Stones Homepage':
    '기존 WordPress 사이트를 TypeScript와 Vite 기반으로 이전·리뉴얼한 실제 기업 홈페이지 프로젝트입니다.',
  'Portfoli-Oh! 2025':
    '인터랙션, 모션, UI/UX 실험을 통해 프로젝트와 이야기를 보여주는 2025년 프론트엔드 포트폴리오입니다.',
  Pylingo:
    '기초 문법부터 응용 문제까지 브라우저에서 실습하는 인터랙티브 Python 학습 웹 앱입니다.',
  Javalingo:
    '객체지향 개념과 코딩 테스트 학습을 단계별로 구성한 Java 학습 웹 앱입니다.',
};

export default async function ProjectsPage() {
  const [githubRepositories, blogPosts] = await Promise.all([
    getIndexedGithubProjects(12),
    getAllPosts(),
  ]);

  return (
    <PublicPageShell
      eyebrow={{ ko: '프로젝트', en: 'Projects' }}
      title={{
        ko: '주요 제품·개발 프로젝트',
        en: 'Selected Product and Engineering Projects',
      }}
      summary={{
        ko: '장우수의 대표 프로젝트를 검증 가능한 설명과 공개 링크 중심으로 정리했습니다.',
        en: 'A concise public index of Oosu’s representative projects, with grounded descriptions and links where public links are available.',
      }}
    >
      <TextSection title={{ ko: '대표 프로젝트', en: 'Featured Projects' }}>
        <div className="grid gap-4">
          {oosuProjects.slice(0, 6).map((project) => (
            <article
              key={project.title}
              className="border-border/70 bg-card rounded-lg border p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{project.title}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {project.category} · {project.date}
                  </p>
                </div>
                {project.title === 'AskOosu 2026' ? (
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-semibold underline"
                    href="/projects/askoosu"
                  >
                    <LocalizedText ko="상세 보기" en="Details" />
                    <ArrowUpRight size={14} />
                  </Link>
                ) : project.links[0] ? (
                  <a
                    className="inline-flex items-center gap-1 text-sm font-semibold underline"
                    href={project.links[0].url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <LocalizedText ko="방문하기" en="Visit" />
                    <ArrowUpRight size={14} />
                  </a>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-4 leading-7">
                <LocalizedText
                  ko={
                    projectDescriptionsKo[project.title] ?? project.description
                  }
                  en={project.description}
                />
              </p>
            </article>
          ))}
        </div>
      </TextSection>

      <TextSection
        title={{ ko: 'GitHub 최신 프로젝트', en: 'Latest from GitHub' }}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground max-w-3xl leading-7">
            <LocalizedText
              ko="공개 GitHub 저장소를 자동으로 읽어 생성일이 가장 최신인 프로젝트부터 보여줍니다. 각 카드의 언어 비율은 GitHub Linguist 통계의 byte 비율이며, README에 실제 이미지가 있으면 배지 이미지를 제외하고 함께 표시합니다."
              en="Public GitHub repositories are refreshed automatically and ordered newest-first by repository creation date. Language shares use GitHub Linguist byte totals, and meaningful README images are shown when available while badge-style images are filtered out."
            />
          </p>
          <a
            href="https://github.com/oosuhada?tab=repositories"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold underline"
          >
            <LocalizedText ko="GitHub 전체 보기" en="View all on GitHub" />
            <ArrowUpRight size={14} />
          </a>
        </div>

        {githubRepositories.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {githubRepositories.map((repository) => (
              <GithubRepositoryCard
                key={repository.fullName}
                repository={repository}
              />
            ))}
          </div>
        ) : (
          <div className="border-border/70 bg-card text-muted-foreground rounded-lg border p-5">
            <LocalizedText
              ko="현재 GitHub 데이터를 불러오지 못했습니다. 기존 대표 프로젝트는 계속 표시됩니다."
              en="GitHub data is temporarily unavailable. The curated featured projects above remain available."
            />
          </div>
        )}
      </TextSection>

      <TextSection title={{ ko: '최근 글', en: 'Latest Writing' }}>
        <div className="grid gap-4 md:grid-cols-3">
          {blogPosts.slice(0, 6).map((post) => (
            <article
              key={post.slug}
              className="border-border/70 bg-card flex h-full flex-col rounded-lg border p-5"
            >
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <BookOpenText size={14} />
                <time dateTime={post.date}>{post.date}</time>
              </div>
              <h2 className="mt-3 text-lg leading-snug font-bold">
                {post.title}
              </h2>
              <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-6">
                {post.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted rounded-full px-2 py-1 text-[11px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold underline"
              >
                <LocalizedText ko="글 읽기" en="Read article" />
                <ArrowUpRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </TextSection>
    </PublicPageShell>
  );
}

function GithubRepositoryCard({
  repository,
}: {
  repository: GithubPortfolioRepository;
}) {
  const primaryImage = repository.readmeImages[0];

  return (
    <article className="border-border/70 bg-card overflow-hidden rounded-xl border">
      {primaryImage ? (
        <a
          href={repository.url}
          target="_blank"
          rel="noreferrer"
          className="bg-muted block aspect-[16/9] overflow-hidden border-b"
        >
          {/* README images can be hosted on GitHub or on a project-owned CDN. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryImage.url}
            alt={primaryImage.alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
        </a>
      ) : null}

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold">{repository.name}</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              <LocalizedText ko="생성" en="Created" />{' '}
              {formatGithubDate(repository.createdAt)}
            </p>
          </div>
          <div className="text-muted-foreground flex shrink-0 items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1">
              <Star size={13} /> {repository.stars}
            </span>
            <span className="inline-flex items-center gap-1">
              <GitFork size={13} /> {repository.forks}
            </span>
          </div>
        </div>

        {repository.description ? (
          <p className="text-muted-foreground mt-4 line-clamp-3 leading-6">
            {repository.description}
          </p>
        ) : null}

        <LanguageBreakdown languages={repository.languages} />

        {repository.topics.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {repository.topics.slice(0, 8).map((topic) => (
              <span
                key={topic}
                className="bg-muted rounded-full px-2 py-1 text-[11px] font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
          <a
            href={repository.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline"
          >
            GitHub <ArrowUpRight size={14} />
          </a>
          {repository.homepage ? (
            <a
              href={repository.homepage}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline"
            >
              <LocalizedText ko="라이브" en="Live" />
              <ArrowUpRight size={14} />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function LanguageBreakdown({
  languages,
}: {
  languages: GithubLanguageShare[];
}) {
  if (languages.length === 0) return null;
  const visibleLanguages = languages.filter(
    (language) => language.percentage >= 0.1
  );

  return (
    <div className="mt-5">
      <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
        <LocalizedText ko="언어 비율" en="Language share" />
      </div>
      <div
        className="bg-muted flex h-2 overflow-hidden rounded-full"
        aria-label={visibleLanguages
          .map((language) => `${language.name} ${language.percentage}%`)
          .join(', ')}
      >
        {visibleLanguages.map((language, index) => (
          <span
            key={language.name}
            className="border-background/60 h-full border-r last:border-r-0"
            style={{
              width: `${Math.max(language.percentage, 0.5)}%`,
              backgroundColor: languageBarColor(index),
            }}
            title={`${language.name} ${language.percentage}%`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {visibleLanguages.map((language) => (
          <span key={language.name} className="text-muted-foreground">
            <strong className="text-foreground font-semibold">
              {language.name}
            </strong>{' '}
            {formatPercentage(language.percentage)}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatPercentage(value: number) {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
}

function formatGithubDate(value: string) {
  return value.slice(0, 10);
}

function languageBarColor(index: number) {
  const palette = [
    'hsl(173 58% 39%)',
    'hsl(217 91% 60%)',
    'hsl(262 83% 66%)',
    'hsl(38 92% 50%)',
    'hsl(347 77% 60%)',
    'hsl(199 89% 48%)',
  ];
  return palette[index % palette.length];
}
