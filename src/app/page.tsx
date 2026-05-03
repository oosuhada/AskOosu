'use client';

import FluidCursor from '@/components/FluidCursor';
import { OosuAvatar } from '@/components/oosu-avatar';
import { Button } from '@/components/ui/button';
import WelcomeModal from '@/components/welcome-modal';
import { oosuProfile, suggestedQuestions } from '@/lib/oosu-profile';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  Layers,
  LibraryBig,
  MessageSquareText,
  UserRoundSearch,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

/* ---------- quick-question data ---------- */
const questions = suggestedQuestions;

const questionConfig = [
  { key: 'Portfolio', color: '#246BFE', icon: BriefcaseBusiness },
  { key: 'Me', color: '#188B75', icon: MessageSquareText },
  { key: 'Skills', color: '#6E57C9', icon: Layers },
  { key: 'Wiki', color: '#A15C1F', icon: LibraryBig },
  { key: 'Contact', color: '#C19433', icon: UserRoundSearch },
] as const;

/* ---------- component ---------- */
export default function Home() {
  const [input, setInput] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const goToChat = (query: string) =>
    router.push(`/chat?query=${encodeURIComponent(query)}`);

  /* hero animations (unchanged) */
  const topElementVariants = {
    hidden: { opacity: 0, y: -60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'ease', duration: 0.8 },
    },
  };
  const bottomElementVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'ease', duration: 0.8, delay: 0.2 },
    },
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-10 md:pb-20">
      {/* big blurred footer word */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
        <div
          className="hidden bg-gradient-to-b from-neutral-500/10 to-neutral-500/0 bg-clip-text text-[8rem] leading-none font-black text-transparent select-none sm:block lg:text-[13rem]"
          style={{ marginBottom: '-2.5rem' }}
        >
          AskOosu
        </div>
      </div>

      {/* header */}
      <motion.div
        className="z-1 mt-24 mb-8 flex flex-col items-center text-center md:mt-4 md:mb-12"
        variants={topElementVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="z-100">
          <WelcomeModal />
        </div>

        <h2 className="text-secondary-foreground mt-1 text-xl font-semibold md:text-2xl">
          {oosuProfile.name}
        </h2>
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          {oosuProfile.title}
        </h1>
      </motion.div>

      <OosuAvatar
        priority
        interval={150}
        className="relative z-10 h-56 w-52 sm:h-72 sm:w-72"
      />

      {/* input + quick buttons */}
      <motion.div
        variants={bottomElementVariants}
        initial="hidden"
        animate="visible"
        className="z-10 mt-4 flex w-full flex-col items-center justify-center md:px-0"
      >
        {/* free-form question */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) goToChat(input.trim());
          }}
          className="relative w-full max-w-lg"
        >
          <div className="mx-auto flex items-center rounded-full border border-neutral-200 bg-white/30 py-2.5 pr-2 pl-6 backdrop-blur-lg transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Oosu anything..."
              className="w-full border-none bg-transparent text-base text-neutral-800 placeholder:text-neutral-500 focus:outline-none dark:text-neutral-200 dark:placeholder:text-neutral-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Submit question"
              className="flex items-center justify-center rounded-full bg-[#0171E3] p-2.5 text-white transition-colors hover:bg-blue-600 disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* quick-question grid */}
        <div className="mt-4 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {questionConfig.map(({ key, color, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => goToChat(questions[key])}
              variant="outline"
              className="border-border hover:bg-border/30 min-h-14 w-full cursor-pointer rounded-lg border bg-white/45 px-4 py-3 shadow-none backdrop-blur-lg active:scale-95"
            >
              <div className="flex h-full w-full items-center justify-start gap-3 text-left text-gray-700">
                <Icon
                  className="shrink-0"
                  size={20}
                  strokeWidth={2}
                  color={color}
                />
                <span className="text-sm leading-snug font-medium">
                  {questions[key]}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </motion.div>
      <FluidCursor />
    </div>
  );
}
