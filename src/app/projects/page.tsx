import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PublicPageShell, TextSection } from '@/components/seo/public-page-shell';
import { oosuProjects } from '@/lib/oosu-profile';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Oosu Projects',
  description:
    'Selected Oosu projects including AskOosu, Aigram, Sticks & Stones, Portfoli-Oh, and learning/product experiments.',
  path: '/projects',
  keywords: ['Oosu projects', 'AskOosu project', 'RAG portfolio project'],
});

export default function ProjectsPage() {
  return (
    <PublicPageShell
      eyebrow="Projects"
      title="Selected Product and Engineering Projects"
      summary="A concise public index of Oosu’s representative projects, with grounded descriptions and links where public links are available."
    >
      <TextSection title="Featured Projects">
        <div className="grid gap-4">
          {oosuProjects.slice(0, 6).map((project) => (
            <article
              key={project.title}
              className="border-border/70 bg-card rounded-lg border p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{project.title}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {project.category} · {project.date}
                  </p>
                </div>
                {project.title === 'AskOosu 2026' ? (
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-semibold underline"
                    href="/projects/askoosu"
                  >
                    Details
                    <ArrowUpRight size={14} />
                  </Link>
                ) : project.links[0] ? (
                  <a
                    className="inline-flex items-center gap-1 text-sm font-semibold underline"
                    href={project.links[0].url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Visit
                    <ArrowUpRight size={14} />
                  </a>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-4 leading-7">
                {project.description}
              </p>
            </article>
          ))}
        </div>
      </TextSection>
    </PublicPageShell>
  );
}
