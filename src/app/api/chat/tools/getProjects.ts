
import { tool } from "ai";
import { z } from "zod";


export const getProjects = tool({
  description:
    'Show Oosu Jang portfolio projects, including AskOosu 2026 and Portfoli-Oh! 2025.',
  inputSchema: z.object({}),
  execute: async () => {
    return "Here are Oosu's portfolio projects. AskOosu 2026 is the current AI-connected portfolio, and Portfoli-Oh! 2025 is the frontend bootcamp portfolio.";
  },
});
