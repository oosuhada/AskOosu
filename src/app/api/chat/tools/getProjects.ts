import { tool } from 'ai';
import { z } from 'zod';
import { getGithubPortfolioRepositories } from '@/lib/github-portfolio';

export const getProjects = tool({
  description:
    'Show Oosu Jang portfolio projects, including AskOosu 2026 and Portfoli-Oh! 2025.',
  inputSchema: z.object({}),
  execute: async () => {
    const repositories = await getGithubPortfolioRepositories();
    return {
      summary:
        "Here are Oosu's recent public GitHub projects. AskOosu 2026 remains the current AI-connected portfolio.",
      repositories: repositories.slice(0, 12).map((repository) => ({
        name: repository.name,
        description: repository.description,
        url: repository.url,
        homepage: repository.homepage,
        updatedAt: repository.updatedAt,
        languages: repository.languages.map((language) => ({
          name: language.name,
          percentage: language.percentage,
        })),
        readmeImages: repository.readmeImages,
      })),
    };
  },
});
