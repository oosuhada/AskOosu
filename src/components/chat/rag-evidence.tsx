'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isAskOosuDebugUiEnabled } from '@/lib/debug-ui';
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
import { useEffect, useId, useMemo, useState } from 'react';

type RagSource = {
  chunk_id: string;
  entity_id: string | null;
  title: string;
  section_path: string[];
  score: number;
  visibility: string;
  freshness?: string;
  has_todo: boolean;
};

type AnswerConfidence = {
  retrieval: number;
  intent: number;
  freshness: number;
  grounding: number;
  final: number;
};

type RagMetadata = {
  sources: RagSource[];
  confidence: number;
  confidenceSignals?: AnswerConfidence;
  matchedEntityIds: string[];
  hasTodoEvidence: boolean;
  warnings: string[];
  faqId?: string;
  matchedFaqId?: string;
  renderSpecKey?: string;
  answerSource?: string;
  language?: 'ko' | 'en';
  skippedGroq?: boolean;
  provider?: string;
  model?: string;
  errorCode?: string;
  showEvidence?: boolean;
  routeDecision?: {
    mode?: string;
    reason?: string;
  };
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

type DisplaySourceItem = {
  key: string;
  source: RagSource;
  title: string;
  sectionPath: string;
  count: number;
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

function useSourceColumnCount() {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumnCount(4);
      } else if (width >= 1024) {
        setColumnCount(3);
      } else if (width >= 640) {
        setColumnCount(2);
      } else {
        setColumnCount(1);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  return columnCount;
}

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

const SOURCE_SEGMENT_LABELS: Record<string, string> = {
  askoosu: 'AskOosu',
  'project.askoosu': 'AskOosu',
  aigram: 'Aigram',
  'project.aigram': 'Aigram',
  instagram_clone: 'Instagram Clone',
  'project.instagram_clone': 'Instagram Clone',
  sticks_and_stones: 'Sticks & Stones',
  sticks_stones: 'Sticks & Stones',
  'project.sticks_and_stones': 'Sticks & Stones',
  portfoli_oh: 'Portfoli-Oh!',
  portfolioh: 'Portfoli-Oh!',
  'project.portfoli_oh': 'Portfoli-Oh!',
  ez_air: 'EZ Air',
  'project.ez_air': 'EZ Air',
  uncorked: 'Uncorked',
  'project.uncorked': 'Uncorked',
  'policy.guardrail': 'Answer policy',
  'profile.identity': 'Profile',
  'profile.career': 'Career',
  'career.oosu_salon': 'Oosu Salon',
};

const SOURCE_WORD_LABELS: Record<string, string> = {
  ai: 'AI',
  api: 'API',
  db: 'DB',
  faq: 'FAQ',
  github: 'GitHub',
  groq: 'Groq',
  rag: 'RAG',
  ui: 'UI',
  url: 'URL',
  ux: 'UX',
  wiki: 'Wiki',
  nextjs: 'Next.js',
  postgresql: 'PostgreSQL',
  askoosu: 'AskOosu',
  oosu: 'Oosu',
};

const SOURCE_CHUNK_LABELS: Record<string, Record<'ko' | 'en', string>> = {
  'profile.basic_info': { ko: '프로필 기본 정보', en: 'Profile basics' },
  'profile.summary': { ko: '프로필 요약', en: 'Profile summary' },
  'profile.career': { ko: '커리어 전환 맥락', en: 'Career context' },
  'profile.current_focus': { ko: '현재 집중 영역', en: 'Current focus' },
  'profile.business_to_dev': {
    ko: '비즈니스 경험에서 개발로',
    en: 'Business-to-development path',
  },
  'profile.contact': { ko: '공개 연락 채널', en: 'Public contact channels' },
  'profile.faq.contact': {
    ko: '연락/협업 FAQ',
    en: 'Contact and collaboration FAQ',
  },
  'profile.links.resume_policy': {
    ko: '이력서 공개 정책',
    en: 'Resume sharing policy',
  },
  'project.askoosu.overview': {
    ko: 'AskOosu 프로젝트 개요',
    en: 'AskOosu project overview',
  },
  'project.askoosu.story': {
    ko: 'AskOosu 제작 맥락',
    en: 'AskOosu build story',
  },
  'project.instagram_clone.overview': {
    ko: 'Aigram/SNS 프로젝트 개요',
    en: 'Aigram/SNS project overview',
  },
  'project.sticks_and_stones.overview': {
    ko: 'Sticks & Stones 리빌드',
    en: 'Sticks & Stones rebuild',
  },
  'project.portfolioh': {
    ko: 'Portfoli-Oh! 인터랙션 실험',
    en: 'Portfoli-Oh! interaction work',
  },
  'project.portfolio_oh.story': {
    ko: 'Portfoli-Oh! 제작 맥락',
    en: 'Portfoli-Oh! story',
  },
  'project.onjung': { ko: 'Onjung 모바일 앱', en: 'Onjung mobile app' },
  'project.nomad_market': {
    ko: 'Nomad Market 모바일 앱',
    en: 'Nomad Market mobile app',
  },
  'project.webtoon_translate': {
    ko: 'Webtoon AI Translate 파이프라인',
    en: 'Webtoon AI Translate pipeline',
  },
  'project.links.public': {
    ko: '공개 프로젝트 링크',
    en: 'Public project links',
  },
  'skills.current_stack': {
    ko: '현재 핵심 기술 스택',
    en: 'Current core stack',
  },
  'career.oosu_salon': {
    ko: 'OOSU SALON 운영 경험',
    en: 'OOSU SALON operating experience',
  },
  'profile.public_interests': {
    ko: '공개 가능한 작업 취향',
    en: 'Public work-adjacent interests',
  },
  'profile.strengths': {
    ko: '작업 강점과 성향',
    en: 'Working strengths',
  },
  'policy.live_url': {
    ko: '공개 링크 안내 정책',
    en: 'Public URL policy',
  },
};

const SOURCE_CHUNK_CONTEXTS: Record<string, Record<'ko' | 'en', string>> = {
  'faq.project.top_three.default': {
    ko: '대표 프로젝트 답변',
    en: 'Representative projects answer',
  },
  'faq.skills.tech_stack.default': {
    ko: '기술 스택 답변',
    en: 'Tech stack answer',
  },
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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const isDebugMode = useMemo(isAskOosuDebugUiEnabled, []);
  const sourceColumnCount = useSourceColumnCount();

  if (!ragMetadata) return null;
  const displayLanguage = ragMetadata.language ?? 'en';
  const shouldShowFeedbackOnly = shouldShowFeedbackForAnswerSource(
    ragMetadata.answerSource
  );
  if (
    ragMetadata.showEvidence === false &&
    !isDebugMode &&
    !shouldShowFeedbackOnly
  ) {
    return null;
  }
  if (
    !isDebugMode &&
    ragMetadata.sources.length === 0 &&
    !shouldShowFeedbackOnly
  ) {
    return null;
  }

  const sourceItems = buildDisplaySourceItems({
    sources: ragMetadata.sources,
    language: displayLanguage,
    debug: isDebugMode,
  });
  const sourceCount = sourceItems.length;
  const collapsedSourceCount = isDebugMode
    ? MAX_VISIBLE_SOURCES
    : sourceColumnCount;
  const hiddenSourceCount = Math.max(0, sourceCount - collapsedSourceCount);
  const displayedSources = sourcesExpanded
    ? sourceItems
    : sourceItems.slice(0, collapsedSourceCount);
  const hasReviewEvidence = ragMetadata.sources.some(
    (source) => source.visibility && source.visibility !== 'public'
  );
  const hasTodoEvidence =
    ragMetadata.hasTodoEvidence ||
    ragMetadata.sources.some((source) => source.has_todo);
  const hasWarnings = ragMetadata.warnings.length > 0;
  const projectCards = getProjectCards(ragMetadata);
  const confidenceTone = getConfidenceTone(
    ragMetadata.confidence,
    displayLanguage
  );
  const answerSourceLabel = isDebugMode
    ? getAnswerSourceLabel(ragMetadata, displayLanguage)
    : null;
  const shouldShowSources = sourceCount > 0;
  const feedbackStatusText = getFeedbackStatusText(
    feedbackState,
    feedbackRating,
    displayLanguage
  );

  return (
    <section
      className="mt-5 space-y-3 border-t pt-4"
      aria-label={
        displayLanguage === 'ko'
          ? '포트폴리오 답변 근거'
          : 'Portfolio answer evidence'
      }
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Badge variant="outline" className="max-w-full rounded-lg px-2.5 py-1">
          <BookOpenCheck className="h-3.5 w-3.5" />
          <span className="min-w-0 truncate">
            {getPublicSourceBadgeText(
              sourceCount,
              displayLanguage,
              ragMetadata.answerSource
            )}
          </span>
        </Badge>

        {isDebugMode && (
          <Badge
            variant="outline"
            className="rounded-lg border-violet-300 bg-violet-50 px-2.5 py-1 text-violet-800 dark:border-violet-700/70 dark:bg-violet-950/30 dark:text-violet-200"
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            Debug
          </Badge>
        )}

        {isDebugMode && answerSourceLabel && (
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
          {confidenceTone.label}
          {isDebugMode ? ` ${formatConfidence(ragMetadata.confidence)}` : ''}
        </Badge>

        {isDebugMode && hasTodoEvidence && (
          <Badge
            variant="outline"
            className="rounded-lg border-amber-300 bg-amber-50 px-2.5 py-1 text-amber-800 dark:border-amber-700/70 dark:bg-amber-950/30 dark:text-amber-200"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {displayLanguage === 'ko'
              ? '일부 정보 정리 중'
              : 'Needs confirmation'}
          </Badge>
        )}

        {isDebugMode && hasReviewEvidence && (
          <Badge
            variant="outline"
            className="rounded-lg border-rose-300 bg-rose-50 px-2.5 py-1 text-rose-800 dark:border-rose-700/70 dark:bg-rose-950/30 dark:text-rose-200"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            {displayLanguage === 'ko' ? '검토 필요' : 'needs review'}
          </Badge>
        )}

        {isDebugMode && hasWarnings && (
          <Badge
            variant="outline"
            className="rounded-lg border-sky-300 bg-sky-50 px-2.5 py-1 text-sky-800 dark:border-sky-700/70 dark:bg-sky-950/30 dark:text-sky-200"
          >
            {formatWarningCount(ragMetadata.warnings.length, displayLanguage)}
          </Badge>
        )}
      </div>

      {isDebugMode && projectCards.length > 0 && (
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

      {isDebugMode && ragMetadata.matchedEntityIds.length > 0 && (
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

      {isDebugMode && (
        <div className="flex flex-wrap gap-1.5" aria-label="Debug metadata">
          {[
            ragMetadata.faqId ? `faqId: ${ragMetadata.faqId}` : null,
            ragMetadata.matchedFaqId
              ? `matchedFaqId: ${ragMetadata.matchedFaqId}`
              : null,
            ragMetadata.renderSpecKey
              ? `renderSpec: ${ragMetadata.renderSpecKey}`
              : null,
            ragMetadata.routeDecision?.mode
              ? `route: ${ragMetadata.routeDecision.mode}`
              : null,
            ragMetadata.routeDecision?.reason
              ? `reason: ${ragMetadata.routeDecision.reason}`
              : null,
            `skippedGroq: ${ragMetadata.skippedGroq === true}`,
            ragMetadata.provider ? `provider: ${ragMetadata.provider}` : null,
            ragMetadata.errorCode ? `error: ${ragMetadata.errorCode}` : null,
            ...(ragMetadata.confidenceSignals
              ? formatConfidenceSignals(ragMetadata.confidenceSignals)
              : []),
          ]
            .filter((item): item is string => Boolean(item))
            .map((item) => (
              <span
                key={item}
                className="bg-background text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-[11px]"
              >
                {item}
              </span>
            ))}
        </div>
      )}

      {shouldShowSources && displayedSources.length > 0 && (
        <div className="space-y-2" aria-label="Portfolio sources">
          <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedSources.map((sourceItem) => (
              <SourceEvidenceCard
                key={sourceItem.key}
                sourceItem={sourceItem}
                language={displayLanguage}
                debug={isDebugMode}
              />
            ))}
          </div>

          {hiddenSourceCount > 0 && (
            <button
              type="button"
              className="bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex max-w-full items-center gap-1 rounded-lg border px-2.5 py-1 text-xs outline-none focus-visible:ring-[3px]"
              aria-expanded={sourcesExpanded}
              onClick={() => setSourcesExpanded((current) => !current)}
            >
              <span className="min-w-0 truncate">
                {getRemainingSourcesButtonLabel({
                  count: hiddenSourceCount,
                  expanded: sourcesExpanded,
                  language: displayLanguage,
                  debug: isDebugMode,
                })}
              </span>
              {sourcesExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      )}

      {!isDebugMode && hasTodoEvidence && (
        <p className="text-muted-foreground text-xs">
          {displayLanguage === 'ko'
            ? '일부 정보가 아직 업데이트 중이에요.'
            : 'Some details are still being updated.'}
        </p>
      )}

      <div className="border-t pt-3">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <span
            className="text-muted-foreground min-w-0 text-xs"
            aria-live="polite"
          >
            {feedbackStatusText}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-expanded={isFeedbackOpen}
            className="text-muted-foreground hover:text-foreground h-8 rounded-lg px-2 text-xs"
            onClick={() => setIsFeedbackOpen((current) => !current)}
          >
            {displayLanguage === 'ko'
              ? '답변 수정 제안'
              : 'Suggest an improvement'}
            {isFeedbackOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {isFeedbackOpen && (
          <div className="bg-muted/20 mt-2 space-y-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={feedbackRating === 'up' ? 'secondary' : 'outline'}
                aria-pressed={feedbackRating === 'up'}
                aria-label={
                  displayLanguage === 'ko'
                    ? '이 답변을 도움됨으로 평가'
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
                {displayLanguage === 'ko' ? '도움됐어요' : 'Helpful'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={feedbackRating === 'down' ? 'secondary' : 'outline'}
                aria-pressed={feedbackRating === 'down'}
                aria-label={
                  displayLanguage === 'ko'
                    ? '이 답변을 아쉬움으로 평가'
                    : 'Mark this answer as not quite right'
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
                {displayLanguage === 'ko' ? '아쉬워요' : 'Not quite'}
              </Button>
            </div>

            {feedbackState === 'editing-down' && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_REASON_OPTIONS.map((option) => {
                    const selected = selectedFeedbackReasons.includes(
                      option.key
                    );

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
                              ? currentReasons.filter(
                                  (key) => key !== option.key
                                )
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
                      setIsFeedbackOpen(false);
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
          </div>
        )}
      </div>
    </section>
  );
}

function SourceEvidenceCard({
  sourceItem,
  language,
  debug,
}: {
  sourceItem: DisplaySourceItem;
  language: 'ko' | 'en';
  debug: boolean;
}) {
  const { source, title: sourceTitle, sectionPath, count } = sourceItem;

  return (
    <article
      title={debug ? formatSourceTitle(source) : undefined}
      className="bg-background/70 min-w-0 break-inside-avoid rounded-lg border px-3 py-2"
    >
      <div className="flex min-w-0 items-start gap-2">
        <BookOpenCheck className="text-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-xs font-medium">{sourceTitle}</p>
          {sectionPath && (
            <p className="text-muted-foreground truncate text-[11px]">
              {sectionPath}
            </p>
          )}
        </div>
        {count > 1 && !debug && (
          <span className="bg-muted text-muted-foreground shrink-0 rounded-md border px-1.5 py-0.5 text-[10px]">
            {language === 'ko' ? `${count}개` : `x${count}`}
          </span>
        )}
      </div>

      {debug && (
        <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
          {source.entity_id && (
            <span className="bg-muted text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-[11px]">
              entity_id: {source.entity_id}
            </span>
          )}
          <span className="bg-muted text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-[11px]">
            score: {formatScore(source.score)}
          </span>
          <span className="bg-muted text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-[11px]">
            visibility: {source.visibility}
          </span>
        </div>
      )}
    </article>
  );
}

function buildDisplaySourceItems({
  sources,
  language,
  debug,
}: {
  sources: RagSource[];
  language: 'ko' | 'en';
  debug: boolean;
}): DisplaySourceItem[] {
  if (debug) {
    return sources.map((source, index) => ({
      key: source.chunk_id,
      source,
      title: `S${index + 1}. ${source.chunk_id}`,
      sectionPath: formatSectionPathLabel(source, language),
      count: 1,
    }));
  }

  const sourceGroups = new Map<string, DisplaySourceItem>();

  for (const source of sources) {
    const title = formatPublicSourceTitle(source, language);
    const rawSectionPath = formatSectionPathLabel(source, language);
    const sectionPath = rawSectionPath === title ? '' : rawSectionPath;
    const key = `${title}::${sectionPath}`;
    const existingSource = sourceGroups.get(key);

    if (existingSource) {
      existingSource.count += 1;
      continue;
    }

    sourceGroups.set(key, {
      key,
      source,
      title,
      sectionPath,
      count: 1,
    });
  }

  return Array.from(sourceGroups.values());
}

function shouldShowFeedbackForAnswerSource(answerSource?: string) {
  return ![
    undefined,
    'smalltalk',
    'off_topic_redirect',
    'clarify',
    'private_guardrail',
    'prompt_guardrail',
  ].includes(answerSource);
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

    return '충분한 답변이 되었나요?';
  }

  if (state === 'saving') return 'Saving feedback...';
  if (state === 'saved') return 'Thanks. Feedback saved.';
  if (state === 'error') return 'Feedback could not be saved.';
  if (state === 'editing-down') return 'What should be improved?';
  if (rating === 'up') return 'Thanks for the feedback.';
  if (rating === 'down') return 'Thanks. This answer can be improved.';

  return 'Was this answer useful enough?';
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
    confidenceSignals: parseConfidenceSignals(value.confidenceSignals),
    matchedEntityIds: parseStringArray(value.matchedEntityIds),
    hasTodoEvidence: value.hasTodoEvidence === true,
    warnings: parseStringArray(value.warnings),
    faqId: parseString(value.faqId) ?? undefined,
    matchedFaqId: parseString(value.matchedFaqId) ?? undefined,
    renderSpecKey: parseString(value.renderSpecKey) ?? undefined,
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
    errorCode: parseString(value.errorCode) ?? undefined,
    showEvidence:
      typeof value.showEvidence === 'boolean' ? value.showEvidence : undefined,
    routeDecision: parseRouteDecision(value.routeDecision),
  };
}

function parseRouteDecision(value: unknown) {
  if (!isRecord(value)) return undefined;

  const mode = parseString(value.mode) ?? undefined;
  const reason = parseString(value.reason) ?? undefined;
  if (!mode && !reason) return undefined;

  return { mode, reason };
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
    freshness: parseString(value.freshness) ?? undefined,
    has_todo: value.has_todo === true,
  };
}

function parseConfidenceSignals(value: unknown): AnswerConfidence | undefined {
  if (!isRecord(value)) return undefined;

  return {
    retrieval: normalizeConfidence(value.retrieval),
    intent: normalizeConfidence(value.intent),
    freshness: normalizeConfidence(value.freshness),
    grounding: normalizeConfidence(value.grounding),
    final: normalizeConfidence(value.final),
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
  if (confidence >= 0.78) {
    return {
      label: language === 'ko' ? '근거 충분' : 'Well grounded',
      className:
        'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/70 dark:bg-emerald-950/30 dark:text-emerald-200',
    };
  }

  if (confidence >= 0.5) {
    return {
      label: language === 'ko' ? '일부 정보 확인 중' : 'Partially grounded',
      className:
        'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700/70 dark:bg-blue-950/30 dark:text-blue-200',
    };
  }

  return {
    label: language === 'ko' ? '근거 부족' : 'Limited evidence',
    className:
      'border-zinc-300 bg-zinc-50 text-zinc-800 dark:border-zinc-700/70 dark:bg-zinc-900/40 dark:text-zinc-200',
  };
}

function getAnswerSourceLabel(metadata: RagMetadata, language: 'ko' | 'en') {
  const labels: Record<string, Record<'ko' | 'en', string>> = {
    faq_cache: { ko: '포트폴리오 답변', en: 'Portfolio answer' },
    philosophy_docs: {
      ko: 'Visionary Builder Docs',
      en: 'Visionary Builder Docs',
    },
    faq_rewrite: {
      ko: '포트폴리오 답변',
      en: 'Portfolio answer',
    },
    answer_cache: {
      ko: '캐시된 포트폴리오 답변',
      en: 'Cached portfolio answer',
    },
    deterministic_rule: { ko: '포트폴리오 정책', en: 'Portfolio policy' },
    smalltalk: { ko: '가벼운 대화', en: 'Small talk' },
    off_topic_redirect: {
      ko: '포트폴리오 안내',
      en: 'Portfolio redirect',
    },
    clarify: { ko: '질문 확인', en: 'Clarifying question' },
    private_guardrail: {
      ko: '공개 불가 안내',
      en: 'Public safety notice',
    },
    prompt_guardrail: {
      ko: '내부 정보 보호 안내',
      en: 'Internal safety notice',
    },
    rag_generation: {
      ko: '포트폴리오 데이터 기반',
      en: 'Based on portfolio data',
    },
    rag_groq: { ko: '포트폴리오 데이터 기반', en: 'Based on portfolio data' },
    rag_google: { ko: '포트폴리오 데이터 기반', en: 'Based on portfolio data' },
    rag_openai: { ko: '포트폴리오 데이터 기반', en: 'Based on portfolio data' },
    rag_xai: { ko: '포트폴리오 데이터 기반', en: 'Based on portfolio data' },
    fallback: { ko: '기본 포트폴리오 답변', en: 'Basic portfolio answer' },
    insufficient_evidence: {
      ko: '근거 부족',
      en: 'Insufficient evidence',
    },
  };

  if (!metadata.answerSource) return null;
  return labels[metadata.answerSource]?.[language] ?? metadata.answerSource;
}

function getPublicSourceBadgeText(
  count: number,
  language: 'ko' | 'en',
  answerSource?: string
) {
  if (count === 0) {
    return language === 'ko' ? '근거 부족' : 'Limited evidence';
  }

  if (answerSource === 'philosophy_docs') {
    if (language === 'ko') {
      return `Visionary Builder Docs · ${count}개 출처`;
    }
    return `Visionary Builder Docs · ${count} source${count === 1 ? '' : 's'}`;
  }

  if (language === 'ko') return `Oosu Wiki 기반 · ${count}개 출처`;
  return `From Oosu Wiki · ${count} source${count === 1 ? '' : 's'}`;
}

function getRemainingSourcesButtonLabel({
  count,
  expanded,
  language,
  debug,
}: {
  count: number;
  expanded: boolean;
  language: 'ko' | 'en';
  debug: boolean;
}) {
  if (debug) {
    if (language === 'ko') return expanded ? '접기' : `+${count}개 더`;
    return expanded ? 'Collapse' : `+${count} more`;
  }

  if (expanded) {
    return language === 'ko' ? '근거 접기' : 'Hide sources';
  }

  return language === 'ko' ? '근거 보기' : 'View sources';
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

function formatPublicSourceTitle(source: RagSource, language: 'ko' | 'en') {
  const chunkLabel = formatPublicChunkLabel(source.chunk_id, language);
  if (chunkLabel) return chunkLabel;

  const entityLabel = source.entity_id
    ? formatEntityLabel(source.entity_id, language)
    : null;
  if (entityLabel && entityLabel !== source.entity_id) return entityLabel;

  if (source.section_path.length > 0) {
    return humanizeSourcePathSegment(source.section_path[0]);
  }

  if (source.title && source.title !== 'Oosu Wiki') {
    return humanizeSourcePathSegment(source.title);
  }

  return language === 'ko' ? 'Oosu Wiki' : 'Oosu Wiki';
}

function formatSectionPathLabel(source: RagSource, language: 'ko' | 'en') {
  const chunkContext = formatPublicChunkContext(source.chunk_id, language);
  if (chunkContext) return chunkContext;

  const path =
    source.section_path.length > 0
      ? source.section_path
      : source.title
        ? [source.title]
        : [];
  const label = path.map(humanizeSourcePathSegment).filter(Boolean).join(' > ');

  if (label) return label;
  return language === 'ko' ? 'Oosu Wiki' : 'Oosu Wiki';
}

function formatPublicChunkLabel(chunkId: string, language: 'ko' | 'en') {
  const exactLabel = SOURCE_CHUNK_LABELS[chunkId]?.[language];
  if (exactLabel) return exactLabel;

  if (chunkId.startsWith('faq.')) {
    return language === 'ko' ? 'FAQ 답변 근거' : 'FAQ answer source';
  }

  if (chunkId.startsWith('project.')) {
    return humanizeSourcePathSegment(chunkId.replace(/^project\./, ''));
  }

  if (chunkId.startsWith('profile.')) {
    return language === 'ko' ? '프로필 Wiki 항목' : 'Profile Wiki entry';
  }

  if (chunkId.startsWith('skills.')) {
    return language === 'ko' ? '기술 스택 Wiki 항목' : 'Skills Wiki entry';
  }

  if (chunkId.startsWith('career.')) {
    return language === 'ko' ? '커리어 Wiki 항목' : 'Career Wiki entry';
  }

  return null;
}

function formatPublicChunkContext(chunkId: string, language: 'ko' | 'en') {
  const exactContext = SOURCE_CHUNK_CONTEXTS[chunkId]?.[language];
  if (exactContext) return exactContext;

  if (chunkId.startsWith('project.')) {
    return language === 'ko' ? '프로젝트 Wiki' : 'Project Wiki';
  }

  if (chunkId.startsWith('profile.')) {
    return language === 'ko' ? '프로필 Wiki' : 'Profile Wiki';
  }

  if (chunkId.startsWith('skills.')) {
    return language === 'ko' ? '기술 Wiki' : 'Skills Wiki';
  }

  if (chunkId.startsWith('career.')) {
    return language === 'ko' ? '커리어 Wiki' : 'Career Wiki';
  }

  return null;
}

function humanizeSourcePathSegment(segment: string) {
  const trimmedSegment = segment.trim();
  if (!trimmedSegment) return '';

  const projectId = normalizeProjectEntityId(trimmedSegment);
  if (projectId) return PROJECT_CARDS[projectId].title;

  const knownLabel = SOURCE_SEGMENT_LABELS[trimmedSegment.toLowerCase()];
  if (knownLabel) return knownLabel;

  return trimmedSegment
    .replace(/[-_./]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const lowerWord = word.toLowerCase();
      const knownWord = SOURCE_WORD_LABELS[lowerWord];
      if (knownWord) return knownWord;

      return `${lowerWord.charAt(0).toUpperCase()}${lowerWord.slice(1)}`;
    })
    .join(' ');
}

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

function formatConfidenceSignals(signals: AnswerConfidence) {
  return [
    `confidence.retrieval: ${formatDebugConfidence(signals.retrieval)}`,
    `confidence.intent: ${formatDebugConfidence(signals.intent)}`,
    `confidence.freshness: ${formatDebugConfidence(signals.freshness)}`,
    `confidence.grounding: ${formatDebugConfidence(signals.grounding)}`,
    `confidence.final: ${formatDebugConfidence(signals.final)}`,
  ];
}

function formatDebugConfidence(confidence: number) {
  return confidence.toFixed(2);
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
