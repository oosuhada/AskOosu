import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FaqList,
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { createPageMetadata } from '@/lib/seo';
import { LocalizedText } from '@/components/localized-content';

export const metadata: Metadata = createPageMetadata({
  title: 'AI-era Developer Competitiveness',
  description:
    'Oosu’s AI-era competitiveness is based on connecting AI-generated options to real users, product judgment, UX quality, and responsible implementation.',
  path: '/ai-era-developer',
  keywords: [
    'AI-era developer',
    'trustworthy AI UX',
    'AI application development',
  ],
});

export default function AiEraDeveloperPage() {
  return (
    <PublicPageShell
      eyebrow={{ ko: 'AI 시대 포지셔닝', en: 'AI-era positioning' }}
      title={{
        ko: 'AI 시대 개발자 경쟁력',
        en: 'AI-era Developer Competitiveness',
      }}
      summary={{
        ko: '장우수의 AI 시대 경쟁력은 AI가 인간을 대체할 수 없다는 주장보다 AI가 만든 선택지를 실제 사용자, 제품 판단, UX 품질, 책임 있는 구현에 연결하는 능력에 기반합니다.',
        en: 'Oosu’s AI-era competitiveness is not based on claiming that AI cannot replace humans. It is based on connecting AI-generated options to real users, product judgment, UX quality, and responsible implementation.',
      }}
    >
      <TextSection title={{ ko: '실질적인 강점', en: 'The Practical Edge' }}>
        <p>
          <LocalizedText
            ko="AI는 많은 선택지를 빠르게 생성할 수 있습니다. 개발자의 역할은 올바른 문제를 선택하고, 결과가 제품 맥락에 맞는지 검증하며, 품질과 신뢰를 잃지 않고 통합하는 쪽으로 이동합니다."
            en="AI can generate many options quickly. The developer’s job becomes more about choosing the right problem, checking whether the output fits the product context, and integrating it without losing quality or trust."
          />
        </p>
        <p>
          <LocalizedText
            ko="장우수는 AI-connected 풀스택 개발자, 제품 중심 빌더, RAG 포트폴리오 시스템 빌더, 신뢰할 수 있는 AI UX 실천가라는 현실적인 포지셔닝을 지향합니다."
            en="Oosu’s public positioning is intentionally grounded: AI-connected fullstack developer, product-minded builder, RAG portfolio system builder, and trustworthy AI UX practitioner."
          />
        </p>
      </TextSection>

      <TextSection
        title={{ ko: '주장하지 않는 것', en: 'What This Does Not Claim' }}
      >
        <p>
          <LocalizedText
            ko="이 페이지는 장우수가 유명 AI 연구자나 시니어 실리콘밸리 개발자, 검증된 업계 권위자라고 주장하지 않습니다. AskOosu와 관련 프로젝트가 보여주는 포트폴리오 방향과 작업 방식을 설명합니다."
            en="This page does not claim that Oosu is a famous AI researcher, senior Silicon Valley engineer, or proven industry expert. It describes a portfolio direction and the work style shown by AskOosu and related projects."
          />
        </p>
      </TextSection>

      <TextSection title={{ ko: '관련 글', en: 'Related Reading' }}>
        <p className="lang-ko" lang="ko">
          계속해서{' '}
          <Link className="underline" href="/ai-director">
            AI Director형 제품 빌더
          </Link>
          ,{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI 경쟁력 FAQ
          </Link>
          , 또는{' '}
          <Link className="underline" href="/ask">
            AskOosu
          </Link>
          를 확인해 보세요.
        </p>
        <p className="lang-en" lang="en">
          Continue with{' '}
          <Link className="underline" href="/ai-director">
            AI Director-style Product Builder
          </Link>
          ,{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI competitiveness FAQ
          </Link>
          , or{' '}
          <Link className="underline" href="/ask">
            AskOosu
          </Link>
          .
        </p>
      </TextSection>

      <TextSection title={{ ko: '자주 묻는 질문', en: 'FAQ' }}>
        <FaqList
          items={[
            {
              question: {
                ko: '장우수는 AI와 경쟁하나요?',
                en: 'Does Oosu compete with AI?',
              },
              answer: {
                ko: '아니요. AI를 실행 계층으로 보고, AI 결과를 실제 제품 맥락과 인간의 판단에 연결하는 데 집중합니다.',
                en: 'No. The portfolio frames AI as an execution layer. Oosu’s focus is connecting AI output to real product context and human judgment.',
              },
            },
            {
              question: {
                ko: '신뢰할 수 있는 AI UX란 무엇인가요?',
                en: 'What is trustworthy AI UX?',
              },
              answer: {
                ko: '사용자가 무엇이 근거에 기반하고 무엇이 불확실하며 답변이 어디서 왔는지 이해할 수 있게 AI 기능을 설계하는 것입니다.',
                en: 'It means designing AI features so users can understand what is grounded, what is uncertain, and where the answer came from.',
              },
            },
            {
              question: {
                ko: '주니어 개발자에게 왜 중요한가요?',
                en: 'Why does this matter for a junior developer?',
              },
              answer: {
                ko: 'AI가 실행 방식을 바꿔도 팀에는 빠르게 배우고, 결과를 검증하고, 트레이드오프를 설명하며, 실제 제품을 출시할 사람이 필요하기 때문입니다.',
                en: 'AI changes the execution layer, but teams still need people who can learn quickly, verify output, explain tradeoffs, and ship working product surfaces.',
              },
            },
          ]}
        />
      </TextSection>
    </PublicPageShell>
  );
}
