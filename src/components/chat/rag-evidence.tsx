'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  BookOpenCheck,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FolderKanban,
  ShieldAlert,
  Send,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { useId, useMemo, useState } from 'react';

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
  answerSource?: string;
  language?: 'ko' | 'en';
  skippedGroq?: boolean;
  provider?: string;
  model?: string;
};

type ProjectCardInfo = {
  id: string;
  title: string;
  category: Record<'ko' | 'en', string>;
  description: Record<'ko' | 'en', string>;
  tags: string[];
};

type FeedbackRating = 'up' | 'down';
type FeedbackState = 'idle' | 'editing-down' | 'saving' | 'saved' | 'error';
type FeedbackReasonKey =
  | 'incorrect'
  | 'missing_context'
  | 'hard_to_follow'
  | 'too_long';

type FeedbackContext = {
  sessionId?: string | null;
  messageId: string;
  question?: string | null;
  answer?: string;
};

const MAX_VISIBLE_SOURCES = 4;
const MAX_CLIENT_TEXT_LENGTH = 4000;
const MAX_CLIENT_QUESTION_LENGTH = 1000;
const MAX_CLIENT_REASON_LENGTH = 1000;
const FEEDBACK_REASON_OPTIONS: {
  key: FeedbackReasonKey;
  label: Record<'ko' | 'en', string>;
}[] = [
  {
    key: 'incorrect',
    label: {
      ko: '부정확해요',
      en: 'Inaccurate',
    },
  },
  {
    key: 'missing_context',
    label: {
      ko: '근거가 부족해요',
      en: 'Needs sources',
    },
  },
  {
    key: 'hard_to_follow',
    label: {
      ko: '이해가 어려워요',
      en: 'Hard to follow',
    },
  },
  {
    key: 'too_long',
    label: {
      ko: '너무 길어요',
      en: 'Too long',
    },
  },
];

