'use client';

import { OosuAvatar } from '@/components/oosu-avatar';
import { oosuProfile } from '@/lib/oosu-profile';
import { motion } from 'framer-motion';

interface ChatLandingProps {
  hasReachedLimit?: boolean;
}

export default function ChatLanding({
  hasReachedLimit = false,
}: ChatLandingProps) {
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
      <motion.div variants={itemVariants} className="text-center">
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
    </motion.div>
  );
}
