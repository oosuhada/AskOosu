import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FaqList,
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AI-era Developer Competitiveness',
  description:
    'Oosu’s AI-era competitiveness is based on connecting AI-generated options to real users, product judgment, UX quality, and responsible implementation.',
  path: '/ai-era-developer',
  keywords: ['AI-era developer', 'trustworthy AI UX', 'AI application development'],
});

export default function AiEraDeveloperPage() {
  return (
    <PublicPageShell
      eyebrow="AI-era positioning"
      title="AI-era Developer Competitiveness"
      summary="Oosu’s AI-era competitiveness is not based on claiming that AI cannot replace humans. It is based on connecting AI-generated options to real users, product judgment, UX quality, and responsible implementation."
    >
      <TextSection title="The Practical Edge">
        <p>
          AI can generate many options quickly. The developer’s job becomes more
          about choosing the right problem, checking whether the output fits the
          product context, and integrating it without losing quality or trust.
        </p>
        <p>
          Oosu’s public positioning is intentionally grounded: AI-connected
          fullstack developer, product-minded builder, RAG portfolio system
          builder, and trustworthy AI UX practitioner.
        </p>
      </TextSection>

      <TextSection title="What This Does Not Claim">
        <p>
          This page does not claim that Oosu is a famous AI researcher, senior
          Silicon Valley engineer, or proven industry expert. It describes a
          portfolio direction and the work style shown by AskOosu and related
          projects.
        </p>
      </TextSection>

      <TextSection title="Related Reading">
        <p>
          Continue with{' '}
          <Link className="underline" href="/ai-director">
            AI Director-style Product Builder
          </Link>
          ,{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI competitiveness FAQ
          </Link>
          , or{' '}
          <Link className="underline" href="/ask">
            AskOosu
          </Link>
          .
        </p>
      </TextSection>

      <TextSection title="FAQ">
        <FaqList
          items={[
            {
              question: 'Does Oosu compete with AI?',
              answer:
                'No. The portfolio frames AI as an execution layer. Oosu’s focus is connecting AI output to real product context and human judgment.',
            },
            {
              question: 'What is trustworthy AI UX?',
              answer:
                'It means designing AI features so users can understand what is grounded, what is uncertain, and where the answer came from.',
            },
            {
              question: 'Why does this matter for a junior developer?',
              answer:
                'AI changes the execution layer, but teams still need people who can learn quickly, verify output, explain tradeoffs, and ship working product surfaces.',
            },
          ]}
        />
      </TextSection>
    </PublicPageShell>
  );
}