const PROJECT_CARDS: Record<string, ProjectCardInfo> = {
  askoosu: {
    id: 'askoosu',
    title: 'AskOosu',
    category: {
      ko: 'AI 포트폴리오',
      en: 'AI Portfolio',
    },
    description: {
      ko: 'Notion Wiki, RAG 검색, Groq 채팅을 연결한 대화형 포트폴리오입니다.',
      en: 'Notion Wiki, RAG search, and Groq chat are connected into a conversational portfolio.',
    },
    tags: ['Next.js', 'AI SDK', 'RAG'],
  },
  instagram_clone: {
    id: 'instagram_clone',
    title: 'Instagram Clone',
    category: {
      ko: '풀스택 SNS',
      en: 'Fullstack SNS',
    },
    description: {
      ko: '피드, 팔로우, 댓글, API, 데이터베이스 흐름을 직접 연결한 풀스택 프로젝트입니다.',
      en: 'A fullstack practice project for feed, follow, comment, API, and database flows.',
    },
    tags: ['Spring Boot', 'React', 'PostgreSQL'],
  },
  sticks_and_stones: {
    id: 'sticks_and_stones',
    title: 'Sticks & Stones',
    category: {
      ko: '실서비스 마이그레이션',
      en: 'Real Service Migration',
    },
    description: {
      ko: 'WordPress 기반 실제 홈페이지를 TypeScript/Vite 기반 프론트엔드로 옮긴 리뉴얼 작업입니다.',
      en: 'A real homepage renewal and migration project from WordPress into a modern frontend stack.',
    },
    tags: ['TypeScript', 'Vite', 'Migration'],
  },
  portfoli_oh: {
    id: 'portfoli_oh',
    title: 'Portfoli-Oh!',
    category: {
      ko: '프론트엔드 포트폴리오',
      en: 'Frontend Portfolio',
    },
    description: {
      ko: '모션, 실험적인 UI, 스토리텔링에 집중한 2025 인터랙티브 포트폴리오입니다.',
      en: 'The 2025 interactive portfolio focused on motion, experimental UI, and storytelling.',
    },
    tags: ['HTML', 'CSS', 'JavaScript'],
  },
  ez_air: {
    id: 'ez_air',
    title: 'EZ Air',
    category: {
      ko: 'AI 여행 검색',
      en: 'AI Travel Search',
    },
    description: {
      ko: '자연어 항공권 검색과 여행 상품 UX를 다루는 프로젝트 엔티티입니다.',
      en: 'A project entity reserved for natural-language flight search and travel product evidence.',
    },
    tags: ['AI Search', 'Travel UX', 'API'],
  },
  uncorked: {
    id: 'uncorked',
    title: 'Uncorked',
    category: {
      ko: '와인바 콘셉트',
      en: 'Wine Bar Concept',
    },
    description: {
      ko: '와인바 서비스 디자인, 브랜드 방향성, 웹 프레즌스를 정리한 프로젝트 엔티티입니다.',
      en: 'A project entity for wine-bar service design, brand direction, and polished web presence.',
    },
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

export function RagEvidencePanel({
  metadata,
  feedbackContext,
}: {
  metadata?: unknown;
  feedbackContext?: FeedbackContext;
}) {
  const ragMetadata = useMemo(() => parseRagMetadata(metadata), [metadata]);
  const feedbackReasonId = useId();
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRating | null>(
    null
  );
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [feedbackReason, setFeedbackReason] = useState('');
  const [selectedFeedbackReasons, setSelectedFeedbackReasons] = useState<
    FeedbackReasonKey[]
  >([]);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  if (!ragMetadata) return null;

  const hiddenSourceCount = Math.max(
    0,
    ragMetadata.sources.length - MAX_VISIBLE_SOURCES
  );
  const displayedSources = sourcesExpanded
    ? ragMetadata.sources
    : ragMetadata.sources.slice(0, MAX_VISIBLE_SOURCES);
  const hasReviewEvidence = ragMetadata.sources.some(
    (source) => source.visibility && source.visibility !== 'public'
  );
  const hasTodoEvidence =
    ragMetadata.hasTodoEvidence ||
    ragMetadata.sources.some((source) => source.has_todo);
  const hasWarnings = ragMetadata.warnings.length > 0;
  const projectCards = getProjectCards(ragMetadata);
  const displayLanguage = ragMetadata.language ?? 'en';
  const confidenceTone = getConfidenceTone(
    ragMetadata.confidence,
    displayLanguage
  );
  const answerSourceLabel = getAnswerSourceLabel(ragMetadata, displayLanguage);

  return (
    <section
      className="mt-5 space-y-3 border-t pt-4"
      aria-label={
        displayLanguage === 'ko' ? 'RAG 답변 근거' : 'RAG answer evidence'
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-lg px-2.5 py-1">
          <BookOpenCheck className="h-3.5 w-3.5" />
          {ragMetadata.sources.length > 0
            ? formatSourceCount(ragMetadata.sources.length, displayLanguage)
            : displayLanguage === 'ko'
              ? 'Wiki 근거 없음'
              : 'Wiki source not found'}
        </Badge>

        {answerSourceLabel && (
          <Badge variant="outline" className="rounded-lg px-2.5 py-1">
            <BrainCircuit className="h-3.5 w-3.5" />
            {answerSourceLabel}
          </Badge>
        )}

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
            {displayLanguage === 'ko' ? 'TODO 근거' : 'TODO evidence'}
          </Badge>
        )}

        {hasReviewEvidence && (
          <Badge
            variant="outline"
            className="rounded-lg border-rose-300 bg-rose-50 px-2.5 py-1 text-rose-800 dark:border-rose-700/70 dark:bg-rose-950/30 dark:text-rose-200"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            {displayLanguage === 'ko' ? '검토 필요' : 'needs review'}
          </Badge>
        )}

        {hasWarnings && (
          <Badge
            variant="outline"
            className="rounded-lg border-sky-300 bg-sky-50 px-2.5 py-1 text-sky-800 dark:border-sky-700/70 dark:bg-sky-950/30 dark:text-sky-200"
          >
            {formatWarningCount(ragMetadata.warnings.length, displayLanguage)}
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
                    {project.category[displayLanguage]}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {project.description[displayLanguage]}
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
              {formatEntityLabel(entityId, displayLanguage)}
            </span>
          ))}
        </div>
      )}

      {displayedSources.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Source badges">
          {displayedSources.map((source, index) => (
            <span
              key={source.chunk_id}
              title={formatSourceTitle(source)}
              className="bg-background text-muted-foreground inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
            >
              <BookOpenCheck className="text-foreground h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 truncate">
                S{index + 1}. {formatSourceBadgeTitle(source, displayLanguage)}
              </span>
              <span className="shrink-0 text-[11px]">
                {formatScore(source.score)}
              </span>
            </span>
          ))}

          {hiddenSourceCount > 0 && (
            <button
              type="button"
              className="bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs outline-none focus-visible:ring-[3px]"
              aria-expanded={sourcesExpanded}
              onClick={() => setSourcesExpanded((current) => !current)}
            >
              {displayLanguage === 'ko'
                ? sourcesExpanded
                  ? '접기'
                  : `+${hiddenSourceCount}개 더`
                : sourcesExpanded
                  ? 'Collapse'
                  : `+${hiddenSourceCount} more`}
              {sourcesExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      )}

      <div className="text-muted-foreground flex flex-col gap-2 border-t pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span aria-live="polite">
          {getFeedbackStatusText(
            feedbackState,
            feedbackRating,
            displayLanguage
          )}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={feedbackRating === 'up' ? 'secondary' : 'outline'}
            aria-pressed={feedbackRating === 'up'}
            aria-label={
              displayLanguage === 'ko'
                ? '이 답변을 좋음으로 평가'
                : 'Mark this answer as helpful'
            }
            className="h-8 rounded-lg"
            disabled={feedbackState === 'saving'}
            onClick={() => {
              setFeedbackReason('');
              setSelectedFeedbackReasons([]);
              void submitFeedback({
                rating: 'up',
                reason: null,
                metadata: ragMetadata,
                context: feedbackContext,
                setFeedbackRating,
                setFeedbackState,
              });
            }}
          >
            <ThumbsUp className="h-4 w-4" />
            {displayLanguage === 'ko' ? '좋아요' : 'Helpful'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={feedbackRating === 'down' ? 'secondary' : 'outline'}
            aria-pressed={feedbackRating === 'down'}
            aria-label={
              displayLanguage === 'ko'
                ? '이 답변을 개선 필요로 평가'
                : 'Mark this answer as needing improvement'
            }
            className="h-8 rounded-lg"
            disabled={feedbackState === 'saving'}
            onClick={() => {
              setFeedbackRating('down');
              setFeedbackState('editing-down');
              setFeedbackReason('');
              setSelectedFeedbackReasons([]);
            }}
          >
            <ThumbsDown className="h-4 w-4" />
            {displayLanguage === 'ko' ? '개선 필요' : 'Improve'}
          </Button>
        </div>
      </div>

      {feedbackState === 'editing-down' && (
        <div className="bg-muted/20 space-y-3 rounded-lg border p-3">
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_REASON_OPTIONS.map((option) => {
              const selected = selectedFeedbackReasons.includes(option.key);

              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={selected}
                  className={cn(
                    'focus-visible:ring-ring/50 rounded-lg border px-2.5 py-1 text-xs transition outline-none focus-visible:ring-[3px]',
                    selected
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => {
                    setSelectedFeedbackReasons((currentReasons) =>
                      currentReasons.includes(option.key)
                        ? currentReasons.filter((key) => key !== option.key)
                        : [...currentReasons, option.key]
                    );
                  }}
                >
                  {option.label[displayLanguage]}
                </button>
              );
            })}
          </div>
          <label
            className="text-muted-foreground text-xs"
            htmlFor={feedbackReasonId}
          >
            {displayLanguage === 'ko' ? '추가 메모' : 'Optional note'}
          </label>
          <textarea
            id={feedbackReasonId}
            value={feedbackReason}
            maxLength={MAX_CLIENT_REASON_LENGTH}
            onChange={(event) => setFeedbackReason(event.target.value)}
            placeholder={
              displayLanguage === 'ko'
                ? '부족하거나 부정확했던 부분이 있나요?'
                : 'What felt missing or inaccurate?'
            }
            className="border-input bg-background focus-visible:ring-ring/50 min-h-20 w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg"
              onClick={() => {
                setFeedbackRating(null);
                setFeedbackState('idle');
                setFeedbackReason('');
                setSelectedFeedbackReasons([]);
              }}
            >
              {displayLanguage === 'ko' ? '취소' : 'Cancel'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-lg"
              onClick={() => {
                void submitFeedback({
                  rating: 'down',
                  reason: buildDownFeedbackReason({
                    reasonKeys: selectedFeedbackReasons,
                    note: feedbackReason,
                    language: displayLanguage,
                  }),
                  metadata: ragMetadata,
                  context: feedbackContext,
                  setFeedbackRating,
                  setFeedbackState,
                });
              }}
            >
              <Send className="h-4 w-4" />
              {displayLanguage === 'ko' ? '피드백 저장' : 'Save feedback'}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

async function submitFeedback({
  rating,
  reason,
  metadata,
  context,
  setFeedbackRating,
  setFeedbackState,
}: {
  rating: FeedbackRating;
  reason: string | null;
  metadata: RagMetadata;
  context: FeedbackContext | undefined;
  setFeedbackRating: (rating: FeedbackRating) => void;
  setFeedbackState: (state: FeedbackState) => void;
}) {
  if (!context?.messageId) {
    setFeedbackState('error');
    return;
  }

  setFeedbackRating(rating);
  setFeedbackState('saving');

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: context.sessionId ?? '',
        messageId: truncateForFeedback(context.messageId, 128),
        question: truncateForFeedback(
          context.question ?? '',
          MAX_CLIENT_QUESTION_LENGTH
        ),
        answer: truncateForFeedback(
          context.answer ?? '',
          MAX_CLIENT_TEXT_LENGTH
        ),
        rating,
        reason: reason?.trim() || null,
        matchedEntityIds: metadata.matchedEntityIds,
        sourceChunkIds: metadata.sources.map((source) => source.chunk_id),
        confidence: metadata.confidence,
      }),
    });
    const result = (await response.json().catch(() => null)) as {
      ok?: boolean;
    } | null;

    if (!response.ok || !result?.ok) {
      throw new Error('Feedback request failed.');
    }

    setFeedbackState('saved');
  } catch (error) {
    console.warn('Unable to save answer feedback:', error);
    setFeedbackState('error');
  }
}

