import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getLocalizedQuestions, getUiText } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  BriefcaseIcon,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleEllipsis,
  CodeIcon,
  GraduationCapIcon,
  Layers,
  LibraryBig,
  MailIcon,
  Sparkles,
  UserRoundSearch,
  UserSearch,
  MessageSquareText,
} from 'lucide-react';
import { useState } from 'react';
import { Drawer } from 'vaul';

interface HelperBoostProps {
  submitQuery?: (query: string) => void;
  setInput?: (value: string) => void;
  hasReachedLimit?: boolean;
}

const questionConfig = [
  {
    key: 'Portfolio',
    color: '#246BFE',
    icon: BriefcaseBusiness,
  },
  { key: 'Me', color: '#188B75', icon: MessageSquareText },
  { key: 'Skills', color: '#856ED9', icon: Layers },
  { key: 'Process', color: '#A15C1F', icon: LibraryBig },
  { key: 'Contact', color: '#C19433', icon: UserRoundSearch },
] as const;

// Animated Chevron component
const AnimatedChevron = () => {
  return (
    <motion.div
      animate={{
        y: [0, -4, 0], // Subtle up and down motion
      }}
      transition={{
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      }}
      className="text-primary mb-1.5"
    >
      <ChevronUp size={16} />
    </motion.div>
  );
};

