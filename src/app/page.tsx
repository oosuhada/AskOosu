'use client';

import FluidCursor from '@/components/FluidCursor';
import { HomeJsonLd } from '@/components/seo/json-ld';
import { TealCyanLottieButtonIcon } from '@/components/chat/teal-cyan-lottie-button-icon';
import { OosuAvatar } from '@/components/oosu-avatar';
import { PortfolioSidebar } from '@/components/portfolio-sidebar';
import { Button } from '@/components/ui/button';
import WelcomeModal from '@/components/welcome-modal';
import { useSuggestedQuestions } from '@/hooks/use-suggested-questions';
import { getUiText } from '@/lib/i18n';
import { buildChatHref } from '@/lib/navigation';
import { oosuProfile } from '@/lib/oosu-profile';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import { motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Layers,
  LibraryBig,
  MessageSquareText,
  Sparkles,
  UserRoundSearch,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  ElementType,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from 'react';
import { Suspense, useRef, useState } from 'react';

const questionConfig: Record<string, { color: string; icon: ElementType }> = {
  'home.profile.intro': { color: '#188B75', icon: MessageSquareText },
  'home.projects.top3': { color: '#246BFE', icon: BriefcaseBusiness },
  'home.skills.level': { color: '#6E57C9', icon: Layers },
  'home.ai.workflow': { color: '#0F8AA3', icon: LibraryBig },
  'home.contact': { color: '#C19433', icon: UserRoundSearch },
  bestProjects: { color: '#246BFE', icon: BriefcaseBusiness },
  developerType: { color: '#188B75', icon: MessageSquareText },
  nowBuilding: { color: '#D04E6B', icon: Sparkles },
  techStack: { color: '#6E57C9', icon: Layers },
  aiUsage: { color: '#0F8AA3', icon: LibraryBig },
  fullstackAiGrowth: { color: '#A15C1F', icon: Layers },
  conversationalPortfolio: { color: '#8B5CF6', icon: LibraryBig },
  contactCollab: { color: '#C19433', icon: UserRoundSearch },
};

const aeoLinks = [
  {
    href: '/ai-director',
    label: 'AI Director',
    description: 'Working thesis',
  },
  {
    href: '/ai-era-developer',
    label: 'AI-era developer',
    description: 'Competitiveness',
  },
  {
    href: '/projects/askoosu',
    label: 'AskOosu',
    description: 'RAG portfolio',
  },
];

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [input, setInput] = useState('');
  const [isQuickQuestionsVisible, setIsQuickQuestionsVisible] = useState(true);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const quickQuestionRailRef = useRef<HTMLDivElement | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const isDraggingRailRef = useRef(false);
  const suppressRailClickRef = useRef(false);
  const { language, theme } = useDisplayPreferences();
  const {
    visibleQuestions,
    askedQuestionIds,
    markQuestionAsked,
    markQueryAsked,
  } =
    useSuggestedQuestions(5);
  const askedQuestionSet = new Set(askedQuestionIds);
  const text = getUiText(language);

  const goToChat = (query: string) => {
    markQueryAsked(query);
    router.push(buildChatHref({ query, language, theme }));
  };

  const startNewChat = () => {
    const params = new URLSearchParams({ lang: language, theme });
    router.push(`/chat?${params.toString()}`);
  };

  const handleQuickQuestionWheel = (
    event: ReactWheelEvent<HTMLDivElement>
  ) => {
    const rail = quickQuestionRailRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;

    const scrollDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    if (scrollDelta === 0) return;

    event.preventDefault();
    rail.scrollLeft += scrollDelta;
  };

  const handleQuickQuestionPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const rail = quickQuestionRailRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;

    isDraggingRailRef.current = true;
    suppressRailClickRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = rail.scrollLeft;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture can be unavailable for synthetic or cancelled gestures.
    }
  };

  const handleQuickQuestionPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (!isDraggingRailRef.current) return;
    const rail = quickQuestionRailRef.current;
    if (!rail) return;

    const deltaX = event.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 4) {
      suppressRailClickRef.current = true;
    }

    event.preventDefault();
    rail.scrollLeft = dragStartScrollLeftRef.current - deltaX;
  };

  const handleQuickQuestionPointerEnd = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (!isDraggingRailRef.current) return;
    isDraggingRailRef.current = false;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released after a cancelled gesture.
    }
  };

  const handleQuickQuestionClickCapture = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    if (!suppressRailClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressRailClickRef.current = false;
  };

  /* hero animations (unchanged) */
  const topElementVariants = {
    hidden: { opacity: 0, y: -60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'ease', duration: 0.8 },
    },
  };
  const bottomElementVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'ease', duration: 0.8, delay: 0.2 },
    },
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-start overflow-x-hidden px-4 pt-20 pb-32 md:min-h-screen md:px-8 md:pt-12 md:pb-44">
      <HomeJsonLd />
      <PortfolioSidebar onNewChat={startNewChat} />

      {/* big blurred footer word */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
        <div
          className="hidden bg-gradient-to-b from-neutral-500/10 to-neutral-500/0 bg-clip-text text-[8rem] leading-none font-black text-transparent select-none sm:block lg:text-[13rem]"
          style={{ marginBottom: '-2.5rem' }}
        >
          AskOosu
        </div>
      </div>

      {/* header */}
      <motion.div
        className="relative z-10 mb-6 flex w-full max-w-7xl flex-col items-center text-center md:mt-4 md:mb-9"
        variants={topElementVariants}
        initial={false}
        animate="visible"
      >
        <div className="z-100 mb-5">
          <WelcomeModal />
        </div>

        <h2 className="text-secondary-foreground text-base font-semibold md:text-xl">
          {oosuProfile.name}
        </h2>
        <h1 className="mt-3 max-w-[22rem] text-4xl leading-tight font-bold sm:max-w-2xl sm:text-5xl md:max-w-4xl md:text-6xl lg:text-7xl">
          <span className="block">AI-connected</span>
          <span className="block">Fullstack Developer</span>
        </h1>
        <nav
          aria-label="Featured portfolio pages"
          className="mt-5 flex max-w-3xl flex-wrap justify-center gap-2"
        >
          {aeoLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-background/35 hover:bg-background/65 text-foreground/80 rounded-full border border-white/55 px-3 py-1.5 text-xs font-medium backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/[0.08] dark:hover:bg-white/[0.14]"
            >
              <span>{link.label}</span>
              <span className="text-muted-foreground ml-1 hidden sm:inline">
                {link.description}
              </span>
            </Link>
          ))}
        </nav>
      </motion.div>

      <OosuAvatar
        priority
        interval={150}
        className="relative z-10 h-32 w-32 sm:h-44 sm:w-44 md:h-64 md:w-64 lg:h-72 lg:w-72"
      />

      {/* quick buttons */}
      <motion.div
        variants={bottomElementVariants}
        initial={false}
        animate="visible"
        className="fixed inset-x-0 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.75rem)] z-30 flex w-full flex-col items-center px-4 md:px-[calc(72px+2rem)]"
      >
        {isQuickQuestionsVisible && (
          <div
            ref={quickQuestionRailRef}
            id="home-quick-questions"
            className="custom-scrollbar w-full max-w-5xl cursor-grab touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain px-2 active:cursor-grabbing [-webkit-overflow-scrolling:touch]"
            onWheel={handleQuickQuestionWheel}
            onPointerDown={handleQuickQuestionPointerDown}
            onPointerMove={handleQuickQuestionPointerMove}
            onPointerUp={handleQuickQuestionPointerEnd}
            onPointerCancel={handleQuickQuestionPointerEnd}
            onPointerLeave={handleQuickQuestionPointerEnd}
            onClickCapture={handleQuickQuestionClickCapture}
          >
            <div className="flex w-max min-w-full flex-nowrap justify-center gap-2 md:gap-3">
              {visibleQuestions.map((question) => {
                const isAsked = askedQuestionSet.has(question.id);
                const { color, icon: Icon } = questionConfig[question.id] ?? {
                  color: '#64748B',
                  icon: Sparkles,
                };
                const chatHref = buildChatHref({
                  query: question.displayQuestion,
                  language,
                  theme,
                  starterQuestionId: question.id,
                  faqId: question.faqId,
                  intentId: question.intentId,
                  displayQuestion: question.displayQuestion,
                  originalQuickLabel: question.quickLabel,
                  answerVariant: question.answerVariant,
                  renderSpec: question.renderSpec,
                  source: 'quick_question',
                });

                return (
                  <Button
                    key={question.id}
                    asChild
                    variant="outline"
                    className={`min-h-12 w-fit max-w-[82vw] shrink-0 cursor-pointer snap-center justify-start gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left whitespace-nowrap backdrop-blur-xl active:scale-[0.98] md:max-w-[25rem] md:px-4 md:py-3 ${
                      isAsked
                        ? 'border-slate-200/60 bg-white/20 text-slate-400 shadow-none hover:bg-white/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-500 dark:hover:bg-white/[0.06]'
                        : 'bg-background/35 hover:bg-background/60 text-foreground/90 border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_30px_rgba(15,23,42,0.1)] dark:border-white/15 dark:bg-white/[0.11] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.28)] dark:hover:bg-white/[0.16]'
                    }`}
                  >
                    <Link
                      href={chatHref}
                      onClick={(event) => {
                        event.preventDefault();
                        markQuestionAsked(question.id);
                        router.push(chatHref);
                      }}
                      aria-label={`Ask starter question: ${question.displayQuestion}`}
                    >
                      <Icon
                        className="shrink-0"
                        size={18}
                        strokeWidth={2}
                        color={isAsked ? '#CBD5E1' : color}
                      />
                      <span
                        className={`min-w-0 truncate text-sm leading-snug font-medium md:text-base ${
                          isAsked
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-foreground'
                        }`}
                      >
                        {question.quickLabel}
                      </span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setIsQuickQuestionsVisible((currentValue) => !currentValue)
          }
          aria-controls="home-quick-questions"
          aria-expanded={isQuickQuestionsVisible}
          className="text-muted-foreground hover:text-foreground bg-background/20 mt-2 flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-xs backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/[0.06]"
        >
          {isQuickQuestionsVisible ? (
            <>
              <ChevronDown size={14} />
              {text.hideQuickQuestions}
            </>
          ) : (
            <>
              <ChevronUp size={14} />
              {text.showQuickQuestions}
            </>
          )}
        </button>
      </motion.div>

      {/* free-form question */}
      <motion.div
        variants={bottomElementVariants}
        initial={false}
        animate="visible"
        className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 md:inset-x-[calc(72px+2rem)]"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) goToChat(input.trim());
          }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="hover:border-ring bg-background/50 mx-auto flex min-h-14 items-center rounded-full border border-white/55 py-2 pr-2 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_36px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-all dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_40px_rgba(0,0,0,0.32)]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={text.askAnything}
              className="text-foreground placeholder:text-muted-foreground/80 h-9 w-full border-none bg-transparent text-base focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Submit question"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-[1.03] disabled:opacity-70"
            >
              <TealCyanLottieButtonIcon />
            </button>
          </div>
        </form>
      </motion.div>
      <FluidCursor />
    </div>
  );
}
