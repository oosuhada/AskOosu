import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FaqList,
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { oosuProjects } from '@/lib/oosu-profile';
import { createPageMetadata } from '@/lib/seo';

const askoosu = oosuProjects[0];

export const metadata: Metadata = createPageMetadata({
  title: 'AskOosu — RAG Portfolio System',
  description:
    'AskOosu is Oosu’s conversational RAG portfolio system built with Next.js, FAQ routing, Wiki source docs, and source-aware AI answer UX.',
  path: '/projects/askoosu',
  keywords: ['AskOosu', 'RAG portfolio system', 'portfolio chatbot'],
});

export default function AskOosuProjectPage() {
  return (
    <PublicPageShell
      eyebrow="Project"
      title="AskOosu — RAG Portfolio System"
      summary="AskOosu is Oosu’s conversational AI portfolio: a Next.js application that answers questions through FAQ routing, Wiki source documents, and RAG-backed portfolio evidence."
    >
      <TextSection title="What It Is">
        <p>{askoosu.description}</p>
        <p>
          AskOosu is designed as a product surface for trustworthy AI UX. It
          separates deterministic FAQ answers, RAG-backed evidence, and public
          source summaries so visitors can understand Oosu’s profile without
          relying on generic chatbot claims.
        </p>
      </TextSection>

      <TextSection title="Technology">
        <p>{askoosu.techStack.join(', ')}</p>
      </TextSection>

      <TextSection title="Related AI/Wiki Pages">
        <p>
          Read the{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI competitiveness FAQ
          </Link>
          ,{' '}
          <Link className="underline" href="/ai-director">
            AI Director-style product builder notes
          </Link>
          , or open{' '}
          <Link className="underline" href="/chat">
            the live AskOosu chat
          </Link>
          .
        </p>
      </TextSection>

      <TextSection title="FAQ">
        <FaqList
          items={[
            {
              question: 'Why is AskOosu a RAG portfolio instead of a static site?',
              answer:
                'The goal is to let visitors ask natural questions while keeping answers grounded in maintained portfolio evidence and Wiki documents.',
            },
            {
              question: 'Does AskOosu expose private data?',
              answer:
                'No. Public answers should stay grounded in public profile, project, and Wiki evidence. Private/admin/API surfaces are excluded from sitemap and blocked in robots policy.',
            },
          ]}
        />
      </TextSection>
    </PublicPageShell>
  );
}
