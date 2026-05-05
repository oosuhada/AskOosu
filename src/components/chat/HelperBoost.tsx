import { useSuggestedQuestions } from '@/hooks/use-suggested-questions';
import { getUiText } from '@/lib/i18n';
import type {
  SuggestedQuestion,
  SuggestedQuestionId,
} from '@/lib/suggested-questions';
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
import { useState } from 'react';

interface HelperBoostProps {
  submitQuery?: (query: string, suggestedQuestion?: SuggestedQuestion) => void;
  setInput?: (value: string) => void;
  hasReachedLimit?: boolean;
}

const questionConfig: Record<
  SuggestedQuestionId,
  { color: string; icon: ElementType }
> = {
  bestProjects: { color: '#246BFE', icon: BriefcaseBusiness },
  developerType: { color: '#188B75', icon: MessageSquareText },
  nowBuilding: { color: '#D04E6B', icon: Sparkles },
  techStack: { color: '#856ED9', icon: Layers },
  aiUsage: { color: '#0F8AA3', icon: LibraryBig },
  fullstackAiGrowth: { color: '#A15C1F', icon: Layers },
  conversationalPortfolio: { color: '#8B5CF6', icon: LibraryBig },
  contactCollab: { color: '#C19433', icon: Mail },
};

export default function HelperBoost({
  submitQuery,
  hasReachedLimit = false,
}: HelperBoostProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { language } = useDisplayPreferences();
  const text = getUiText(language);
  const { visibleQuestions, markQuestionAsked } = useSuggestedQuestions(5);

  return (
    <div className="w-full">
      {isVisible && (
        <div
          id="quick-question-starters"
          className="-mx-2 mb-2 flex snap-x gap-2 overflow-x-auto px-2 pb-1 md:mx-0 md:flex-wrap md:justify-center md:gap-3 md:overflow-visible md:px-0 md:pb-0"
        >
          {visibleQuestions.map((question) => {
            const { color, icon: Icon } = questionConfig[question.id];

            return (
              <button
                type="button"
                key={question.id}
                onClick={() => {
                  if (!submitQuery || hasReachedLimit) return;
                  markQuestionAsked(question.id);
                  submitQuery(question.displayQuestion, question);
                  setIsVisible(false);
                }}
                className={`focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-auto w-fit max-w-[82vw] shrink-0 snap-center items-center justify-start gap-2.5 overflow-hidden rounded-2xl border bg-clip-padding px-3.5 py-2.5 text-left whitespace-normal backdrop-blur-2xl backdrop-contrast-125 backdrop-saturate-150 transition-all outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.22),transparent_52%)] before:opacity-60 focus-visible:ring-[3px] md:max-w-[25rem] md:px-4 md:py-3 dark:before:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.12),transparent_52%)] ${
                  hasReachedLimit
                    ? 'border-border/50 cursor-not-allowed bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))] opacity-50 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]'
                    : 'text-foreground/90 cursor-pointer border-white/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035))] shadow-[inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(255,255,255,0.07),0_10px_30px_rgba(15,23,42,0.06)] hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.055))] active:scale-[0.98] dark:border-white/18 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(255,255,255,0.035),0_10px_30px_rgba(0,0,0,0.16)] dark:hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.11),rgba(255,255,255,0.03))]'
                }`}
                disabled={hasReachedLimit}
                aria-label={`Ask starter question: ${question.displayQuestion}`}
              >
                <div className="relative z-10 flex min-w-0 items-center gap-2.5">
                  <Icon
                    className="shrink-0"
                    size={17}
                    strokeWidth={2}
                    color={color}
                  />
                  <span className="line-clamp-2 min-w-0 text-sm leading-snug font-medium md:text-base">
                    {question.quickLabel}
                  </span>
                </div>
              </button>
            );
          })}
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