export default function HelperBoost({
  submitQuery,
  setInput,
  hasReachedLimit = false,
}: HelperBoostProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const { language } = useDisplayPreferences();
  const text = getUiText(language);
  const questions = getLocalizedQuestions(language);

  const specialQuestions = [
    questions.Portfolio,
    text.portfolioDiffQuestion,
    text.visitorProcessQuestion,
    text.englishIntroQuestion,
  ];

  const questionsByCategory = [
    {
      id: 'me',
      name: language === 'ko' ? 'Oosu 소개' : 'About Oosu',
      icon: UserSearch,
      questions: [
        questions.Me,
        text.englishIntroQuestion,
        text.serviceDirectionQuestion,
        text.conceptQuestion,
      ],
    },
    {
      id: 'professional',
      name: language === 'ko' ? '포트폴리오' : 'Portfolio',
      icon: BriefcaseIcon,
      questions: [
        questions.Portfolio,
        text.portfolioDiffQuestion,
        text.resumeQuestion,
        text.visitorProcessQuestion,
      ],
    },
    {
      id: 'projects',
      name: language === 'ko' ? '프로젝트' : 'Projects',
      icon: CodeIcon,
      questions: [
        text.currentProjectsQuestion,
        text.legacyPortfolioQuestion,
        text.askOosuProjectQuestion,
      ],
    },
    {
      id: 'skills',
      name: language === 'ko' ? '기술 스택' : 'Skills',
      icon: GraduationCapIcon,
      questions: [
        questions.Skills,
        text.titleExplanationQuestion,
        text.frontendAiQuestion,
      ],
    },
    {
      id: 'wiki',
      name: language === 'ko' ? '업데이트 구조' : 'Update System',
      icon: LibraryBig,
      questions: [
        text.visitorProcessQuestion,
        text.githubNotionQuestion,
        text.notionStructureQuestion,
      ],
    },
    {
      id: 'contact',
      name: language === 'ko' ? '연락처' : 'Contact',
      icon: MailIcon,
      questions: [
        questions.Contact,
        text.githubLinkQuestion,
        text.socialLinkQuestion,
      ],
    },
  ];

  const handleQuestionClick = (questionKey: string) => {
    if (submitQuery) {
      submitQuery(questions[questionKey as keyof typeof questions]);
    }
  };

  const handleDrawerQuestionClick = (question: string) => {
    if (submitQuery) {
      submitQuery(question);
    }
    setOpen(false);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <div className="w-full">
          {/* Toggle Button */}
          <div
            className={
              isVisible
                ? 'mb-2 flex justify-center'
                : 'mb-0 flex justify-center'
            }
          >
            <button
              onClick={toggleVisibility}
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

          {/* HelperBoost Content */}
          {isVisible && (
            <div className="w-full">
              <div
                className="flex w-full flex-wrap gap-1 md:gap-3"
                style={{ justifyContent: 'safe center' }}
              >
                {questionConfig.map(({ key, color, icon: Icon }) => (
                  <Button
                    key={key}
                    onClick={() => !hasReachedLimit && handleQuestionClick(key)}
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
                        {questions[key]}
                      </span>
                    </div>
                  </Button>
                ))}

                {/* Need Inspiration Button */}
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Drawer.Trigger
                        className="group relative flex flex-shrink-0 items-center justify-center"
                        disabled={hasReachedLimit}
                      >
                        <motion.div
                          className={`flex h-auto items-center space-x-1 rounded-lg border px-4 py-3 text-sm backdrop-blur-sm transition-all duration-200 ${
                            hasReachedLimit
                              ? 'border-border bg-muted cursor-not-allowed opacity-50'
                              : 'hover:bg-accent border-border bg-background/80 cursor-pointer'
                          }`}
                          whileHover={!hasReachedLimit ? { scale: 1 } : {}}
                          whileTap={!hasReachedLimit ? { scale: 0.98 } : {}}
                        >
                          <div className="text-foreground flex items-center gap-3">
                            <CircleEllipsis
                              className="h-[20px] w-[18px]"
                              //style={{ color: '#3B82F6' }}
                              strokeWidth={2}
                            />
                            {/*<span className="text-sm font-medium">More</span>*/}
                          </div>
                        </motion.div>
                      </Drawer.Trigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <AnimatedChevron />
                      <span className="sr-only">{text.moreQuestions}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Content */}
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs" />
          <Drawer.Content className="bg-background fixed right-0 bottom-0 left-0 z-100 mt-24 flex h-[80%] flex-col rounded-t-[10px] outline-none lg:h-[60%]">
            <div className="bg-background flex-1 overflow-y-auto rounded-t-[10px] p-4">
              <div className="mx-auto max-w-md space-y-4">
                <div
                  aria-hidden
                  className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300"
                />
                <div className="mx-auto w-full max-w-md">
                  <div className="space-y-8 pb-16">
                    {questionsByCategory.map((category) => (
                      <CategorySection
                        key={category.id}
                        name={category.name}
                        Icon={category.icon}
                        questions={category.questions}
                        onQuestionClick={handleDrawerQuestionClick}
                        specialQuestions={specialQuestions}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

// Component for each category section
interface CategorySectionProps {
  name: string;
  Icon: React.ElementType;
  questions: string[];
  onQuestionClick: (question: string) => void;
  specialQuestions: string[];
}

function CategorySection({
  name,
  Icon,
  questions,
  onQuestionClick,
  specialQuestions,
}: CategorySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 px-1">
        <Icon className="h-5 w-5" />
        <Drawer.Title className="text-foreground text-[22px] font-medium">
          {name}
        </Drawer.Title>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        {questions.map((question, index) => (
          <QuestionItem
            key={index}
            question={question}
            onClick={() => onQuestionClick(question)}
            isSpecial={specialQuestions.includes(question)}
          />
        ))}
      </div>
    </div>
  );
}

// Component for each question item with animated chevron
interface QuestionItemProps {
  question: string;
  onClick: () => void;
  isSpecial: boolean;
}

function QuestionItem({ question, onClick, isSpecial }: QuestionItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={cn(
        'flex w-full items-center justify-between rounded-[10px]',
        'text-md px-6 py-4 text-left font-normal',
        'transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        isSpecial
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground'
      )}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        backgroundColor: isSpecial ? undefined : 'var(--accent)',
      }}
      whileTap={{
        scale: 0.98,
        backgroundColor: isSpecial ? undefined : 'var(--accent)',
      }}
    >
      <div className="flex items-center">
        {isSpecial && (
          <Sparkles className="text-primary-foreground mr-2 h-4 w-4" />
        )}
        <span className={isSpecial ? 'font-medium' : ''}>{question}</span>
      </div>
      <motion.div
        animate={{ x: isHovered ? 4 : 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      >
        <ChevronRight
          className={cn(
            'h-5 w-5 shrink-0',
            isSpecial ? 'text-primary-foreground' : 'text-primary'
          )}
        />
      </motion.div>
    </motion.button>
  );
}
