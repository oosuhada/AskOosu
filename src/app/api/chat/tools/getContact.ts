import { tool } from 'ai';
import { z } from 'zod';

export const getContact = tool({
  description:
    'Show Oosu Jang contact links: email, GitHub, LinkedIn, and Instagram.',
  parameters: z.object({}),
  execute: async () => {
    return 'Here are Oosu Jang contact links. Use the card above to open GitHub, LinkedIn, Instagram, or email.';
  },
});
