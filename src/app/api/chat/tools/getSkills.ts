import { tool } from 'ai';
import { z } from 'zod';

export const getSkills = tool({
  description:
    'Show Oosu Jang skills and stack.',
  parameters: z.object({}),
  execute: async () => {
    return "You can see Oosu's frontend, fullstack, AI-connected interface, design, and documentation skills above.";
  },
});
