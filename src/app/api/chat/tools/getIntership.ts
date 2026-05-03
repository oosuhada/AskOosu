import { tool } from 'ai';
import { z } from 'zod';
import { oosuProfile } from '@/lib/oosu-profile';

export const getInternship = tool({
  description:
    'Gives a summary of Oosu Jang career direction, desired roles, and contact links. Use this when the user asks about opportunities, career fit, or hiring context.',
  parameters: z.object({}),
  execute: async () => {
    return `Oosu Jang is positioning as an AI-connected Fullstack Developer.

- Desired roles: fullstack developer, AI application developer, and AI service planning/development.
- Current focus: Spring Boot, React, backend/data processing, generative AI application development, and portfolio knowledge systems.
- Differentiator: combines GfK Korea data consulting, Oosu Salon founder/operator experience, frontend renewal work, and AI coding tool practice.
- Location: ${oosuProfile.residence}.

Contact:
- Email: ${oosuProfile.email}
- GitHub: ${oosuProfile.github}
- LinkedIn: ${oosuProfile.linkedin}
- Instagram: ${oosuProfile.instagram}`;
  },
});
