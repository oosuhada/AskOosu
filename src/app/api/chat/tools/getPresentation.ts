import { tool } from 'ai';
import { z } from 'zod';

export const getPresentation = tool({
  description:
    'Return a concise personal introduction of Oosu Jang. Use it when the user asks who Oosu is.',
  parameters: z.object({}),
  execute: async () => {
    return {
      presentation:
        'Oosu Jang is an AI-connected Fullstack Developer building AskOosu, a 2026 conversational portfolio that connects frontend experience, backend logic, and LLM-powered answers.',
    };
  },
});
