'use client';

import { Github } from 'lucide-react';
import { oosuProfile } from '@/lib/oosu-profile';

export function PoweredByFastfolio() {
  return (
    <a
      href={oosuProfile.github}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1.5 pb-4 text-xs text-gray-500 transition-colors hover:text-gray-700 md:pb-0"
    >
      <span>Built by</span>
      <Github className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="font-medium">Oosu Jang</span>
    </a>
  );
}
