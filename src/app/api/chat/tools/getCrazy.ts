import { tool } from 'ai';
import { z } from 'zod';

export const getCrazy = tool({
  description:
    "Shows Oosu Jang's learning style, strengths, and growth edges from the latest Notion profile source.",
  parameters: z.object({}),
  execute: async () => {
    return `Oosu's pattern is to learn new tools quickly, test them hands-on, and connect them to service ideas.

Strengths:
- Fast learning across new domains and tools.
- Turns ideas into concrete service structures.
- Connects UX, business context, and implementation.

Growth edges:
- Planning can become deep enough that final execution needs explicit completion criteria.
- Broad interests need clear priorities, so AskOosu and the Notion wiki are being used as a structure for focus.`;
  },
});
