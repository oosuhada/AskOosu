import { oosuProfile, oosuProjects } from '@/lib/oosu-profile';
import { getAllPosts } from '@/lib/blog';
import { getIndexedGithubProjects } from './github-source';
import { chunkLongText, normalizeText } from './text';
import type { RagChunk } from './types';

export async function getStaticChunks(): Promise<RagChunk[]> {
  const profileText = normalizeText(`
Name: ${oosuProfile.name}
Title: ${oosuProfile.title}
Location: ${oosuProfile.location}
Residence: ${oosuProfile.residence}
Education: ${oosuProfile.education}
Email: ${oosuProfile.email}
GitHub: ${oosuProfile.github}
LinkedIn: ${oosuProfile.linkedin}
Instagram: ${oosuProfile.instagram}
AskOosu Wiki: ${oosuProfile.notionWikiUrl}
Notion source: ${oosuProfile.notionSourceUrl}
  `);

  const [githubRepositories, blogPosts] = await Promise.all([
    getIndexedGithubProjects(12),
    getAllPosts(),
  ]);

  return [
    ...chunkLongText({
      id: 'static-profile',
      title: 'Oosu profile',
      source: 'static',
      text: profileText,
      url: oosuProfile.notionSourceUrl,
      metadata: {
        sourceKind: 'profile',
      },
    }),
    ...oosuProjects.flatMap((project) =>
      chunkLongText({
        id: `static-project-${project.title}`,
        title: project.title,
        source: 'static',
        text: normalizeText(
          [
            project.category,
            project.date,
            project.description,
            project.techStack.join(', '),
            project.links.map((link) => `${link.name}: ${link.url}`).join('\n'),
          ].join('\n')
        ),
        url: project.links[0]?.url,
        metadata: {
          sourceKind: 'project',
          category: project.category,
          date: project.date,
        },
      })
    ),
    ...githubRepositories.flatMap((repository) =>
      chunkLongText({
        id: `github-project-${repository.name}`,
        title: repository.name,
        source: 'static',
        text: normalizeText(
          [
            repository.description ?? '',
            `GitHub: ${repository.url}`,
            repository.homepage ? `Live: ${repository.homepage}` : '',
            `Created: ${repository.createdAt}`,
            `Languages: ${repository.languages
              .map((language) => `${language.name} ${language.percentage}%`)
              .join(', ')}`,
            `Topics: ${repository.topics.join(', ')}`,
            repository.readmeImages.length > 0
              ? `README images: ${repository.readmeImages
                  .map((image) => image.url)
                  .join(', ')}`
              : '',
          ]
            .filter(Boolean)
            .join('\n')
        ),
        url: repository.homepage ?? repository.url,
        metadata: {
          sourceKind: 'github_project',
          repository: repository.fullName,
          createdAt: repository.createdAt,
        },
      })
    ),
    ...blogPosts.flatMap((post) =>
      chunkLongText({
        id: `blog-post-${post.slug}`,
        title: post.title,
        source: 'static',
        text: normalizeText(
          [
            post.description,
            `Published: ${post.date}`,
            `Tags: ${post.tags.join(', ')}`,
            `URL: ${oosuProfile.currentPortfolioUrl}/blog/${post.slug}`,
          ].join('\n')
        ),
        url: `${oosuProfile.currentPortfolioUrl}/blog/${post.slug}`,
        metadata: {
          sourceKind: 'blog_post',
          date: post.date,
          slug: post.slug,
        },
      })
    ),
  ];
}
