'use client';

import { motion } from 'framer-motion';
import { BriefcaseBusiness, Code2, Globe } from 'lucide-react';
import { OosuAvatar } from '@/components/oosu-avatar';
import { oosuProfile } from '@/lib/oosu-profile';

const InternshipCard = () => {
  const openMail = () => {
    window.open(`mailto:${oosuProfile.email}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-accent mx-auto mt-8 w-full max-w-4xl rounded-lg px-6 py-8 font-sans sm:px-10 md:px-16 md:py-12"
    >
      <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <OosuAvatar
            variant="hover"
            animate
            interval={180}
            className="h-16 w-16 shadow-md"
          />
          <div>
            <h2 className="text-foreground text-2xl font-semibold">
              {oosuProfile.name}
            </h2>
            <p className="text-muted-foreground text-sm">
              AI-connected Fullstack Developer
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 sm:mt-0">
          <span className="flex items-center gap-1 rounded-full border border-green-500 px-3 py-0.5 text-sm font-medium text-green-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Live
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <BriefcaseBusiness className="mt-1 h-5 w-5 text-blue-500" />
          <div>
            <p className="text-foreground text-sm font-medium">Direction</p>
            <p className="text-muted-foreground text-sm">
              Fullstack developer, AI application developer, and AI service
              planning.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Globe className="mt-1 h-5 w-5 text-green-500" />
          <div>
            <p className="text-foreground text-sm font-medium">Location</p>
            <p className="text-muted-foreground text-sm">
              {oosuProfile.residence}, building from Seoul.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 sm:col-span-2">
          <Code2 className="mt-1 h-5 w-5 text-purple-500" />
          <div className="w-full">
            <p className="text-foreground text-sm font-medium">Tech stack</p>
            <div className="text-muted-foreground grid grid-cols-1 gap-y-1 text-sm sm:grid-cols-2">
              <ul className="decoration-none list-disc pl-4">
                <li>Python, Java, TypeScript, Dart</li>
                <li>React, HTML/CSS/JS, Flutter</li>
                <li>Spring Boot, Node.js</li>
                <li>PostgreSQL, MySQL</li>
              </ul>
              <ul className="list-disc pl-4">
                <li>Claude Code, Gemini CLI, Codex</li>
                <li>Vercel AI SDK and tool calling</li>
                <li>Notion API knowledge source planned</li>
                <li>Service planning and UX structure</li>
                <li>
                  <a
                    href="/chat?query=%EA%B8%B0%EC%88%A0%20%EC%8A%A4%ED%83%9D%EA%B3%BC%20%EA%B0%95%EC%A0%90%EC%9D%84%20%EC%95%8C%EB%A0%A4%EC%A4%98"
                    className="cursor-pointer items-center text-blue-500 underline"
                  >
                    See more
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* What I bring */}
      <div className="mt-10">
        <p className="text-foreground mb-2 text-lg font-semibold">
          What I bring
        </p>
        <p className="text-foreground text-sm">
          Oosu connects data analysis, service operations, frontend execution,
          and AI tooling into practical product work. GfK Korea consulting, Oosu
          Salon founder/operator experience, and recent web/app projects give
          the portfolio a business-to-implementation perspective.
        </p>
      </div>

      <div className="mt-8">
        <p className="text-foreground mb-2 text-lg font-semibold">Goal</p>
        <p className="text-foreground text-sm">
          Grow as an AI service developer who can connect backend/data
          processing, user experience, and business context into services that
          solve real problems.
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={openMail}
          className="cursor-pointer rounded-full bg-black px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-zinc-800"
        >
          Contact me
        </button>
      </div>
    </motion.div>
  );
};

export default InternshipCard;