function getFeedbackStatusText(
  state: FeedbackState,
  rating: FeedbackRating | null,
  language: 'ko' | 'en'
) {
  if (language === 'ko') {
    if (state === 'saving') return '피드백 저장 중...';
    if (state === 'saved') return '고마워요. 피드백이 저장됐어요.';
    if (state === 'error') return '피드백 저장에 실패했어요.';
    if (state === 'editing-down') return '어떤 점을 개선하면 좋을까요?';
    if (rating === 'up') return '피드백 고마워요.';
    if (rating === 'down') return '고마워요. 이 답변은 개선할 수 있어요.';

    return '이 답변이 도움이 되었나요?';
  }

  if (state === 'saving') return 'Saving feedback...';
  if (state === 'saved') return 'Thanks. Feedback saved.';
  if (state === 'error') return 'Feedback could not be saved.';
  if (state === 'editing-down') return 'What should be improved?';
  if (rating === 'up') return 'Thanks for the feedback.';
  if (rating === 'down') return 'Thanks. This answer can be improved.';

  return 'Was this answer helpful?';
}

function buildDownFeedbackReason({
  reasonKeys,
  note,
  language,
}: {
  reasonKeys: FeedbackReasonKey[];
  note: string;
  language: 'ko' | 'en';
}) {
  const reasonLabels = reasonKeys
    .map((reasonKey) => {
      const option = FEEDBACK_REASON_OPTIONS.find(
        (item) => item.key === reasonKey
      );

      return option?.label[language];
    })
    .filter((label): label is string => Boolean(label));
  const trimmedNote = note.trim();

  return [...reasonLabels, trimmedNote].filter(Boolean).join(' | ');
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
    answerSource: parseString(value.answerSource) ?? undefined,
    language:
      value.language === 'en'
        ? 'en'
        : value.language === 'ko'
          ? 'ko'
          : undefined,
    skippedGroq: value.skippedGroq === true,
    provider: parseString(value.provider) ?? undefined,
    model: parseString(value.model) ?? undefined,
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

function getConfidenceTone(confidence: number, language: 'ko' | 'en') {
  if (confidence >= 0.75) {
    return {
      label: language === 'ko' ? '높은 신뢰도' : 'High confidence',
      className:
        'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/70 dark:bg-emerald-950/30 dark:text-emerald-200',
    };
  }

  if (confidence >= 0.5) {
    return {
      label: language === 'ko' ? '중간 신뢰도' : 'Medium confidence',
      className:
        'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700/70 dark:bg-blue-950/30 dark:text-blue-200',
    };
  }

  return {
    label: language === 'ko' ? '낮은 신뢰도' : 'Low confidence',
    className:
      'border-zinc-300 bg-zinc-50 text-zinc-800 dark:border-zinc-700/70 dark:bg-zinc-900/40 dark:text-zinc-200',
  };
}

function getAnswerSourceLabel(metadata: RagMetadata, language: 'ko' | 'en') {
  const labels: Record<string, Record<'ko' | 'en', string>> = {
    faq_cache: { ko: 'FAQ 캐시', en: 'FAQ cache' },
    answer_cache: { ko: '답변 캐시', en: 'Answer cache' },
    deterministic_rule: { ko: '공개 정책 규칙', en: 'Policy rule' },
    rag_groq: { ko: 'Wiki + Groq', en: 'Wiki + Groq' },
    rag_google: { ko: 'Wiki + Google', en: 'Wiki + Google' },
    rag_openai: { ko: 'Wiki + OpenAI', en: 'Wiki + OpenAI' },
    rag_xai: { ko: 'Wiki + xAI', en: 'Wiki + xAI' },
    fallback: { ko: '안전 fallback', en: 'Safe fallback' },
  };

  if (!metadata.answerSource) return null;
  const sourceLabel =
    labels[metadata.answerSource]?.[language] ?? metadata.answerSource;
  const languageLabel = metadata.language
    ? language === 'ko' && metadata.language === 'ko'
      ? '한국어'
      : metadata.language.toUpperCase()
    : '';
  const modelLabel =
    metadata.provider && !metadata.skippedGroq
      ? metadata.provider
      : metadata.skippedGroq
        ? language === 'ko'
          ? 'Groq 미사용'
          : 'no Groq'
        : '';

  return [sourceLabel, languageLabel, modelLabel].filter(Boolean).join(' · ');
}

function formatSourceCount(count: number, language: 'ko' | 'en') {
  if (language === 'ko') return `근거 ${count}개`;
  return `${count} source${count === 1 ? '' : 's'}`;
}

function formatWarningCount(count: number, language: 'ko' | 'en') {
  if (language === 'ko') return `경고 ${count}개`;
  return `${count} warning${count === 1 ? '' : 's'}`;
}

function formatEntityLabel(entityId: string, language: 'ko' | 'en') {
  const projectId = normalizeProjectEntityId(entityId);
  if (projectId) return PROJECT_CARDS[projectId].title;

  const labels: Record<string, Record<'ko' | 'en', string>> = {
    'profile.identity': { ko: '프로필', en: 'Profile' },
    'profile.career': { ko: '커리어', en: 'Career' },
    'career.oosu_salon': { ko: '우수살롱', en: 'Oosu Salon' },
    'policy.guardrail': { ko: '답변 정책', en: 'Answer policy' },
  };

  return labels[entityId]?.[language] ?? entityId;
}

function formatSourceBadgeTitle(source: RagSource, language: 'ko' | 'en') {
  const titleMap: Record<string, Record<'ko' | 'en', string>> = {
    'FAQ answer bank': { ko: 'FAQ 답변 뱅크', en: 'FAQ answer bank' },
    'Answer cache': { ko: '답변 캐시', en: 'Answer cache' },
    'Public policy rule': { ko: '공개 정책 규칙', en: 'Public policy rule' },
  };

  return titleMap[source.title]?.[language] ?? source.title;
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

function truncateForFeedback(value: string, max: number) {
  return value.trim().replace(/\s+/g, ' ').slice(0, max);
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
