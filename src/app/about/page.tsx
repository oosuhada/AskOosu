import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { createPageMetadata, personJsonLd, siteUrl } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: '장우수 소개 | Oosu · oosuhada 개발자',
  description:
    '우수하다(oosuhada)라는 이름으로 활동하며 AI·RAG 서비스와 제품 중심 웹 애플리케이션을 만드는 AI·풀스택 개발자 장우수의 소개 페이지입니다.',
  path: '/about',
  keywords: ['About Oosu', 'oosuhada', 'AI-connected developer'],
});

const profilePageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${siteUrl}/about#profile`,
  url: `${siteUrl}/about`,
  mainEntity: personJsonLd,
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profilePageJsonLd).replace(/</g, '\\u003c'),
        }}
      />
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
            profile: AI-connected fullstack developer, product-minded builder,
            and RAG portfolio system builder.
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
    </>
  );
}
