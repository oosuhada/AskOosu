'use client';

import { OosuAvatar } from '@/components/oosu-avatar';
import { getLocalizedQuestions } from '@/lib/i18n';
import { oosuProfile } from '@/lib/oosu-profile';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import { motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  Layers,
  LibraryBig,
  Mail,
  MessageSquareText,
} from 'lucide-react';

interface ChatLandingProps {
  submitQuery: (query: string) => void;
  hasReachedLimit?: boolean;
}

const ChatLanding: React.FC<ChatLandingProps> = ({
  submitQuery,
  hasReachedLimit = false,
}) => {
  const { language } = useDisplayPreferences();
  const questions = getLocalizedQuestions(language);

  const landingQuestions = [
    {
      icon: <BriefcaseBusiness className="h-4 w-4" />,
      text: questions.Portfolio,
    },
    {
      icon: <MessageSquareText className="h-4 w-4" />,
      text: questions.Me,
    },
    {
      icon: <Layers className="h-4 w-4" />,
      text: questions.Skills,
    },
    {
      icon: <Mail className="h-4 w-4" />,
      text: questions.Contact,
    },
    {
      icon: <LibraryBig className="h-4 w-4" />,
      text: questions.Process,
    },
  ];

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
        <h2 className="mt-1 text-2xl font-semibold text-neutral-950 md:text-4xl">
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
        {landingQuestions.map((question) => (
          <motion.button
            key={question.text}
            variants={itemVariants}
            onClick={() => !hasReachedLimit && submitQuery(question.text)}
            disabled={hasReachedLimit}
            className="border-border bg-background/70 text-foreground hover:bg-accent flex min-h-14 items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium shadow-none backdrop-blur-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-muted-foreground">{question.icon}</span>
            <span>{question.text}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ChatLanding;
