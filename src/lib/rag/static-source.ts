import { oosuProfile, oosuProjects } from '@/lib/oosu-profile';
import { chunkLongText, normalizeText } from './text';
import type { RagChunk } from './types';

export function getStaticChunks(): RagChunk[] {
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
  ];
}
