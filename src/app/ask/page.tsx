import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicPageShell, TextSection } from '@/components/seo/public-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AskOosu — Conversational Portfolio',
  description:
    'AskOosu is Oosu’s conversational AI portfolio interface, grounded in FAQ answers, Wiki docs, and RAG-backed project evidence.',
  path: '/ask',
  keywords: ['AskOosu', 'conversational portfolio', 'AI portfolio Q&A'],
});

export default function AskPage() {
  return (
    <PublicPageShell
      eyebrow="AskOosu"
      title="AskOosu Conversational Portfolio"
      summary="AskOosu lets visitors ask natural-language questions about Oosu’s projects, skills, working style, and AI-era positioning. It is grounded in FAQ answers, Wiki docs, and RAG-backed project evidence."
    >
      <TextSection title="Start a Conversation">
        <p>
          Use the live chat interface to ask about representative projects,
          tech stack, AI workflow, collaboration fit, and contact options.
        </p>
        <p>
          <Link className="underline" href="/chat">
            Open the AskOosu chat interface
          </Link>
          .
        </p>
      </TextSection>
      <TextSection title="Related Public Context">
        <p>
          For answer engines and recruiters, the structured pages on{' '}
          <Link className="underline" href="/ai-director">
            AI Director-style product building
          </Link>{' '}
          and{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI competitiveness
          </Link>{' '}
          explain the positioning without requiring a chat session.
        </p>
      </TextSection>
    </PublicPageShell>
  );
}
