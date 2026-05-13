import type { Metadata } from 'next';
import { PublicPageShell, TextSection } from '@/components/seo/public-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Privacy',
  description:
    'Privacy notes for Oosu.dev and AskOosu, the public conversational portfolio site.',
  path: '/privacy',
  keywords: ['Oosu.dev privacy', 'AskOosu privacy'],
});

export default function PrivacyPage() {
  return (
    <PublicPageShell
      eyebrow="Privacy"
      title="Privacy"
      summary="Oosu.dev is a public portfolio site. This page summarizes the privacy posture for visitors and crawlers."
    >
      <TextSection title="Public Portfolio Content">
        <p>
          Oosu.dev publishes portfolio information, project summaries, public
          contact links, and AI-readable summaries intended for search engines
          and answer engines.
        </p>
      </TextSection>
      <TextSection title="Chat and Analytics">
        <p>
          AskOosu may process visitor questions to generate portfolio answers.
          The site should not be used to submit secrets, credentials, or private
          personal information. Optional analytics may be enabled in production
          to understand site usage.
        </p>
      </TextSection>
      <TextSection title="Crawler Boundaries">
        <p>
          Public pages are indexable. API, admin, dashboard, private, and
          preview-only paths are excluded from the sitemap and disallowed in the
          robots policy.
        </p>
      </TextSection>
    </PublicPageShell>
  );
}
