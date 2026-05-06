'use client';

import Image from 'next/image';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMemo, useState } from 'react';
import { oosuProfile } from '@/lib/oosu-profile';
import { cn } from '@/lib/utils';
import { isAskOosuDebugUiEnabled } from '@/lib/debug-ui';
import type { QuestionSurface } from '@/data/question-surfaces.shared';
import {
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  Code2,
  ExternalLink,
  Github,
  Goal,
  Globe2,
  Layers3,
  Linkedin,
  Mail,
  MapPin,
  MessageSquareText,
  Rocket,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

type RichAnswerPart =
  | {
      type: 'markdown';
      contentKey?: string;
      content?: string;
    }
  | {
      type: 'component';
      component?: string;
      dataKey?: string;
      blockType?: string;
    }
  | {
      type: 'sourceBadges';
      sourceChunkIds?: string[];
    };

type VisualBlock = {
  type: string;
  title?: string;
  dataKey?: string;
  items: unknown[];
};

type MediaRef = {
  assetKey: string;
  kind: string;
  src: string;
  mobileSrc?: string;
  alt: string;
  caption?: string;
  status: 'ready' | 'todo' | 'optional';
};

type RichPayload = {
  language: 'ko' | 'en';
  badge?: string;
  todoBadge?: string;
  renderSpecKey?: string;
  richAnswerData?: unknown;
  answerParts: RichAnswerPart[];
  visualBlocks: VisualBlock[];
  mediaRefs: MediaRef[];
  sourceChunkIds: string[];
  hasCanonicalEvidence: boolean;
};

type ProjectItem = {
  id: string;
  title: string;
  label?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  tags: string[];
  href?: string;
};

type SkillGroup = {
  group: string;
  skills: SkillItem[];
  evidence: string[];
};

type SkillItem = {
  name: string;
  proficiency?: string;
};

type ContactAction = {
  label: string;
  href: string;
  kind?: string;
};

type DiagramStep = {
  title: string;
  description?: string;
};

type ComparisonTable = {
  leftTitle: string;
  rightTitle: string;
  rows: ComparisonRow[];
};

type ComparisonRow = {
  label: string;
  left: string;
  right: string;
};

export function RichAnswerRenderer({
  metadata,
  markdownContent,
}: {
  metadata?: unknown;
  markdownContent: string;
}) {
  const payload = parseRichPayload(metadata);
  if (!payload) return null;

  const parts = normalizeAnswerPartsForDisplay(
    payload.answerParts.length > 0
      ? payload.answerParts
      : buildFallbackParts(payload)
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2">
        {payload.badge && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-700/70 dark:bg-emerald-950/30 dark:text-emerald-200">
            <BookOpenCheck className="h-3.5 w-3.5" />
            {payload.badge}
          </span>
        )}
        {payload.todoBadge && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-700/70 dark:bg-amber-950/30 dark:text-amber-200">
            {payload.todoBadge}
          </span>
        )}
      </div>

      {parts.map((part, index) =>
        renderPart({
          part,
          index,
          payload,
          markdownContent,
        })
      )}
    </div>
  );
}

export function hasRichAnswerPayload(metadata: unknown) {
  if (!isRecord(metadata)) return false;
  const richAnswerData = isRecord(metadata.richAnswerData)
    ? metadata.richAnswerData
    : null;

  return (
    Array.isArray(metadata.answerParts) ||
    Array.isArray(metadata.visualBlocks) ||
    Array.isArray(richAnswerData?.visualBlocks)
  );
}

