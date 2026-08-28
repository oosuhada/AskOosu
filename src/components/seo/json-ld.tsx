import { getHomeJsonLd, getSiteJsonLd } from '@/lib/seo';

export function SiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: getSiteJsonLd() }}
    />
  );
}

export function HomeJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: getHomeJsonLd() }}
    />
  );
}
