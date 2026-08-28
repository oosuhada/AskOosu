import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { LocalizedText } from '@/components/localized-content';
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
        eyebrow={{ ko: '소개', en: 'About' }}
        title={{
          ko: '장우수(Oosu), AI·풀스택 개발자',
          en: 'Oosu, AI-connected Fullstack Developer',
        }}
        summary={{
          ko: '우수하다(oosuhada)라는 이름으로 활동하며 제품 중심 웹 애플리케이션, RAG 포트폴리오 시스템, AI 보조 워크플로와 신뢰할 수 있는 AI UX를 만드는 개발자입니다.',
          en: 'Oosu is an AI-connected fullstack developer and product-minded builder focused on product-minded web applications, RAG portfolio systems, AI-assisted workflows, and trustworthy AI UX.',
        }}
      >
        <TextSection title={{ ko: '지향점', en: 'Public Positioning' }}>
          <p>
            <LocalizedText
              ko="장우수의 작업은 AI 도구를 기획, 디자인, 엔지니어링, 콘텐츠, 배포, 운영 피드백과 같은 실제 제품 맥락에 연결하는 데 집중합니다."
              en="Oosu’s work focuses on connecting AI tools to real product contexts: planning, design, engineering, content, deployment, and operational feedback."
            />
          </p>
          <p>
            <LocalizedText
              ko="이 포트폴리오는 과장된 주장 대신 AI-connected 풀스택 개발자, 제품 중심 빌더, RAG 포트폴리오 시스템 빌더라는 검증 가능한 모습을 보여줍니다."
              en="The public portfolio avoids inflated claims. It presents a grounded profile: AI-connected fullstack developer, product-minded builder, and RAG portfolio system builder."
            />
          </p>
        </TextSection>
        <TextSection title={{ ko: '둘러보기', en: 'Explore' }}>
          <p className="lang-ko" lang="ko">
            <Link className="underline" href="/projects">
              프로젝트
            </Link>
            ,{' '}
            <Link className="underline" href="/ask">
              AskOosu
            </Link>
            , 또는{' '}
            <Link className="underline" href="/ai-era-developer">
              AI 시대 개발자 경쟁력
            </Link>
            을 확인해 보세요.
          </p>
          <p className="lang-en" lang="en">
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
