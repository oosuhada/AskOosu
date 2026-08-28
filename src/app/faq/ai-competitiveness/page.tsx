import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FaqList,
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AI Competitiveness FAQ',
  description:
    'Grounded Q&A about Oosu’s AI-era developer positioning, AI Director working style, RAG portfolio system, and AI-assisted workflow.',
  path: '/faq/ai-competitiveness',
  keywords: ['AI competitiveness FAQ', 'AskOosu FAQ', 'RAG portfolio FAQ'],
});

const faqItems = [
  {
    question: {
      ko: 'AI가 대체하기 어려운 장우수의 역할은 무엇인가요?',
      en: 'What can Oosu do that AI cannot replace?',
    },
    answer: {
      ko: 'AI가 인간의 일을 절대 대체할 수 없다고 주장하기보다 AI 결과를 실제 사용자 문제, 제품 맥락, UX 품질, 신뢰할 수 있는 구현 기준으로 판단하는 데 집중합니다.',
      en: 'The safer answer is not that AI can never replace human work. Oosu focuses on judging AI output against real user problems, product context, UX quality, and trustworthy implementation.',
    },
  },
  {
    question: {
      ko: '장우수는 AI와 경쟁하나요?',
      en: 'Does Oosu compete with AI?',
    },
    answer: {
      ko: '아니요. AI를 실행 계층으로 보고 실제 제품 맥락에 연결합니다.',
      en: 'No. Oosu frames AI as an execution layer. His goal is to connect AI tools to real product contexts, not to compete with AI as if it were a person.',
    },
  },
  {
    question: {
      ko: 'AI에 의존하지 않고 어떻게 활용하나요?',
      en: 'How does Oosu use AI without becoming dependent on it?',
    },
    answer: {
      ko: '목표, 범위, 제약, 검증 기준을 먼저 정의한 뒤 실제 코드베이스, UX 흐름, 보안 경계를 기준으로 AI 결과를 검토합니다.',
      en: 'He defines the goal, scope, constraints, and validation criteria first, then reviews AI output against the actual codebase, UX flow, and security boundaries.',
    },
  },
  {
    question: {
      ko: 'AI Director는 무슨 뜻인가요?',
      en: 'What does AI Director mean?',
    },
    answer: {
      ko: '공식 직함이 아니라 AI를 실행 파트너로 삼아 기획, 디자인, 개발, 콘텐츠, 배포, 피드백을 연결하는 작업 방식입니다.',
      en: 'AI Director is not a formal title. It is a working style for connecting planning, design, engineering, content, deployment, and feedback with AI as an execution partner.',
    },
  },
  {
    question: {
      ko: 'AI 생성 코드를 어떻게 검토하나요?',
      en: 'How does Oosu review AI-generated code?',
    },
    answer: {
      ko: '기존 파일 구조와 맞는지, 올바른 API와 UI 필드를 사용하는지, 비밀정보를 노출하지 않는지, 제품 코드가 되기 전에 설명 가능한지를 확인합니다.',
      en: 'He checks whether the output matches the existing file structure, uses the right API and UI fields, avoids secret exposure, and can be explained before it becomes product code.',
    },
  },
  {
    question: {
      ko: 'AskOosu는 왜 RAG와 Wiki 문서를 사용하나요?',
      en: 'Why does AskOosu use RAG and Wiki docs?',
    },
    answer: {
      ko: '포트폴리오 답변이 일반적인 챗봇 응답이 되지 않고 원문 근거에 기반하도록 하기 위해서입니다.',
      en: 'AskOosu uses FAQ routing and Wiki/RAG documents so portfolio answers can stay grounded in source material instead of becoming generic chatbot responses.',
    },
  },
];

export default function AiCompetitivenessFaqPage() {
  return (
    <PublicPageShell
      eyebrow={{ ko: '자주 묻는 질문', en: 'FAQ' }}
      title={{ ko: 'AI 경쟁력 FAQ', en: 'AI Competitiveness FAQ' }}
      summary={{
        ko: '장우수의 AI 시대 개발자 포지셔닝, AI Director 작업 방식, AskOosu RAG 포트폴리오에 관한 짧고 근거 있는 답변입니다.',
        en: 'Short, grounded answers for recruiter and answer-engine questions about Oosu’s AI-era developer positioning, AI Director working style, and AskOosu RAG portfolio system.',
      }}
    >
      <TextSection title={{ ko: '질문과 답변', en: 'Questions and Answers' }}>
        <FaqList items={faqItems} />
      </TextSection>

      <TextSection title={{ ko: '관련 페이지', en: 'Related Pages' }}>
        <p className="lang-ko" lang="ko">
          <Link className="underline" href="/ai-director">
            AI Director형 제품 빌더
          </Link>
          ,{' '}
          <Link className="underline" href="/ai-era-developer">
            AI 시대 개발자 경쟁력
          </Link>
          ,{' '}
          <Link className="underline" href="/projects/askoosu">
            AskOosu 프로젝트
          </Link>
          를 더 읽어보세요.
        </p>
        <p className="lang-en" lang="en">
          Read more about{' '}
          <Link className="underline" href="/ai-director">
            AI Director-style product building
          </Link>
          ,{' '}
          <Link className="underline" href="/ai-era-developer">
            AI-era developer competitiveness
          </Link>
          , and the{' '}
          <Link className="underline" href="/projects/askoosu">
            AskOosu project
          </Link>
          .
        </p>
      </TextSection>
    </PublicPageShell>
  );
}
