'use client';

import Image from 'next/image';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { oosuProfile } from '@/lib/oosu-profile';
import { cn } from '@/lib/utils';
import type { QuestionSurface } from '@/data/question-surfaces.shared';
import {
  BookOpenCheck,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MessageSquareText,
  Sparkles,
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
};

type ProjectItem = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  tags: string[];
  href?: string;
};

type SkillGroup = {
  group: string;
  skills: string[];
  evidence: string[];
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

  const parts =
    payload.answerParts.length > 0
      ? payload.answerParts
      : buildFallbackParts(payload);

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
    const content = part.content ?? markdownContent;
    if (!content.trim()) return null;

    return <MarkdownBlock key={`markdown-${index}`} content={content} />;
  }

  if (part.type === 'sourceBadges') {
    return (
      <SourceBadgeList
        key={`sources-${index}`}
        sourceChunkIds={part.sourceChunkIds ?? payload.sourceChunkIds}
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
    return <SkillChipGroup key={`${block.type}-${index}`} block={block} />;
  }

  if (block.type === 'contactCard') {
    return (
      <ContactCard
        key={`${block.type}-${index}`}
        block={block}
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
        mediaRefs={payload.mediaRefs}
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

  return (
    <section className="space-y-2" aria-label={block.title ?? 'Projects'}>
      {block.title && (
        <h3 className="text-sm font-semibold tracking-normal">{block.title}</h3>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="overflow-hidden rounded-lg border bg-white/70 shadow-sm dark:bg-white/[0.05]"
          >
            <MediaPreview
              assetKey={project.image}
              mediaRefs={mediaRefs}
              className="aspect-[16/9]"
            />
            <div className="space-y-2 p-3">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold break-words">
                  {project.title}
                </h4>
                {project.subtitle && (
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {project.subtitle}
                  </p>
                )}
              </div>
              {project.description && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {project.description}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-background text-muted-foreground rounded-md border px-2 py-0.5 text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {surfaceForProject(project.id) && (
                  <button
                    type="button"
                    onClick={() => switchQuestionSurface(project.id)}
                    className="bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition"
                  >
                    <MessageSquareText className="h-3.5 w-3.5" />
                    {language === 'ko' ? '관련 질문' : 'Questions'}
                  </button>
                )}
                {project.href && (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition"
                  >
                    {language === 'ko' ? '열기' : 'Open'}
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
              <div className="border-l px-3 py-2">{table.leftTitle}</div>
              <div className="border-l px-3 py-2">{table.rightTitle}</div>
            </div>
            {table.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[0.72fr_1fr_1fr] border-b last:border-b-0"
              >
                <div className="bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-900/25 dark:text-slate-300">
                  {row.label}
                </div>
                <div className="border-l px-3 py-2 text-xs leading-relaxed">
                  {row.left}
                </div>
                <div className="border-l px-3 py-2 text-xs leading-relaxed">
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

function SkillChipGroup({ block }: { block: VisualBlock }) {
  const skillGroups = block.items.map(parseSkillGroup).filter(isDefined);
  if (skillGroups.length === 0) return null;

  return (
    <section className="space-y-2" aria-label={block.title ?? 'Skills'}>
      {block.title && (
        <h3 className="text-sm font-semibold tracking-normal">{block.title}</h3>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <div
            key={group.group}
            className="rounded-lg border bg-slate-50/80 p-3 dark:bg-slate-900/30"
          >
            <div className="mb-2 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-sky-600 dark:text-sky-300" />
              <h4 className="text-sm font-semibold">{group.group}</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-sky-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-sky-800/70 dark:bg-slate-950/50 dark:text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
            {group.evidence.length > 0 && (
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                {group.evidence.join(' / ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactCard({
  block,
  language,
}: {
  block: VisualBlock;
  language: 'ko' | 'en';
}) {
  const actions = block.items.map(parseContactAction).filter(isDefined);

  return (
    <section className="rounded-lg border bg-white/70 p-4 dark:bg-white/[0.05]">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
          <Mail className="h-4 w-4" />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold break-words">
            {block.title ?? 'Contact Oosu'}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {language === 'ko'
              ? '검증된 공개 채널만 표시합니다.'
              : 'Only verified public channels are shown.'}
          </p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div className="bg-background rounded-lg border p-2">
          <dt className="text-muted-foreground text-xs">Email</dt>
          <dd className="font-medium break-words">{oosuProfile.email}</dd>
        </div>
        <div className="bg-background rounded-lg border p-2">
          <dt className="text-muted-foreground text-xs">Location</dt>
          <dd className="font-medium break-words">{oosuProfile.location}</dd>
        </div>
      </dl>
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
            className="bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition"
          >
            <Icon className="h-4 w-4" />
            {action.label}
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
              <h4 className="text-sm font-semibold break-words">
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
              />
              <p className="text-muted-foreground p-3 text-xs leading-relaxed">
                {media?.status === 'ready'
                  ? caption
                  : language === 'ko'
                    ? '이미지 asset은 아직 준비 중입니다.'
                    : 'Image asset is still pending.'}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProfileHeroCard({ mediaRefs }: { mediaRefs: MediaRef[] }) {
  return (
    <section className="rounded-lg border bg-white/70 p-4 dark:bg-white/[0.05]">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-900">
          <MediaPreview
            assetKey="profile.oosu.portrait"
            mediaRefs={mediaRefs}
            className="h-full w-full"
            compact
          />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold break-words">
            {oosuProfile.name}
          </h3>
          <p className="text-muted-foreground text-sm">{oosuProfile.title}</p>
          <p className="text-muted-foreground text-xs">
            {oosuProfile.location}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['Frontend', 'Fullstack', 'AI/RAG', 'UX', 'Business'].map((tag) => (
          <span
            key={tag}
            className="bg-background text-muted-foreground rounded-md border px-2 py-1 text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}

function MediaPreview({
  assetKey,
  mediaRefs,
  className,
  compact = false,
}: {
  assetKey?: string;
  mediaRefs: MediaRef[];
  className?: string;
  compact?: boolean;
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
        {mobileSrc ? (
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
      <span>{compact ? 'Pending' : 'Preview asset pending'}</span>
    </div>
  );
}

function SourceBadgeList({ sourceChunkIds }: { sourceChunkIds: string[] }) {
  if (sourceChunkIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" aria-label="Source chunk badges">
      {sourceChunkIds.map((chunkId) => (
        <span
          key={chunkId}
          className="bg-background text-muted-foreground inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
        >
          <BookOpenCheck className="text-foreground h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 truncate">{chunkId}</span>
        </span>
      ))}
    </div>
  );
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

function findVisualBlock(part: RichAnswerPart, blocks: VisualBlock[]) {
  if (part.type !== 'component') return null;

  return (
    blocks.find((block) => block.type === part.blockType) ??
    blocks.find((block) => block.dataKey && block.dataKey === part.dataKey) ??
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
    skills: parseStringArray(value.skills),
    evidence: parseStringArray(value.evidence),
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
