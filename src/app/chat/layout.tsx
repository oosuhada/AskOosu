import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AskOosu Chat',
  description:
    'Ask Oosu questions about projects, skills, AI workflow, career direction, and collaboration fit through the live conversational portfolio.',
  path: '/chat',
  keywords: ['AskOosu chat', 'portfolio Q&A', 'AI portfolio chat'],
});

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
