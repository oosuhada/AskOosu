'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  FolderKanban,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type RagSource = {
  chunk_id: string;
  entity_id: string | null;
  title: string;
  section_path: string[];
  score: number;
  visibility: string;
  has_todo: boolean;
};

type RagMetadata = {
  sources: RagSource[];
  confidence: number;
  matchedEntityIds: string[];
  hasTodoEvidence: boolean;
  warnings: string[];
};

type ProjectCardInfo = {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
};

type FeedbackValue = 'helpful' | 'needs-work' | null;

const MAX_VISIBLE_SOURCES = 4;

const PROJECT_CARDS: Record<string, ProjectCardInfo> = {
  askoosu: {
    id: 'askoosu',
    title: 'AskOosu',
    category: 'AI Portfolio',
    description:
      'Notion Wiki, RAG search, and Groq chat are connected into a conversational portfolio.',
    tags: ['Next.js', 'AI SDK', 'RAG'],
  },
  instagram_clone: {
    id: 'instagram_clone',
    title: 'Instagram Clone',
    category: 'Fullstack SNS',
    description:
      'A fullstack practice project for feed, follow, comment, API, and database flows.',
    tags: ['Spring Boot', 'React', 'PostgreSQL'],
  },
  sticks_and_stones: {
    id: 'sticks_and_stones',
    title: 'Sticks & Stones',
    category: 'Real Service Migration',
    description:
      'A real homepage renewal and migration project from WordPress into a modern frontend stack.',
    tags: ['TypeScript', 'Vite', 'Migration'],
  },
  portfoli_oh: {
    id: 'portfoli_oh',
    title: 'Portfoli-Oh!',
    category: 'Frontend Portfolio',
    description:
      'The 2025 interactive portfolio focused on motion, experimental UI, and storytelling.',
    tags: ['HTML', 'CSS', 'JavaScript'],
  },
  ez_air: {
    id: 'ez_air',
    title: 'EZ Air',
    category: 'AI Travel Search',
    description:
      'A project entity reserved for natural-language flight search and travel product evidence.',
    tags: ['AI Search', 'Travel UX', 'API'],
  },
  uncorked: {
    id: 'uncorked',
    title: 'Uncorked',
    category: 'Wine Bar Concept',
    description:
      'A project entity for wine-bar service design, brand direction, and polished web presence.',
    tags: ['Figma', 'Brand UX', 'Website'],
  },
};

const PROJECT_ENTITY_ALIASES: Record<string, keyof typeof PROJECT_CARDS> = {
  askoosu: 'askoosu',
  'project.askoosu': 'askoosu',
  instagram_clone: 'instagram_clone',
  'project.instagram_clone': 'instagram_clone',
  sticks_and_stones: 'sticks_and_stones',
  sticks_stones: 'sticks_and_stones',
  'project.sticks_and_stones': 'sticks_and_stones',
  'project.sticks_stones': 'sticks_and_stones',
  portfoli_oh: 'portfoli_oh',
  portfolioh: 'portfoli_oh',
  'project.portfoli_oh': 'portfoli_oh',
  'project.portfolioh': 'portfoli_oh',
  ez_air: 'ez_air',
  ezair: 'ez_air',
  'project.ez_air': 'ez_air',
  'project.ezair': 'ez_air',
  uncorked: 'uncorked',
  'project.uncorked': 'uncorked',
};

