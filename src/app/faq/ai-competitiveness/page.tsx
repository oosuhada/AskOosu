import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FaqList,
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AI Competitiveness FAQ',
  description:
    'Grounded Q&A about Oosu’s AI-era developer positioning, AI Director working style, RAG portfolio system, and AI-assisted workflow.',
  path: '/faq/ai-competitiveness',
  keywords: ['AI competitiveness FAQ', 'AskOosu FAQ', 'RAG portfolio FAQ'],
});

const faqItems = [
  {
    question: 'What can Oosu do that AI cannot replace?',
    answer:
      'The safer answer is not that AI can never replace human work. Oosu focuses on judging AI output against real user problems, product context, UX quality, and trustworthy implementation.',
  },
  {
    question: 'Does Oosu compete with AI?',
    answer:
      'No. Oosu frames AI as an execution layer. His goal is to connect AI tools to real product contexts, not to compete with AI as if it were a person.',
  },
  {
    question: 'How does Oosu use AI without becoming dependent on it?',
    answer:
      'He defines the goal, scope, constraints, and validation criteria first, then reviews AI output against the actual codebase, UX flow, and security boundaries.',
  },
  {
    question: 'What does AI Director mean?',
    answer:
      'AI Director is not a formal title. It is a working style for connecting planning, design, engineering, content, deployment, and feedback with AI as an execution partner.',
  },
  {
    question: 'How does Oosu review AI-generated code?',
    answer:
      'He checks whether the output matches the existing file structure, uses the right API and UI fields, avoids secret exposure, and can be explained before it becomes product code.',
  },
  {
    question: 'Why does AskOosu use RAG and Wiki docs?',
    answer:
      'AskOosu uses FAQ routing and Wiki/RAG documents so portfolio answers can stay grounded in source material instead of becoming generic chatbot responses.',
  },
];

export default function AiCompetitivenessFaqPage() {
  return (
    <PublicPageShell
      eyebrow="FAQ"
      title="AI Competitiveness FAQ"
      summary="Short, grounded answers for recruiter and answer-engine questions about Oosu’s AI-era developer positioning, AI Director working style, and AskOosu RAG portfolio system."
    >
      <TextSection title="Questions and Answers">
        <FaqList items={faqItems} />
      </TextSection>

      <TextSection title="Related Pages">
        <p>
          Read more about{' '}
          <Link className="underline" href="/ai-director">
            AI Director-style product building
          </Link>
          ,{' '}
          <Link className="underline" href="/ai-era-developer">
            AI-era developer competitiveness
          </Link>
          , and the{' '}
          <Link className="underline" href="/projects/askoosu">
            AskOosu project
          </Link>
          .
        </p>
      </TextSection>
    </PublicPageShell>
  );
}
