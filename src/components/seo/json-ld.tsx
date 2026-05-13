import { getJsonLd } from '@/lib/seo';

export function HomeJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: getJsonLd() }}
    />
  );
}