function renderPart({
  part,
  index,
  payload,
  markdownContent,
}: {
  part: RichAnswerPart;
  index: number;
  payload: RichPayload;
  markdownContent: string;
}) {
  if (part.type === 'markdown') {
    const content = sanitizeRichMarkdownContent(part.content ?? markdownContent);
    if (!content.trim()) return null;

    return <MarkdownBlock key={`markdown-${index}`} content={content} />;
  }

  if (part.type === 'sourceBadges') {
    return (
      <SourceBadgeList
        key={`sources-${index}`}
        sourceChunkIds={part.sourceChunkIds ?? payload.sourceChunkIds}
        language={payload.language}
        showPublicSources={!payload.hasCanonicalEvidence}
      />
    );
  }

  const block = findVisualBlock(part, payload.visualBlocks);
  if (!block) return null;

  if (block.type === 'projectCards') {
    return (
      <ProjectShowcaseCards
        key={`${block.type}-${index}`}
        block={block}
        mediaRefs={payload.mediaRefs}
        language={payload.language}
      />
    );
  }

  if (block.type === 'skillChips') {
    return (
      <SkillChipGroup
        key={`${block.type}-${index}`}
        block={block}
        language={payload.language}
      />
    );
  }

  if (block.type === 'contactCard') {
    return (
      <ContactCard
        key={`${block.type}-${index}`}
        block={block}
        mediaRefs={payload.mediaRefs}
        language={payload.language}
      />
    );
  }

  if (block.type === 'ctaButtons') {
    return <CtaButtons key={`${block.type}-${index}`} block={block} />;
  }

  if (block.type === 'sourceBadges') {
    return (
      <SourceBadgeList
        key={`${block.type}-${index}`}
        sourceChunkIds={payload.sourceChunkIds}
        language={payload.language}
        showPublicSources={!payload.hasCanonicalEvidence}
      />
    );
  }

  if (block.type === 'imageCard') {
    return (
      <ImageFallbackCards
        key={`${block.type}-${index}`}
        block={block}
        mediaRefs={payload.mediaRefs}
        language={payload.language}
      />
    );
  }

  if (block.type === 'statelessDiagram' || block.type === 'timeline') {
    return <WorkflowSteps key={`${block.type}-${index}`} block={block} />;
  }

  if (block.type === 'comparisonTable') {
    return (
      <ComparisonGrid
        key={`${block.type}-${index}`}
        block={block}
        language={payload.language}
      />
    );
  }

  if (block.type === 'profileCard') {
    return (
      <ProfileHeroCard
        key={`${block.type}-${index}`}
        language={payload.language}
      />
    );
  }

  return null;
}

