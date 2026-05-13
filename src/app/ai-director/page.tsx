import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FaqList,
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AI Director-style Product Builder',
  description:
    'AI Director is Oosu’s grounded working thesis for connecting planning, design, engineering, content, deployment, and operations with AI as an execution partner.',
  path: '/ai-director',
  keywords: ['AI Director', 'AI product builder', 'AI-assisted workflows'],
});

export default function AiDirectorPage() {
  return (
    <PublicPageShell
      eyebrow="Working thesis"
      title="AI Director-style Product Builder"
      summary="AI Director is not a formal title. It is Oosu’s working thesis for the AI era: connecting product planning, design, engineering, marketing, and operations into one product loop with AI as an execution partner."
    >
      <TextSection title="What It Means">
        <p>
          Oosu does not use AI Director to claim that one person can replace an
          entire team. The phrase describes a working style: understanding the
          language of multiple product roles and using AI tools to connect ideas,
          implementation, content, deployment, and feedback.
        </p>
        <p>
          AI can expand speed and options, but product judgment still matters:
          what problem is worth solving, which interface feels trustworthy,
          which message sounds overclaimed, and which data should guide the next
          iteration.
        </p>
      </TextSection>

      <TextSection title="How AskOosu Shows This">
        <p>
          AskOosu connects a conversational portfolio UI, FAQ routing, Wiki/RAG
          source documents, source-aware answer rendering, and deployment
          operations. It is a practical example of AI-assisted product workflow,
          not just a chatbot prompt.
        </p>
        <p>
          Related pages:{' '}
          <Link className="underline" href="/ai-era-developer">
            AI-era Developer Competitiveness
          </Link>
          ,{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI competitiveness FAQ
          </Link>
          , and{' '}
          <Link className="underline" href="/projects/askoosu">
            AskOosu project notes
          </Link>
          .
        </p>
      </TextSection>

      <TextSection title="FAQ">
        <FaqList
          items={[
            {
              question: 'Is AI Director a formal job title?',
              answer:
                'No. In this portfolio, AI Director is a working style for coordinating product judgment and AI-assisted execution.',
            },
            {
              question: 'Does it mean replacing designers, PMs, or engineers?',
              answer:
                'No. The safer claim is that Oosu tries to understand those roles well enough to collaborate with people and use AI tools responsibly across the product loop.',
            },
            {
              question: 'Where is the proof?',
              answer:
                'AskOosu is the main proof point: a RAG portfolio system with FAQ routing, Wiki source documents, answer guardrails, and source-aware UX.',
            },
          ]}
        />
      </TextSection>
    </PublicPageShell>
  );
}
