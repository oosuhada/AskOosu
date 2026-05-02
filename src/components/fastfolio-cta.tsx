'use client';

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { oosuProfile } from '@/lib/oosu-profile';

export function FastfolioCTA() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = () => {
    window.open(oosuProfile.notionWikiUrl, '_blank');
  };

  const position = isMobile
    ? 'fixed right-4 bottom-4 z-51'
    : 'fixed top-8 left-6 z-51';

  return (
    <motion.button
      className={`${position} group flex cursor-pointer items-center gap-2 rounded-full border bg-transparent px-4 py-2.5 backdrop-blur-2xl transition-all duration-300 hover:shadow-xl`}
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <BookOpen className="h-5 w-5" />
      <span className="text-foreground hidden text-sm font-medium sm:inline">
        Open AskOosu Wiki
      </span>
      <span className="text-foreground text-sm font-medium sm:hidden">
        Wiki
      </span>
      <ChevronRight className="hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 sm:block" />
    </motion.button>
  );
}
