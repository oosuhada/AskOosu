'use client';

import { OosuAvatar } from '@/components/oosu-avatar';
import { useSuggestedQuestions } from '@/hooks/use-suggested-questions';
import { oosuProfile } from '@/lib/oosu-profile';
import type { SuggestedQuestionId } from '@/lib/suggested-questions';
import { motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  Layers,
  LibraryBig,
  Mail,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ChatLandingProps {
  submitQuery: (query: string) => void;
  hasReachedLimit?: boolean;
}

const ChatLanding: React.FC<ChatLandingProps> = ({
  submitQuery,
  hasReachedLimit = false,
}) => {
  const { visibleQuestions, markQuestionAsked } = useSuggestedQuestions(5);

  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      className="flex w-full flex-col items-center px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <OosuAvatar
          animate={!hasReachedLimit}
          interval={180}
          className="mx-auto mb-5 h-28 w-28"
        />
        <p className="text-sm font-medium text-neutral-500">
          {oosuProfile.name}
        </p>
        <h2 className="text-foreground mt-1 text-2xl font-semibold md:text-4xl">
          AskOosu
        </h2>
        <p className="mt-2 text-sm text-neutral-500 md:text-base">
          {oosuProfile.title}
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {visibleQuestions.map((question) => (
          <motion.button
            key={question.id}
            variants={itemVariants}
            onClick={() => {
              if (hasReachedLimit) return;
              markQuestionAsked(question.id);
              submitQuery(question.text);
            }}
            disabled={hasReachedLimit}
            className="border-border bg-background/70 text-foreground hover:bg-accent flex min-h-14 items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium shadow-none backdrop-blur-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-muted-foreground">
              {questionIcons[question.id]}
            </span>
            <span>{question.text}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ChatLanding;

const questionIcons: Record<SuggestedQuestionId, ReactNode> = {
  bestProjects: <BriefcaseBusiness className="h-4 w-4" />,
  developerType: <MessageSquareText className="h-4 w-4" />,
  nowBuilding: <Sparkles className="h-4 w-4" />,
  techStack: <Layers className="h-4 w-4" />,
  aiUsage: <LibraryBig className="h-4 w-4" />,
  fullstackAiGrowth: <Layers className="h-4 w-4" />,
  conversationalPortfolio: <LibraryBig className="h-4 w-4" />,
  contactCollab: <Mail className="h-4 w-4" />,
};
