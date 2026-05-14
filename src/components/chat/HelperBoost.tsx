import { useSuggestedQuestions } from '@/hooks/use-suggested-questions';
import type { QuestionSurface } from '@/data/question-surfaces.shared';
import { getUiText } from '@/lib/i18n';
import type { SuggestedQuestion } from '@/lib/suggested-questions';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Layers,
  LibraryBig,
  Mail,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';
import type { ElementType } from 'react';
import { useEffect, useState } from 'react';

interface HelperBoostProps {
  submitQuery?: (query: string, suggestedQuestion?: SuggestedQuestion) => void;
  setInput?: (value: string) => void;
  activeSurface?: QuestionSurface;
  conversationId?: string | null;
  hasReachedLimit?: boolean;
}

const questionConfig: Record<string, { color: string; icon: ElementType }> = {
  'home.projects.top3': { color: '#246BFE', icon: BriefcaseBusiness },
  'home.profile.intro': { color: '#188B75', icon: MessageSquareText },
  'home.skills.level': { color: '#856ED9', icon: Layers },
  'home.ai.workflow': { color: '#0F8AA3', icon: LibraryBig },
  'home.contact': { color: '#C19433', icon: Mail },
  'project.askoosu.overview': { color: '#D04E6B', icon: Sparkles },
  'project.askoosu.rag': { color: '#A15C1F', icon: Layers },
  'project.askoosu.visual_ui': { color: '#8B5CF6', icon: LibraryBig },
  'project.askoosu.deployment': { color: '#246BFE', icon: BriefcaseBusiness },
};

export default function HelperBoost({
  submitQuery,
  activeSurface = 'home',
  conversationId = null,
  hasReachedLimit = false,
}: HelperBoostProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { language } = useDisplayPreferences();
  const text = getUiText(language);
  const { visibleQuestions, askedQuestionIds } = useSuggestedQuestions(
    5,
    activeSurface,
    conversationId
  );
  const askedQuestionSet = new Set(askedQuestionIds);

  useEffect(() => {
    setIsVisible(true);
  }, [activeSurface]);

  return (
    <div className="w-full">
      {isVisible && (
        <div
          id="quick-question-starters"
          className="custom-scrollbar mb-2 w-full max-w-full touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain px-2 [-webkit-overflow-scrolling:touch]"
        >
          <div className="flex w-max min-w-full flex-nowrap justify-center gap-2 md:gap-3">
            {visibleQuestions.map((question) => {
              const isAsked = askedQuestionSet.has(question.id);
              const { color, icon: Icon } = questionConfig[question.id] ?? {
                color: '#64748B',
                icon: Sparkles,
              };

              return (
                <button
                  type="button"
                  key={question.id}
                  onClick={() => {
                    if (!submitQuery) return;
                    submitQuery(question.displayQuestion, question);
                  }}
                  className={`focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-auto w-fit max-w-[82vw] shrink-0 snap-center items-center justify-start gap-2.5 overflow-hidden rounded-2xl border bg-clip-padding px-3.5 py-2.5 text-left whitespace-nowrap backdrop-blur-2xl backdrop-contrast-125 backdrop-saturate-150 transition-all outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.22),transparent_52%)] before:opacity-60 focus-visible:ring-[3px] md:max-w-[25rem] md:px-4 md:py-3 dark:before:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.12),transparent_52%)] ${
                    hasReachedLimit
                      ? 'border-border/50 cursor-pointer bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))] opacity-70 active:scale-[0.98] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]'
                      : isAsked
                        ? 'cursor-pointer border-slate-200/55 bg-white/20 text-slate-400 shadow-none hover:bg-white/30 active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-500 dark:hover:bg-white/[0.06]'
                      : 'text-foreground/90 cursor-pointer border-white/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035))] shadow-[inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(255,255,255,0.07),0_10px_30px_rgba(15,23,42,0.06)] hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.055))] active:scale-[0.98] dark:border-white/18 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(255,255,255,0.035),0_10px_30px_rgba(0,0,0,0.16)] dark:hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.11),rgba(255,255,255,0.03))]'
                  }`}
                  aria-label={
                    isAsked
                      ? `Already asked starter question: ${question.displayQuestion}`
                      : `Ask starter question: ${question.displayQuestion}`
                  }
                >
                  <div className="relative z-10 flex min-w-0 items-center gap-2.5">
                    <Icon
                      className="shrink-0"
                      size={17}
                      strokeWidth={2}
                      color={isAsked ? '#CBD5E1' : color}
                    />
                    <span
                      className={`min-w-0 truncate text-sm leading-snug font-medium md:text-base ${
                        isAsked ? 'text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {question.quickLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        className={
          isVisible ? 'mb-2 flex justify-center' : 'mb-0 flex justify-center'
        }
      >
        <button
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          className="text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 bg-background/20 flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-xs backdrop-blur-xl transition-colors outline-none focus-visible:ring-[3px] dark:border-white/10 dark:bg-white/[0.06]"
          aria-controls="quick-question-starters"
          aria-expanded={isVisible}
          aria-label={
            isVisible ? 'Hide starter questions' : 'Show starter questions'
          }
        >
          {isVisible ? (
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
      </div>
    </div>
  );
}
