import { tool } from 'ai';
import { z } from 'zod';

export const getSports = tool({
  description:
    'Shows Oosu visual portfolio archive and reusable profile/project images.',
  inputSchema: z.object({}),
  execute: async () => {
    return 'Here is Oosu visual archive: animated hover profile frames, 2025 portfolio captures, Flutter app previews, and placeholders for the latest web project screenshots.';
  },
});
