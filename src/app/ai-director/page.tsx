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
  title: 'AI Director-style Product Builder',
  description:
    'AI Director is Oosu’s grounded working thesis for connecting planning, design, engineering, content, deployment, and operations with AI as an execution partner.',
  path: '/ai-director',
  keywords: ['AI Director', 'AI product builder', 'AI-assisted workflows'],
});

export default function AiDirectorPage() {
  return (
    <PublicPageShell
      eyebrow={{ ko: '작업 가설', en: 'Working thesis' }}
      title={{
        ko: 'AI Director형 제품 빌더',
        en: 'AI Director-style Product Builder',
      }}
      summary={{
        ko: 'AI Director는 공식 직함이 아니라 AI를 실행 파트너로 활용해 제품 기획, 디자인, 개발, 마케팅, 운영을 하나의 제품 루프로 연결하는 작업 방식입니다.',
        en: 'AI Director is not a formal title. It is Oosu’s working thesis for the AI era: connecting product planning, design, engineering, marketing, and operations into one product loop with AI as an execution partner.',
      }}
    >
      <TextSection title={{ ko: '의미', en: 'What It Means' }}>
        <p>
          <LocalizedText
            ko="AI Director는 한 사람이 팀 전체를 대체할 수 있다는 주장이 아닙니다. 여러 제품 역할의 언어를 이해하고 AI 도구로 아이디어, 구현, 콘텐츠, 배포, 피드백을 연결하는 작업 방식을 뜻합니다."
            en="Oosu does not use AI Director to claim that one person can replace an entire team. The phrase describes a working style: understanding the language of multiple product roles and using AI tools to connect ideas, implementation, content, deployment, and feedback."
          />
        </p>
        <p>
          <LocalizedText
            ko="AI는 속도와 선택지를 늘리지만 어떤 문제를 풀지, 어떤 인터페이스가 신뢰를 주는지, 어떤 표현이 과장인지, 어떤 데이터로 다음 반복을 결정할지는 여전히 제품 판단의 영역입니다."
            en="AI can expand speed and options, but product judgment still matters: what problem is worth solving, which interface feels trustworthy, which message sounds overclaimed, and which data should guide the next iteration."
          />
        </p>
      </TextSection>

      <TextSection
        title={{
          ko: 'AskOosu가 이를 보여주는 방식',
          en: 'How AskOosu Shows This',
        }}
      >
        <p>
          <LocalizedText
            ko="AskOosu는 대화형 포트폴리오 UI, FAQ 라우팅, Wiki/RAG 원문, 출처 인지형 답변 렌더링과 배포 운영을 연결합니다. 단순한 챗봇 프롬프트가 아니라 AI 보조 제품 워크플로의 실제 사례입니다."
            en="AskOosu connects a conversational portfolio UI, FAQ routing, Wiki/RAG source documents, source-aware answer rendering, and deployment operations. It is a practical example of AI-assisted product workflow, not just a chatbot prompt."
          />
        </p>
        <p className="lang-ko" lang="ko">
          관련 페이지:{' '}
          <Link className="underline" href="/ai-era-developer">
            AI 시대 개발자 경쟁력
          </Link>
          ,{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI 경쟁력 FAQ
          </Link>
          ,{' '}
          <Link className="underline" href="/projects/askoosu">
            AskOosu 프로젝트 노트
          </Link>
          .
        </p>
        <p className="lang-en" lang="en">
          Related pages:{' '}
          <Link className="underline" href="/ai-era-developer">
            AI-era Developer Competitiveness
          </Link>
          ,{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI competitiveness FAQ
          </Link>
          , and{' '}
          <Link className="underline" href="/projects/askoosu">
            AskOosu project notes
          </Link>
          .
        </p>
      </TextSection>

      <TextSection title={{ ko: '자주 묻는 질문', en: 'FAQ' }}>
        <FaqList
          items={[
            {
              question: {
                ko: 'AI Director는 공식 직함인가요?',
                en: 'Is AI Director a formal job title?',
              },
              answer: {
                ko: '아니요. 이 포트폴리오에서 AI Director는 제품 판단과 AI 보조 실행을 조율하는 작업 방식입니다.',
                en: 'No. In this portfolio, AI Director is a working style for coordinating product judgment and AI-assisted execution.',
              },
            },
            {
              question: {
                ko: '디자이너, PM, 개발자를 대체한다는 뜻인가요?',
                en: 'Does it mean replacing designers, PMs, or engineers?',
              },
              answer: {
                ko: '아니요. 각 역할을 충분히 이해해 사람들과 협업하고 제품 전반에서 AI 도구를 책임 있게 활용하려는 접근입니다.',
                en: 'No. The safer claim is that Oosu tries to understand those roles well enough to collaborate with people and use AI tools responsibly across the product loop.',
              },
            },
            {
              question: {
                ko: '근거는 어디에 있나요?',
                en: 'Where is the proof?',
              },
              answer: {
                ko: 'FAQ 라우팅, Wiki 원문, 답변 가드레일, 출처 인지형 UX를 갖춘 RAG 포트폴리오 AskOosu가 핵심 근거입니다.',
                en: 'AskOosu is the main proof point: a RAG portfolio system with FAQ routing, Wiki source documents, answer guardrails, and source-aware UX.',
              },
            },
          ]}
        />
      </TextSection>
    </PublicPageShell>
  );
}
