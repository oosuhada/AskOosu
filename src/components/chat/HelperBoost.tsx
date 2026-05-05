import { Button } from '@/components/ui/button';
import { useSuggestedQuestions } from '@/hooks/use-suggested-questions';
import { getUiText } from '@/lib/i18n';
import type { SuggestedQuestionId } from '@/lib/suggested-questions';
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
  submitQuery?: (query: string) => void;
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
              <Button
                key={question.id}
                onClick={() => {
                  if (!submitQuery || hasReachedLimit) return;
                  markQuestionAsked(question.id);
                  submitQuery(question.text);
                  setIsVisible(false);
                }}
                variant="outline"
                className={`h-auto w-fit max-w-[82vw] shrink-0 snap-center justify-start gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left whitespace-normal shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all md:max-w-[25rem] md:px-4 md:py-3 ${
                  hasReachedLimit
                    ? 'border-border/60 bg-muted/50 cursor-not-allowed opacity-50'
                    : 'bg-background/35 hover:bg-background/60 text-foreground/90 cursor-pointer border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_30px_rgba(15,23,42,0.1)] active:scale-[0.98] dark:border-white/15 dark:bg-white/[0.11] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.28)] dark:hover:bg-white/[0.16]'
                }`}
                disabled={hasReachedLimit}
                aria-label={`Ask starter question: ${question.text}`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Icon
                    className="shrink-0"
                    size={17}
                    strokeWidth={2}
                    color={color}
                  />
                  <span className="line-clamp-2 min-w-0 text-sm leading-snug font-medium md:text-base">
                    {question.text}
                  </span>
                </div>
              </Button>
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
