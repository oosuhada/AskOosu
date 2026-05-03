'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText } from 'lucide-react';
import { getUiText } from '@/lib/i18n';
import { oosuProfile } from '@/lib/oosu-profile';
import { useDisplayPreferences } from '@/lib/use-display-preferences';

export function Resume() {
  const { language } = useDisplayPreferences();
  const text = getUiText(language);

  // Resume details
  const resumeDetails = {
    title: text.resumeTitle,
    description: oosuProfile.title,
    lastUpdated: text.resumeUpdated,
    versions: [
      {
        label: text.resumeKorean,
        url: oosuProfile.resumeKoUrl,
      },
      {
        label: text.resumeEnglish,
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
        className="group bg-accent relative overflow-hidden rounded-xl p-0 transition-all duration-300"
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
                <h3 className="text-foreground text-lg font-medium">
                  {resumeDetails.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                {resumeDetails.description}
              </p>
              <div className="text-muted-foreground mt-1 flex text-xs">
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
                  className="border-border bg-background text-foreground hover:bg-accent inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
