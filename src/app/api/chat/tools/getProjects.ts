import { tool } from 'ai';
import { z } from 'zod';
import { getIndexedGithubProjects } from '@/lib/rag/github-source';

export const getProjects = tool({
  description:
    'Show Oosu Jang portfolio projects, including AskOosu 2026 and Portfoli-Oh! 2025.',
  inputSchema: z.object({}),
  execute: async () => {
    const repositories = await getIndexedGithubProjects(12);
    return {
      summary:
        "Here are Oosu's recent public GitHub projects. AskOosu 2026 remains the current AI-connected portfolio.",
      repositories: repositories.map((repository) => ({
        name: repository.name,
        description: repository.description,
        url: repository.url,
        homepage: repository.homepage,
        createdAt: repository.createdAt,
        updatedAt: repository.updatedAt,
        languages: repository.languages,
        readmeImages: repository.readmeImages,
      })),
    };
  },
});
