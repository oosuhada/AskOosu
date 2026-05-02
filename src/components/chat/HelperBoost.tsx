import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { suggestedQuestions } from '@/lib/oosu-profile';
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

const questions = {
  Portfolio: suggestedQuestions.Portfolio,
  Me: suggestedQuestions.Me,
  Skills: suggestedQuestions.Skills,
  Wiki: suggestedQuestions.Wiki,
  Contact: suggestedQuestions.Contact,
};

const questionConfig = [
  {
    key: 'Portfolio',
    label: suggestedQuestions.Portfolio,
    color: '#246BFE',
    icon: BriefcaseBusiness,
  },
  { key: 'Me', label: 'Me', color: '#188B75', icon: MessageSquareText },
  { key: 'Skills', label: 'Skills', color: '#856ED9', icon: Layers },
  { key: 'Wiki', label: 'Wiki', color: '#A15C1F', icon: LibraryBig },
  { key: 'Contact', label: 'Contact', color: '#C19433', icon: UserRoundSearch },
];

// Helper drawer data
const specialQuestions = [
  suggestedQuestions.Portfolio,
  '2025 포트폴리오와 2026 AskOosu의 차이를 보여줘',
  '나중에 Notion wiki를 어떻게 연결할 수 있어?',
  'Can you introduce Oosu in English?',
];

const questionsByCategory = [
  {
    id: 'me',
    name: 'About Oosu',
    icon: UserSearch,
    questions: [
      suggestedQuestions.Me,
      'Can you introduce Oosu in English?',
      'Oosu가 만드는 서비스의 방향성을 알려줘',
      '오수의 2026 포트폴리오 컨셉을 설명해줘',
    ],
  },
  {
    id: 'professional',
    name: 'Portfolio',
    icon: BriefcaseIcon,
    questions: [
      suggestedQuestions.Portfolio,
      '2025 포트폴리오와 2026 AskOosu의 차이를 보여줘',
      '이력서 링크는 어디에 연결될 예정이야?',
      'AskOosu 프로젝트의 백엔드와 AI 연결 구조를 설명해줘',
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: CodeIcon,
    questions: [
      '현재 등록된 프로젝트를 보여줘',
      'Portfoli-Oh! 2025 프로젝트 설명해줘',
      'AskOosu 2026 프로젝트 설명해줘',
    ],
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: GraduationCapIcon,
    questions: [
      suggestedQuestions.Skills,
      'AI-connected Fullstack Developer라는 타이틀을 풀어서 설명해줘',
      '프론트엔드와 AI를 어떻게 연결할 수 있어?',
    ],
  },
  {
    id: 'wiki',
    name: 'Wiki & Notion',
    icon: LibraryBig,
    questions: [
      suggestedQuestions.Wiki,
      'GitHub 공부 기록을 Notion으로 자동 관리하려면 어떻게 설계하면 돼?',
      'Notion API를 포트폴리오 답변 지식으로 쓰는 구조를 알려줘',
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: MailIcon,
    questions: [
      suggestedQuestions.Contact,
      'GitHub 링크 알려줘',
      'LinkedIn과 Instagram 링크 알려줘',
    ],
  },
];

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
              className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
            >
              {isVisible ? (
                <>
                  <ChevronDown size={14} />
                  Hide quick questions
                </>
              ) : (
                <>
                  <ChevronUp size={14} />
                  Show quick questions
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
                {questionConfig.map(({ key, label, color, icon: Icon }) => (
                  <Button
                    key={key}
                    onClick={() => !hasReachedLimit && handleQuestionClick(key)}
                    variant="outline"
                    className={`h-auto min-w-[100px] flex-shrink-0 rounded-lg border px-4 py-3 shadow-none backdrop-blur-sm transition-none ${
                      hasReachedLimit
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
                        : 'border-border hover:bg-border/30 cursor-pointer bg-white/80 active:scale-95'
                    }`}
                    disabled={hasReachedLimit}
                  >
                    <div className="flex items-center gap-3 text-gray-700">
                      <Icon size={18} strokeWidth={2} color={color} />
                      <span className="text-sm leading-snug font-medium">
                        {label}
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
                              ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
                              : 'hover:bg-border/30 cursor-pointer border-neutral-200 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900'
                          }`}
                          whileHover={!hasReachedLimit ? { scale: 1 } : {}}
                          whileTap={!hasReachedLimit ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-center gap-3 text-gray-700">
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
          <Drawer.Content className="fixed right-0 bottom-0 left-0 z-100 mt-24 flex h-[80%] flex-col rounded-t-[10px] bg-gray-100 outline-none lg:h-[60%]">
            <div className="flex-1 overflow-y-auto rounded-t-[10px] bg-white p-4">
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
}

function CategorySection({
  name,
  Icon,
  questions,
  onQuestionClick,
}: CategorySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 px-1">
        <Icon className="h-5 w-5" />
        <Drawer.Title className="text-[22px] font-medium text-gray-900">
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
        isSpecial ? 'bg-black' : 'bg-[#F7F8F9]'
      )}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        backgroundColor: isSpecial ? undefined : '#F0F0F2',
      }}
      whileTap={{
        scale: 0.98,
        backgroundColor: isSpecial ? undefined : '#E8E8EA',
      }}
    >
      <div className="flex items-center">
        {isSpecial && <Sparkles className="mr-2 h-4 w-4 text-white" />}
        <span className={isSpecial ? 'font-medium text-white' : ''}>
          {question}
        </span>
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
            isSpecial ? 'text-white' : 'text-primary'
          )}
        />
      </motion.div>
    </motion.button>
  );
}
