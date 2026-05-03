'use client';

import FluidCursor from '@/components/FluidCursor';
import { OosuAvatar } from '@/components/oosu-avatar';
import { PortfolioSidebar } from '@/components/portfolio-sidebar';
import { Button } from '@/components/ui/button';
import WelcomeModal from '@/components/welcome-modal';
import { useSuggestedQuestions } from '@/hooks/use-suggested-questions';
import { getUiText } from '@/lib/i18n';
import { buildChatHref } from '@/lib/navigation';
import { oosuProfile } from '@/lib/oosu-profile';
import type { SuggestedQuestionId } from '@/lib/suggested-questions';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Layers,
  LibraryBig,
  MessageSquareText,
  Sparkles,
  UserRoundSearch,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ElementType } from 'react';
import { Suspense, useRef, useState } from 'react';

const questionConfig: Record<
  SuggestedQuestionId,
  { color: string; icon: ElementType }
> = {
  bestProjects: { color: '#246BFE', icon: BriefcaseBusiness },
  developerType: { color: '#188B75', icon: MessageSquareText },
  nowBuilding: { color: '#D04E6B', icon: Sparkles },
  techStack: { color: '#6E57C9', icon: Layers },
  aiUsage: { color: '#0F8AA3', icon: LibraryBig },
  fullstackAiGrowth: { color: '#A15C1F', icon: Layers },
  conversationalPortfolio: { color: '#8B5CF6', icon: LibraryBig },
  contactCollab: { color: '#C19433', icon: UserRoundSearch },
};

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
  const { language, theme } = useDisplayPreferences();
  const { visibleQuestions, markQuestionAsked, markQueryAsked } =
    useSuggestedQuestions(5);
  const text = getUiText(language);

  const goToChat = (query: string) => {
    markQueryAsked(query);
    router.push(buildChatHref({ query, language, theme }));
  };

  const startNewChat = () => {
    const params = new URLSearchParams({ lang: language, theme });
    router.push(`/chat?${params.toString()}`);
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-10 md:pb-20">
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
        className="z-1 mt-24 mb-8 flex flex-col items-center text-center md:mt-4 md:mb-12"
        variants={topElementVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="z-100">
          <WelcomeModal />
        </div>

        <h2 className="text-secondary-foreground mt-1 text-xl font-semibold md:text-2xl">
          {oosuProfile.name}
        </h2>
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          {oosuProfile.title}
        </h1>
      </motion.div>

      <OosuAvatar
        priority
        interval={150}
        className="relative z-10 h-56 w-52 sm:h-72 sm:w-72"
      />

      {/* input + quick buttons */}
      <motion.div
        variants={bottomElementVariants}
        initial="hidden"
        animate="visible"
        className="z-10 mt-4 flex w-full flex-col items-center justify-center md:px-0"
      >
        {/* free-form question */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) goToChat(input.trim());
          }}
          className="relative w-full max-w-lg"
        >
          <div className="border-border bg-background/50 hover:border-ring mx-auto flex items-center rounded-full border py-2.5 pr-2 pl-6 backdrop-blur-lg transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={text.askAnything}
              className="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-base focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Submit question"
              className="flex items-center justify-center rounded-full bg-[#0171E3] p-2.5 text-white transition-colors hover:bg-blue-600 disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={() =>
            setIsQuickQuestionsVisible((currentValue) => !currentValue)
          }
          className="text-muted-foreground hover:text-foreground mt-3 flex items-center gap-1 px-3 py-1 text-xs transition-colors"
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

        {/* quick-question grid */}
        {isQuickQuestionsVisible && (
          <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleQuestions.map((question) => {
              const { color, icon: Icon } = questionConfig[question.id];

              return (
                <Button
                  key={question.id}
                  onClick={() => {
                    markQuestionAsked(question.id);
                    goToChat(question.text);
                  }}
                  variant="outline"
                  className="border-border hover:bg-accent bg-background/55 min-h-14 w-full cursor-pointer rounded-lg border px-4 py-3 whitespace-normal shadow-none backdrop-blur-lg active:scale-95"
                >
                  <div className="text-foreground flex h-full w-full items-center justify-start gap-3 text-left">
                    <Icon
                      className="shrink-0"
                      size={20}
                      strokeWidth={2}
                      color={color}
                    />
                    <span className="text-foreground text-sm leading-snug font-medium">
                      {question.text}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </motion.div>
      <FluidCursor />
    </div>
  );
}
