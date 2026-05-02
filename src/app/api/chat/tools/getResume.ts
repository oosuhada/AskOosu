import { tool } from 'ai';
import { z } from 'zod';

export const getResume = tool({
  description:
    'Show Oosu Jang resume placeholders for future Korean and English Notion resume links.',
  parameters: z.object({}),
  execute: async () => {
    return 'Resume links are not connected yet. Korean and English Notion resume slots are prepared for a later update.';
  },
});