export function RagEvidencePanel({ metadata }: { metadata?: unknown }) {
  const ragMetadata = useMemo(() => parseRagMetadata(metadata), [metadata]);
  const [feedback, setFeedback] = useState<FeedbackValue>(null);

  if (!ragMetadata) return null;

  const visibleSources = ragMetadata.sources.slice(0, MAX_VISIBLE_SOURCES);
  const hiddenSourceCount = Math.max(
    0,
    ragMetadata.sources.length - visibleSources.length
  );
  const hasReviewEvidence = ragMetadata.sources.some(
    (source) => source.visibility && source.visibility !== 'public'
  );
  const hasTodoEvidence =
    ragMetadata.hasTodoEvidence ||
    ragMetadata.sources.some((source) => source.has_todo);
  const hasWarnings = ragMetadata.warnings.length > 0;
  const projectCards = getProjectCards(ragMetadata);
  const confidenceTone = getConfidenceTone(ragMetadata.confidence);

  return (
    <section
      className="mt-5 space-y-3 border-t pt-4"
      aria-label="RAG answer evidence"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-lg px-2.5 py-1">
          <BookOpenCheck className="h-3.5 w-3.5" />
          {ragMetadata.sources.length > 0
            ? `${ragMetadata.sources.length} sources`
            : 'Wiki source not found'}
        </Badge>

        <Badge
          variant="outline"
          className={cn('rounded-lg px-2.5 py-1', confidenceTone.className)}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {confidenceTone.label} {formatConfidence(ragMetadata.confidence)}
        </Badge>

        {hasTodoEvidence && (
          <Badge
            variant="outline"
            className="rounded-lg border-amber-300 bg-amber-50 px-2.5 py-1 text-amber-800 dark:border-amber-700/70 dark:bg-amber-950/30 dark:text-amber-200"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            TODO evidence
          </Badge>
        )}

        {hasReviewEvidence && (
          <Badge
            variant="outline"
            className="rounded-lg border-rose-300 bg-rose-50 px-2.5 py-1 text-rose-800 dark:border-rose-700/70 dark:bg-rose-950/30 dark:text-rose-200"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            needs review
          </Badge>
        )}

        {hasWarnings && (
          <Badge
            variant="outline"
            className="rounded-lg border-sky-300 bg-sky-50 px-2.5 py-1 text-sky-800 dark:border-sky-700/70 dark:bg-sky-950/30 dark:text-sky-200"
          >
            {ragMetadata.warnings.length} warning
            {ragMetadata.warnings.length === 1 ? '' : 's'}
          </Badge>
        )}
      </div>

      {projectCards.length > 0 && (
        <div
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          aria-label="Matched project cards"
        >
          {projectCards.map((project) => (
            <article
              key={project.id}
              className="bg-muted/35 rounded-lg border p-3"
            >
              <div className="flex items-start gap-2">
                <div className="bg-background text-primary mt-0.5 rounded-md p-1.5">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-semibold">
                    {project.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {project.category}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-background text-muted-foreground rounded-md border px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {ragMetadata.matchedEntityIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Matched entity IDs">
          {ragMetadata.matchedEntityIds.map((entityId) => (
            <span
              key={entityId}
              className="bg-background text-muted-foreground rounded-md border px-2 py-0.5 text-xs"
            >
              {entityId}
            </span>
          ))}
        </div>
      )}

      {visibleSources.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Source badges">
          {visibleSources.map((source, index) => (
            <span
              key={source.chunk_id}
              title={formatSourceTitle(source)}
              className="bg-background text-muted-foreground inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
            >
              <BookOpenCheck className="text-foreground h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 truncate">
                S{index + 1}. {source.title}
              </span>
              <span className="shrink-0 text-[11px]">
                {formatScore(source.score)}
              </span>
            </span>
          ))}

          {hiddenSourceCount > 0 && (
            <span className="bg-background text-muted-foreground inline-flex items-center rounded-lg border px-2.5 py-1 text-xs">
              +{hiddenSourceCount} more
            </span>
          )}
        </div>
      )}

      <div className="text-muted-foreground flex flex-col gap-2 border-t pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span aria-live="polite">
          {feedback
            ? feedback === 'helpful'
              ? 'Thanks for the feedback.'
              : 'Thanks. This answer can be improved.'
            : 'Was this answer helpful?'}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={feedback === 'helpful' ? 'secondary' : 'outline'}
            aria-pressed={feedback === 'helpful'}
            aria-label="Mark this answer as helpful"
            className="h-8 rounded-lg"
            onClick={() => setFeedback('helpful')}
          >
            <ThumbsUp className="h-4 w-4" />
            Helpful
          </Button>
          <Button
            type="button"
            size="sm"
            variant={feedback === 'needs-work' ? 'secondary' : 'outline'}
            aria-pressed={feedback === 'needs-work'}
            aria-label="Mark this answer as needing improvement"
            className="h-8 rounded-lg"
            onClick={() => setFeedback('needs-work')}
          >
            <ThumbsDown className="h-4 w-4" />
            Improve
          </Button>
        </div>
      </div>
    </section>
  );
}

function parseRagMetadata(value: unknown): RagMetadata | null {
  if (!isRecord(value)) return null;

  const hasRagShape =
    'sources' in value ||
    'confidence' in value ||
    'matchedEntityIds' in value ||
    'hasTodoEvidence' in value;

  if (!hasRagShape) return null;

  const sources = Array.isArray(value.sources)
    ? value.sources.map(parseSource).filter((source) => source !== null)
    : [];
  const confidence = normalizeConfidence(value.confidence);

  return {
    sources,
    confidence,
    matchedEntityIds: parseStringArray(value.matchedEntityIds),
    hasTodoEvidence: value.hasTodoEvidence === true,
    warnings: parseStringArray(value.warnings),
  };
}

function parseSource(value: unknown): RagSource | null {
  if (!isRecord(value)) return null;

  const chunkId = parseString(value.chunk_id);
  const title = parseString(value.title);

  if (!chunkId || !title) return null;

  return {
    chunk_id: chunkId,
    entity_id: parseString(value.entity_id),
    title,
    section_path: parseStringArray(value.section_path),
    score: parseFiniteNumber(value.score) ?? 0,
    visibility: parseString(value.visibility) ?? 'public',
    has_todo: value.has_todo === true,
  };
}

function getProjectCards(metadata: RagMetadata) {
  const entityIds = [
    ...metadata.matchedEntityIds,
    ...metadata.sources
      .map((source) => source.entity_id)
      .filter((entityId): entityId is string => Boolean(entityId)),
  ];
  const projectIds = Array.from(
    new Set(
      entityIds
        .map(normalizeProjectEntityId)
        .filter((id): id is keyof typeof PROJECT_CARDS => Boolean(id))
    )
  );

  return projectIds.map((id) => PROJECT_CARDS[id]);
}

function normalizeProjectEntityId(entityId: string) {
  const normalized = entityId
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  return PROJECT_ENTITY_ALIASES[normalized];
}

function getConfidenceTone(confidence: number) {
  if (confidence >= 0.75) {
    return {
      label: 'High confidence',
      className:
        'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/70 dark:bg-emerald-950/30 dark:text-emerald-200',
    };
  }

  if (confidence >= 0.5) {
    return {
      label: 'Medium confidence',
      className:
        'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700/70 dark:bg-blue-950/30 dark:text-blue-200',
    };
  }

  return {
    label: 'Low confidence',
    className:
      'border-zinc-300 bg-zinc-50 text-zinc-800 dark:border-zinc-700/70 dark:bg-zinc-900/40 dark:text-zinc-200',
  };
}

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

function formatScore(score: number) {
  if (!Number.isFinite(score)) return '';
  return score >= 10 ? score.toFixed(0) : score.toFixed(1);
}

function formatSourceTitle(source: RagSource) {
  const path = source.section_path.length
    ? source.section_path.join(' > ')
    : source.title;

  return `${path} | ${source.visibility}${
    source.has_todo ? ' | TODO evidence' : ''
  }`;
}

function normalizeConfidence(value: unknown) {
  const parsedValue = parseFiniteNumber(value);
  if (parsedValue === null) return 0.25;

  const normalizedValue = parsedValue > 1 ? parsedValue / 100 : parsedValue;
  return Math.max(0, Math.min(1, normalizedValue));
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

function parseFiniteNumber(value: unknown) {
  const parsedValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
