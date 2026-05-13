import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicPageShell, TextSection } from '@/components/seo/public-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'About Oosu',
  description:
    'Oosu is an AI-connected fullstack developer and product-minded builder focused on RAG portfolio systems, AI-assisted workflows, and trustworthy AI UX.',
  path: '/about',
  keywords: ['About Oosu', 'oosuhada', 'AI-connected developer'],
});

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="About"
      title="Oosu, AI-connected Fullstack Developer"
      summary="Oosu is an AI-connected fullstack developer and product-minded builder focused on product-minded web applications, RAG portfolio systems, AI-assisted workflows, and trustworthy AI UX."
    >
      <TextSection title="Public Positioning">
        <p>
          Oosu’s work focuses on connecting AI tools to real product contexts:
          planning, design, engineering, content, deployment, and operational
          feedback.
        </p>
        <p>
          The public portfolio avoids inflated claims. It presents a grounded
          profile: AI-connected fullstack developer, product-minded builder, and
          RAG portfolio system builder.
        </p>
      </TextSection>
      <TextSection title="Explore">
        <p>
          Visit{' '}
          <Link className="underline" href="/projects">
            Projects
          </Link>
          ,{' '}
          <Link className="underline" href="/ask">
            AskOosu
          </Link>
          , or{' '}
          <Link className="underline" href="/ai-era-developer">
            AI-era Developer Competitiveness
          </Link>
          .
        </p>
      </TextSection>
    </PublicPageShell>
  );
}