function MarkdownBlock({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert w-full max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="break-words whitespace-pre-wrap">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 list-disc pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal pl-6">{children}</ol>
          ),
          li: ({ children }) => <li className="my-1">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-300"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

function sanitizeRichMarkdownContent(content: string) {
  const hiddenPublicPolicyLines = new Set([
    '비공개 레포, 준비되지 않은 이력서 링크, 사적인 주소 같은 정보는 공개하지 않고, 공개 가능한 프로젝트/연락/협업 맥락만 정리합니다.',
    '지금 화면에서는 공개된 연락 채널과 협업에 바로 이어질 수 있는 프로젝트 맥락만 깔끔하게 정리합니다.',
    'Private repositories, unprepared resume links, and personal addresses stay out of the public portfolio response.',
    'This view keeps the focus on public contact channels and project context that can lead into a practical collaboration conversation.',
  ]);

  return content
    .split('\n')
    .filter((line) => !hiddenPublicPolicyLines.has(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function ProjectShowcaseCards({
  block,
  mediaRefs,
  language,
}: {
  block: VisualBlock;
  mediaRefs: MediaRef[];
  language: 'ko' | 'en';
}) {
  const projects = block.items.map(parseProjectItem).filter(isDefined);
  if (projects.length === 0) return null;
  const isMoreProjectsRail =
    block.dataKey === 'projects.more' ||
    block.title?.toLowerCase().includes('more project');

  return (
    <section className="space-y-2" aria-label={block.title ?? 'Projects'}>
      <div className="flex items-center justify-between gap-3">
        {block.title && (
          <h3 className="min-w-0 text-sm font-semibold tracking-normal">
            {block.title}
          </h3>
        )}
        {isMoreProjectsRail && (
          <span className="text-muted-foreground shrink-0 text-xs">
            {language === 'ko' ? '좌우로 더 보기' : 'Scroll for more'}
          </span>
        )}
      </div>
      <div
        className={
          isMoreProjectsRail
            ? 'flex snap-x gap-3 overflow-x-auto pb-2'
            : 'grid grid-cols-1 gap-3 md:grid-cols-3'
        }
      >
        {projects.map((project) => (
          <article
            key={project.id}
            className={cn(
              'group overflow-hidden rounded-lg border bg-slate-950 text-white shadow-sm dark:border-white/10 dark:bg-slate-950',
              isMoreProjectsRail && 'w-[18rem] shrink-0 snap-start'
            )}
          >
            <MediaPreview
              assetKey={project.image}
              mediaRefs={mediaRefs}
              className={
                isMoreProjectsRail ? 'aspect-[4/3]' : 'aspect-[16/10]'
              }
              language={language}
            />
            <div className="space-y-3 p-3">
              <div className="space-y-1">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <span className="inline-flex max-w-full min-w-0 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/75">
                    <span className="min-w-0 truncate">
                      {project.label ?? project.subtitle ?? project.id}
                    </span>
                  </span>
                </div>
                <h4 className="min-w-0 text-lg font-semibold tracking-normal break-words">
                  {project.title}
                </h4>
                {project.subtitle && (
                  <p className="text-xs leading-relaxed text-white/65">
                    {project.subtitle}
                  </p>
                )}
              </div>
              {project.description && (
                <p className="line-clamp-3 text-xs leading-relaxed text-white/72">
                  {project.description}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex max-w-full min-w-0 rounded-md border border-white/10 bg-white/[0.07] px-2 py-0.5 text-[11px] text-white/78"
                  >
                    <span className="min-w-0 truncate">{tag}</span>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {surfaceForProject(project.id) && (
                  <button
                    type="button"
                    onClick={() => switchQuestionSurface(project.id)}
                    className="inline-flex h-8 max-w-full min-w-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 text-xs font-medium text-white/85 transition hover:bg-white/15 hover:text-white"
                  >
                    <MessageSquareText className="h-3.5 w-3.5" />
                    <span className="min-w-0 truncate">
                      {language === 'ko' ? '관련 질문' : 'Questions'}
                    </span>
                  </button>
                )}
                {project.href && (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 max-w-full min-w-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 text-xs font-medium text-white/85 transition hover:bg-white/15 hover:text-white"
                  >
                    <span className="min-w-0 truncate">
                      {language === 'ko' ? '열기' : 'Open'}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComparisonGrid({
  block,
  language,
}: {
  block: VisualBlock;
  language: 'ko' | 'en';
}) {
  const tables = block.items.map(parseComparisonTable).filter(isDefined);
  if (tables.length === 0) return null;

  return (
    <section className="space-y-2" aria-label={block.title ?? 'Comparison'}>
      {block.title && (
        <h3 className="text-sm font-semibold tracking-normal">{block.title}</h3>
      )}
      <div className="space-y-3">
        {tables.map((table, tableIndex) => (
          <div
            key={`${table.leftTitle}-${table.rightTitle}-${tableIndex}`}
            className="overflow-hidden rounded-lg border bg-white/70 dark:bg-white/[0.05]"
          >
            <div className="grid grid-cols-[0.72fr_1fr_1fr] border-b bg-slate-50 text-xs font-semibold dark:bg-slate-900/40">
              <div className="px-3 py-2 text-slate-500 dark:text-slate-400">
                {language === 'ko' ? '기준' : 'Criteria'}
              </div>
              <div className="min-w-0 truncate border-l px-3 py-2">
                {table.leftTitle}
              </div>
              <div className="min-w-0 truncate border-l px-3 py-2">
                {table.rightTitle}
              </div>
            </div>
            {table.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[0.72fr_1fr_1fr] border-b last:border-b-0"
              >
                <div className="min-w-0 bg-slate-50/70 px-3 py-2 text-xs font-medium break-words text-slate-600 dark:bg-slate-900/25 dark:text-slate-300">
                  {row.label}
                </div>
                <div className="min-w-0 border-l px-3 py-2 text-xs leading-relaxed break-words">
                  {row.left}
                </div>
                <div className="min-w-0 border-l px-3 py-2 text-xs leading-relaxed break-words">
                  {row.right}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function SkillChipGroup({
  block,
  language,
}: {
  block: VisualBlock;
  language: 'ko' | 'en';
}) {
  const skillGroups = block.items.map(parseSkillGroup).filter(isDefined);
  if (skillGroups.length === 0) return null;

  return (
    <section className="space-y-3" aria-label={block.title ?? 'Skills'}>
      {block.title && (
        <h3 className="text-sm font-semibold tracking-normal">{block.title}</h3>
      )}
      <div className="space-y-4">
        {skillGroups.map((group) => (
          <div
            key={group.group}
            className="rounded-lg border bg-white/80 p-3 shadow-sm dark:bg-white/[0.05]"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-slate-950 p-1.5 text-white dark:bg-white dark:text-slate-950">
                <Code2 className="h-4 w-4" />
              </div>
              <h4 className="min-w-0 text-base font-semibold tracking-normal break-words">
                {group.group}
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span
                  key={`${group.group}-${skill.name}`}
                  className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-lg border border-slate-950 bg-slate-950 px-3 py-1.5 text-sm text-white shadow-sm dark:border-white/15 dark:bg-white/10"
                >
                  <span className="min-w-0 truncate">{skill.name}</span>
                  {skill.proficiency && (
                    <span className="shrink-0 rounded-md bg-white/12 px-1.5 py-0.5 text-[10px] text-white/70">
                      {skill.proficiency}
                    </span>
                  )}
                </span>
              ))}
            </div>
            {group.evidence.length > 0 && (
              <div className="text-muted-foreground mt-3 space-y-1.5 text-xs leading-relaxed">
                <p className="font-medium text-slate-600 dark:text-slate-300">
                  {language === 'ko' ? '사용 맥락' : 'Used in context'}
                </p>
                <ul className="space-y-1">
                  {group.evidence.map((evidence) => (
                    <li key={evidence} className="break-words">
                      {evidence}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactCard({
  block,
  mediaRefs,
  language,
}: {
  block: VisualBlock;
  mediaRefs: MediaRef[];
  language: 'ko' | 'en';
}) {
  const actions = block.items.map(parseContactAction).filter(isDefined);

  return (
    <section className="rounded-lg border bg-slate-50 p-4 shadow-sm dark:bg-white/[0.05]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-full border bg-white shadow-sm dark:bg-slate-900">
            <MediaPreview
              assetKey="profile.oosu.portrait"
              mediaRefs={mediaRefs}
              className="h-full w-full"
              compact
              language={language}
            />
          </div>
          <div className="min-w-0">
            <h3 className="min-w-0 text-xl font-bold tracking-normal break-words">
              {oosuProfile.name}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'ko'
                ? '공개 협업 브리프'
                : 'Public Collaboration Brief'}
            </p>
          </div>
        </div>
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {language === 'ko' ? 'Open' : 'Open'}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <ContactBriefItem
          icon={CalendarDays}
          title={language === 'ko' ? 'Mode' : 'Mode'}
          text={
            language === 'ko'
              ? '프로젝트/협업 대화 열려 있음'
              : 'Open to project and collaboration conversations'
          }
        />
        <ContactBriefItem
          icon={Globe2}
          title={language === 'ko' ? 'Location' : 'Location'}
          text={oosuProfile.location}
        />
        <ContactBriefItem
          icon={Layers3}
          title={language === 'ko' ? 'Good fit' : 'Good fit'}
          text={
            language === 'ko'
              ? 'AI 웹 제품, RAG/검색 UX, 풀스택 프로토타입'
              : 'AI web products, RAG/search UX, fullstack prototypes'
          }
        />
        <ContactBriefItem
          icon={Rocket}
          title={language === 'ko' ? 'Stack' : 'Stack'}
          text="Next.js, TypeScript, Spring Boot, PostgreSQL, RAG"
        />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            {language === 'ko' ? 'What I bring' : 'What I bring'}
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {language === 'ko'
              ? '아이디어를 실제 화면, API, 데이터, AI 답변 흐름까지 끌고 가는 연결력이 강점입니다. 빠르게 만들되, 근거 없는 수치나 비공개 정보는 말하지 않는 쪽으로 제품 감각을 맞춥니다.'
              : 'I connect ideas into screens, APIs, data flows, and AI answer experiences. I like shipping quickly, while keeping unsupported metrics and private information out of the story.'}
          </p>
        </div>
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Goal className="h-4 w-4" />
            {language === 'ko' ? 'Goal' : 'Goal'}
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {language === 'ko'
              ? '사용자가 실제로 쓰고 이해할 수 있는 AI-connected 제품을 더 많이 만들고 싶습니다. 재미는 챙기되, 결과물은 작동하게 만드는 쪽으로요.'
              : 'I want to build more AI-connected products that people can actually use and understand: playful where it helps, but working where it matters.'}
          </p>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="mt-3">
          <CtaButtons
            block={{ ...block, type: 'ctaButtons', items: actions }}
          />
        </div>
      )}
    </section>
  );
}

function ContactBriefItem({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="flex min-w-0 gap-3 rounded-lg border bg-white p-3 dark:bg-slate-950/40">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-700 dark:text-slate-200" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm leading-5 break-words">
          {text}
        </p>
      </div>
    </div>
  );
}

function CtaButtons({ block }: { block: VisualBlock }) {
  const actions = block.items.map(parseContactAction).filter(isDefined);
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = iconForAction(action.kind ?? action.label);

        return (
          <a
            key={`${action.label}-${action.href}`}
            href={action.href}
            target={action.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={
              action.href.startsWith('mailto:')
                ? undefined
                : 'noopener noreferrer'
            }
            className="bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 max-w-full min-w-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">{action.label}</span>
          </a>
        );
      })}
    </div>
  );
}

function WorkflowSteps({ block }: { block: VisualBlock }) {
  const steps = block.items.map(parseDiagramStep).filter(isDefined);
  if (steps.length === 0) return null;

  return (
    <section className="space-y-2" aria-label={block.title ?? 'Workflow'}>
      {block.title && (
        <h3 className="text-sm font-semibold tracking-normal">{block.title}</h3>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={`${step.title}-${index}`}
            className="rounded-lg border bg-indigo-50/70 p-3 dark:bg-indigo-950/20"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-xs font-semibold text-white dark:bg-indigo-500">
                {index + 1}
              </span>
              <h4 className="min-w-0 text-sm font-semibold break-words">
                {step.title}
              </h4>
            </div>
            {step.description && (
              <p className="text-muted-foreground text-xs leading-relaxed">
                {step.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ImageFallbackCards({
  block,
  mediaRefs,
  language,
}: {
  block: VisualBlock;
  mediaRefs: MediaRef[];
  language: 'ko' | 'en';
}) {
  const imageItems = block.items
    .map((item) => (isRecord(item) ? item : null))
    .filter(isDefined);
  if (imageItems.length === 0) return null;

  return (
    <section className="space-y-2" aria-label={block.title ?? 'Images'}>
      {block.title && (
        <h3 className="text-sm font-semibold tracking-normal">{block.title}</h3>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {imageItems.map((item, index) => {
          const assetKey = parseString(item.image);
          const media = assetKey ? findMediaRef(mediaRefs, assetKey) : null;
          const caption = parseString(item.caption) ?? media?.caption;

          return (
            <div
              key={`${assetKey ?? 'image'}-${index}`}
              className="overflow-hidden rounded-lg border bg-white/70 dark:bg-white/[0.05]"
            >
              <MediaPreview
                assetKey={assetKey ?? undefined}
                mediaRefs={mediaRefs}
                language={language}
              />
              <p className="text-muted-foreground p-3 text-xs leading-relaxed">
                {media?.status === 'ready'
                  ? caption
                  : language === 'ko'
                    ? '미리보기 준비 중'
                    : 'Preview asset pending'}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProfileHeroCard({ language }: { language: 'ko' | 'en' }) {
  return (
    <section className="overflow-hidden rounded-lg border bg-white/80 shadow-sm dark:bg-white/[0.05]">
      <div className="grid gap-4 p-4 md:grid-cols-[0.95fr_1.15fr] md:items-center">
        <div className="overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-900">
          <Image
            src="/images/profile/oosu-profile-slow.gif"
            alt="Oosu profile portrait"
            width={432}
            height={572}
            unoptimized
            className="aspect-[4/3] h-full w-full object-contain object-bottom md:aspect-[5/4]"
            sizes="(min-width: 768px) 360px, calc(100vw - 3rem)"
          />
        </div>
        <div className="min-w-0 space-y-3">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-normal break-words md:text-3xl">
              {oosuProfile.name}
            </h3>
            <p className="text-muted-foreground text-base">
              {oosuProfile.title}
            </p>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              {oosuProfile.location}
            </p>
          </div>

          <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
            {language === 'ko'
              ? '안녕하세요. 우수는 화면만 예쁘게 만드는 데서 멈추지 않고, API, 데이터, RAG, 배포까지 이어 붙여 실제로 굴러가는 흐름을 만들고 싶어하는 개발자입니다.'
              : 'Hi, I am Oosu: a developer who does not want to stop at a nice screen. I like connecting UI, APIs, data, RAG, and deployment into something that actually runs.'}
          </p>
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
            {language === 'ko'
              ? 'AskOosu는 그 성향을 그대로 담은 작은 실험실이에요. 포트폴리오가 스스로 질문을 받고, Wiki 근거를 찾아, 카드와 답변으로 보여주게 만들고 있습니다.'
              : 'AskOosu is that tendency turned into a small lab: the portfolio takes questions, checks Wiki evidence, and turns the answer into cards and conversation.'}
          </p>
        </div>
      </div>
      <div className="border-t px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {['Frontend', 'Fullstack', 'AI/RAG', 'UX', 'Business'].map((tag) => (
            <span
              key={tag}
              className="bg-background text-muted-foreground rounded-lg border px-2.5 py-1 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function MediaPreview({
  assetKey,
  mediaRefs,
  className,
  compact = false,
  preferMobile = false,
  language,
}: {
  assetKey?: string;
  mediaRefs: MediaRef[];
  className?: string;
  compact?: boolean;
  preferMobile?: boolean;
  language: 'ko' | 'en';
}) {
  const media = assetKey ? findMediaRef(mediaRefs, assetKey) : null;
  const canRenderImage =
    media?.status === 'ready' && media.src && media.src !== 'TODO_ASSET';

  if (canRenderImage) {
    const mobileSrc =
      media.mobileSrc && media.mobileSrc !== 'TODO_ASSET'
        ? media.mobileSrc
        : null;

    return (
      <div
        className={cn(
          'relative overflow-hidden bg-slate-100 dark:bg-slate-900',
          compact ? 'h-full w-full' : 'aspect-[16/9]',
          className
        )}
      >
        {preferMobile && mobileSrc ? (
          <Image
            src={mobileSrc}
            alt={media.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : mobileSrc ? (
          <>
            <Image
              src={mobileSrc}
              alt={media.alt}
              fill
              sizes="(max-width: 640px) 100vw, 0px"
              className="object-cover sm:hidden"
            />
            <Image
              src={media.src}
              alt={media.alt}
              fill
              sizes="(max-width: 640px) 0px, 50vw"
              className="hidden object-cover sm:block"
            />
          </>
        ) : (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'text-muted-foreground flex items-center justify-center bg-[linear-gradient(135deg,rgba(15,23,42,0.08),rgba(14,165,233,0.10),rgba(16,185,129,0.10))] p-3 text-center text-xs dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(14,165,233,0.10),rgba(16,185,129,0.08))]',
        compact ? 'h-full w-full' : 'aspect-[16/9]',
        className
      )}
    >
      <span>{getPendingAssetLabel(language, compact)}</span>
    </div>
  );
}

function SourceBadgeList({
  sourceChunkIds,
  language,
  showPublicSources,
}: {
  sourceChunkIds: string[];
  language: 'ko' | 'en';
  showPublicSources: boolean;
}) {
  const isDebugMode = useMemo(isAskOosuDebugUiEnabled, []);
  const [isExpanded, setIsExpanded] = useState(false);

  if (sourceChunkIds.length === 0) return null;

  const copy = getSourceBadgeCopy(language);

  if (!isDebugMode && !showPublicSources) return null;

  return (
    <div
      className="space-y-2"
      aria-label={isDebugMode ? copy.debugAriaLabel : copy.publicAriaLabel}
    >
      <button
        type="button"
        className={cn(
          'focus-visible:ring-ring/50 inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium outline-none focus-visible:ring-[3px]',
          isDebugMode
            ? 'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700/70 dark:bg-violet-950/30 dark:text-violet-200'
            : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((current) => !current)}
      >
        <BookOpenCheck className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 truncate">
          {isExpanded ? copy.hideSources : copy.viewSources}
        </span>
        <span className="bg-background/80 rounded-md px-1.5 py-0.5 text-[10px]">
          {sourceChunkIds.length}
        </span>
      </button>

      {isExpanded && (
        <div className="flex flex-wrap gap-2">
          {sourceChunkIds.map((chunkId, index) => (
            <span
              key={chunkId}
              className="bg-background text-muted-foreground inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
            >
              <BookOpenCheck className="text-foreground h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 truncate">
                {isDebugMode ? chunkId : copy.sourceLabel(index + 1)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getPendingAssetLabel(language: 'ko' | 'en', compact: boolean) {
  if (language === 'ko') return compact ? '준비 중' : '미리보기 준비 중';
  return compact ? 'Pending' : 'Preview asset pending';
}

function getSourceBadgeCopy(language: 'ko' | 'en') {
  if (language === 'ko') {
    return {
      viewSources: '근거 보기',
      hideSources: '근거 접기',
      publicAriaLabel: '답변 근거',
      debugAriaLabel: '근거 디버그 정보',
      sourceLabel: (index: number) => `Oosu Wiki 근거 ${index}`,
    };
  }

  return {
    viewSources: 'View sources',
    hideSources: 'Hide sources',
    publicAriaLabel: 'Answer sources',
    debugAriaLabel: 'Source chunk debug metadata',
    sourceLabel: (index: number) => `Oosu Wiki source ${index}`,
  };
}

function buildFallbackParts(payload: RichPayload): RichAnswerPart[] {
  return [
    { type: 'markdown', contentKey: 'defaultAnswer' },
    ...payload.visualBlocks.map((block) => ({
      type: 'component' as const,
      component: componentNameForBlock(block.type),
      blockType: block.type,
      dataKey: block.dataKey,
    })),
  ];
}

function normalizeAnswerPartsForDisplay(parts: RichAnswerPart[]) {
  const hasProfileHeroCard = parts.some(
    (part) =>
      part.type === 'component' && part.component === 'ProfileHeroCard'
  );

  if (!hasProfileHeroCard) return parts;

  return parts.filter((part) => part.type !== 'markdown');
}

function findVisualBlock(part: RichAnswerPart, blocks: VisualBlock[]) {
  if (part.type !== 'component') return null;

  return (
    blocks.find((block) => block.dataKey && block.dataKey === part.dataKey) ??
    blocks.find((block) => block.type === part.blockType) ??
    blocks.find(
      (block) => componentNameForBlock(block.type) === part.component
    ) ??
    null
  );
}

function componentNameForBlock(blockType: string) {
  const componentByType: Record<string, string> = {
    profileCard: 'ProfileHeroCard',
    projectCards: 'ProjectShowcaseCards',
    skillChips: 'SkillChipGroup',
    timeline: 'CareerTimeline',
    comparisonTable: 'ComparisonGrid',
    statelessDiagram: 'AIWorkflowSteps',
    imageCard: 'ImageCard',
    contactCard: 'ContactCard',
    ctaButtons: 'CtaButtons',
    sourceBadges: 'SourceBadgeList',
  };

  return componentByType[blockType] ?? blockType;
}

function parseRichPayload(metadata: unknown): RichPayload | null {
  if (!isRecord(metadata)) return null;

  const richAnswerData = metadata.richAnswerData;
  const nestedRichData = isRecord(richAnswerData) ? richAnswerData : null;
  const visualBlockSource = Array.isArray(metadata.visualBlocks)
    ? metadata.visualBlocks
    : Array.isArray(nestedRichData?.visualBlocks)
      ? nestedRichData.visualBlocks
      : [];
  const mediaRefSource = Array.isArray(metadata.mediaRefs)
    ? metadata.mediaRefs
    : Array.isArray(nestedRichData?.mediaRefs)
      ? nestedRichData.mediaRefs
      : [];
  const sourceChunkIdsSource = Array.isArray(metadata.sourceChunkIds)
    ? metadata.sourceChunkIds
    : Array.isArray(nestedRichData?.sourceChunkIds)
      ? nestedRichData.sourceChunkIds
      : [];

  const visualBlocks = visualBlockSource
    .map(parseVisualBlock)
    .filter(isDefined);
  const answerParts = Array.isArray(metadata.answerParts)
    ? metadata.answerParts.map(parseAnswerPart).filter(isDefined)
    : [];

  if (visualBlocks.length === 0 && answerParts.length === 0) return null;

  return {
    language: metadata.language === 'ko' ? 'ko' : 'en',
    badge: parseString(metadata.badge) ?? undefined,
    todoBadge: parseString(metadata.todoBadge) ?? undefined,
    renderSpecKey: parseString(metadata.renderSpecKey) ?? undefined,
    richAnswerData,
    answerParts,
    visualBlocks,
    mediaRefs: mediaRefSource.map(parseMediaRef).filter(isDefined),
    sourceChunkIds: parseStringArray(sourceChunkIdsSource),
    hasCanonicalEvidence:
      Array.isArray(metadata.sources) && metadata.sources.length > 0,
  };
}

function parseAnswerPart(value: unknown): RichAnswerPart | null {
  if (!isRecord(value)) return null;
  const type = parseString(value.type);

  if (type === 'markdown') {
    return {
      type,
      contentKey: parseString(value.contentKey) ?? undefined,
      content: parseString(value.content) ?? undefined,
    };
  }

  if (type === 'component') {
    return {
      type,
      component: parseString(value.component) ?? undefined,
      dataKey: parseString(value.dataKey) ?? undefined,
      blockType: parseString(value.blockType) ?? undefined,
    };
  }

  if (type === 'sourceBadges') {
    return {
      type,
      sourceChunkIds: parseStringArray(value.sourceChunkIds),
    };
  }

  return null;
}

function parseVisualBlock(value: unknown): VisualBlock | null {
  if (!isRecord(value)) return null;
  const type = parseString(value.type);
  if (!type) return null;

  return {
    type,
    title: parseString(value.title) ?? undefined,
    dataKey: parseString(value.dataKey) ?? undefined,
    items: Array.isArray(value.items) ? value.items : [],
  };
}

function parseMediaRef(value: unknown): MediaRef | null {
  if (!isRecord(value)) return null;
  const assetKey = parseString(value.assetKey);
  const kind = parseString(value.kind);
  const src = parseString(value.src);
  const alt = parseString(value.alt);
  const status =
    value.status === 'ready' ||
    value.status === 'todo' ||
    value.status === 'optional'
      ? value.status
      : null;

  if (!assetKey || !kind || !src || !alt || !status) return null;

  return {
    assetKey,
    kind,
    src,
    mobileSrc: parseString(value.mobileSrc) ?? undefined,
    alt,
    caption: parseString(value.caption) ?? undefined,
    status,
  };
}

function parseProjectItem(value: unknown): ProjectItem | null {
  if (!isRecord(value)) return null;
  const id = parseString(value.id);
  const title = parseString(value.title);
  if (!id || !title) return null;

  return {
    id,
    title,
    label: parseString(value.label) ?? undefined,
    subtitle: parseString(value.subtitle) ?? undefined,
    description: parseString(value.description) ?? undefined,
    image: parseString(value.image) ?? undefined,
    tags: parseStringArray(value.tags),
    href: parseString(value.href) ?? undefined,
  };
}

function parseSkillGroup(value: unknown): SkillGroup | null {
  if (!isRecord(value)) return null;
  const group = parseString(value.group);
  if (!group) return null;

  return {
    group,
    skills: Array.isArray(value.skills)
      ? value.skills.map(parseSkillItem).filter(isDefined)
      : [],
    evidence: parseStringArray(value.evidence),
  };
}

function parseSkillItem(value: unknown): SkillItem | null {
  if (typeof value === 'string') {
    const name = value.trim();
    return name ? { name } : null;
  }

  if (!isRecord(value)) return null;
  const name = parseString(value.name);
  if (!name) return null;

  return {
    name,
    proficiency: parseString(value.proficiency) ?? undefined,
  };
}

function parseContactAction(value: unknown): ContactAction | null {
  if (!isRecord(value)) return null;
  const label = parseString(value.label);
  const href = parseString(value.href);
  if (!label || !href) return null;

  return {
    label,
    href,
    kind: parseString(value.kind) ?? undefined,
  };
}

function parseDiagramStep(value: unknown): DiagramStep | null {
  if (!isRecord(value)) return null;
  const title = parseString(value.title);
  if (!title) return null;

  return {
    title,
    description: parseString(value.description) ?? undefined,
  };
}

function parseComparisonTable(value: unknown): ComparisonTable | null {
  if (!isRecord(value)) return null;
  const leftTitle = parseString(value.leftTitle);
  const rightTitle = parseString(value.rightTitle);
  const rows = Array.isArray(value.rows)
    ? value.rows.map(parseComparisonRow).filter(isDefined)
    : [];

  if (!leftTitle || !rightTitle || rows.length === 0) return null;

  return {
    leftTitle,
    rightTitle,
    rows,
  };
}

function parseComparisonRow(value: unknown): ComparisonRow | null {
  if (!isRecord(value)) return null;
  const label = parseString(value.label);
  const left = parseString(value.left);
  const right = parseString(value.right);

  if (!label || !left || !right) return null;

  return { label, left, right };
}

function surfaceForProject(projectId: string): QuestionSurface | null {
  const normalizedId = projectId.trim().toLowerCase();
  const surfaceByProjectId: Record<string, QuestionSurface> = {
    askoosu: 'project.askoosu',
    askoosu_2026: 'project.askoosu',
    instagram_clone: 'project.instagram',
    instagram: 'project.instagram',
    sticks_and_stones: 'project.sticks',
    sticks: 'project.sticks',
    portfoliooh: 'project.portfoliooh',
    portfolio_oh: 'project.portfoliooh',
    portfoli_oh: 'project.portfoliooh',
  };

  return surfaceByProjectId[normalizedId] ?? null;
}

function switchQuestionSurface(projectId: string) {
  const surface = surfaceForProject(projectId);
  if (!surface || typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('askoosu:question-surface', {
      detail: { surface },
    })
  );
}

function iconForAction(kind: string) {
  const normalizedKind = kind.toLowerCase();
  if (normalizedKind.includes('github')) return Github;
  if (normalizedKind.includes('linkedin')) return Linkedin;
  if (normalizedKind.includes('mail') || normalizedKind.includes('email')) {
    return Mail;
  }
  if (normalizedKind.includes('portfolio')) return BriefcaseBusiness;
  return Sparkles;
}

function findMediaRef(mediaRefs: MediaRef[], assetKey: string) {
  return mediaRefs.find((media) => media.assetKey === assetKey) ?? null;
}

function parseString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
