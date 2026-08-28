import type { Metadata } from 'next';
import {
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { absoluteUrl, createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AskOosu 소개 — 장우수의 AI 포트폴리오',
  description:
    '우수하다(oosuhada)라는 이름으로 활동하는 AI·풀스택 개발자 장우수의 대화형 포트폴리오 AskOosu를 소개합니다.',
  path: '/intro',
  keywords: ['AskOosu 소개', '장우수 포트폴리오', '우수하다', 'oosuhada'],
});

const introJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${absoluteUrl('/intro')}#askoosu`,
  name: 'AskOosu',
  url: absoluteUrl('/intro'),
  applicationCategory: 'PortfolioApplication',
  operatingSystem: 'Web',
  description:
    '우수하다(oosuhada)라는 이름으로 활동하는 AI·풀스택 개발자 장우수의 대화형 AI 포트폴리오.',
  creator: {
    '@type': 'Person',
    '@id': `${absoluteUrl('/')}#person`,
    name: '장우수',
    alternateName: ['Oosu', 'oosuhada', '우수하다'],
    url: absoluteUrl('/about'),
  },
};

export default function IntroPage() {
  return (
    <PublicPageShell
      eyebrow="AskOosu 소개"
      title="우수하다(oosuhada), 장우수의 AI-connected 포트폴리오"
      summary="프론트엔드, 백엔드, AI를 하나로 연결한 시스템을 포트폴리오 자체로 보여주는 대화형 포트폴리오입니다."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(introJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <TextSection title="AskOosu는 무엇인가요?">
        <p>
          우수하다(oosuhada)라는 이름으로 활동하는 AI·풀스택 개발자 장우수에게
          뭐든 물어보세요. 프로젝트가 궁금해도, 기술 스택이 궁금해도, 그냥 어떤
          사람인지 궁금해도 — 스크롤 대신 대화로 알아가는 포트폴리오예요.
        </p>
      </TextSection>
      <TextSection title="왜 대화형 포트폴리오인가요?">
        <p>
          2025년 Portfoli-Oh!에서 장우수는 우수하다(Oosu)라는 이름과 인터랙션,
          프론트엔드로 자신을 소개했어요. AskOosu는 그 다음 챕터 — 프론트엔드,
          백엔드, AI를 하나로 연결한 시스템을 포트폴리오 자체로 증명합니다.
        </p>
      </TextSection>
    </PublicPageShell>
  );
}
