'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText } from 'lucide-react';
import { oosuProfile } from '@/lib/oosu-profile';

export function Resume() {
  // Resume details
  const resumeDetails = {
    title: "Oosu Jang's Resume",
    description: oosuProfile.title,
    lastUpdated: 'Notion links will be connected later',
    versions: [
      {
        label: 'Korean resume',
        url: oosuProfile.resumeKoUrl,
      },
      {
        label: 'English resume',
        url: oosuProfile.resumeEnUrl,
      },
    ],
  };

  const openResume = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto w-full py-8 font-sans">
      <motion.div
        className="group relative overflow-hidden rounded-xl bg-accent p-0 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.0, ease: 'easeOut' }}
        whileHover={{ scale: 1.01 }}
      >
        {/* Details area (bottom part) */}
        <div className="p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-medium text-foreground">
                  {resumeDetails.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {resumeDetails.description}
              </p>
              <div className="mt-1 flex text-xs text-muted-foreground">
                <span>{resumeDetails.lastUpdated}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {resumeDetails.versions.map((version) => (
                <button
                  key={version.label}
                  type="button"
                  onClick={() => openResume(version.url)}
                  disabled={!version.url}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {version.label}
                  <ExternalLink className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Resume;
