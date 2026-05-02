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
          className="mb-2 flex w-full flex-wrap gap-1 md:gap-3"
          style={{ justifyContent: 'safe center' }}
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
                }}
                variant="outline"
                className={`h-auto min-w-[100px] flex-shrink-0 rounded-lg border px-4 py-3 whitespace-normal shadow-none backdrop-blur-sm transition-none ${
                  hasReachedLimit
                    ? 'border-border bg-muted cursor-not-allowed opacity-50'
                    : 'border-border hover:bg-accent bg-background/80 cursor-pointer active:scale-95'
                }`}
                disabled={hasReachedLimit}
              >
                <div className="text-foreground flex items-center gap-3">
                  <Icon size={18} strokeWidth={2} color={color} />
                  <span className="text-sm leading-snug font-medium">
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
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 px-3 py-1 text-xs transition-colors"
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
