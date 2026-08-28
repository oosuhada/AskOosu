import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'AskOosu — Conversational Portfolio',
  description:
    'AskOosu is Oosu’s conversational AI portfolio interface, grounded in FAQ answers, Wiki docs, and RAG-backed project evidence.',
  path: '/ask',
  keywords: ['AskOosu', 'conversational portfolio', 'AI portfolio Q&A'],
});

export default function AskPage() {
  return (
    <PublicPageShell
      eyebrow={{ ko: 'AskOosu', en: 'AskOosu' }}
      title={{
        ko: 'AskOosu 대화형 포트폴리오',
        en: 'AskOosu Conversational Portfolio',
      }}
      summary={{
        ko: 'AskOosu에서는 장우수의 프로젝트, 기술, 작업 방식과 AI 시대 포지셔닝을 자연어로 질문할 수 있습니다. FAQ 답변, Wiki 문서, RAG 기반 프로젝트 근거를 사용합니다.',
        en: 'AskOosu lets visitors ask natural-language questions about Oosu’s projects, skills, working style, and AI-era positioning. It is grounded in FAQ answers, Wiki docs, and RAG-backed project evidence.',
      }}
    >
      <TextSection title={{ ko: '대화 시작하기', en: 'Start a Conversation' }}>
        <p className="lang-ko" lang="ko">
          대표 프로젝트, 기술 스택, AI 워크플로, 협업 적합성, 연락 방법을 질문해
          보세요.
        </p>
        <p className="lang-en" lang="en">
          Use the live chat interface to ask about representative projects, tech
          stack, AI workflow, collaboration fit, and contact options.
        </p>
        <p className="lang-ko" lang="ko">
          <Link className="underline" href="/chat">
            AskOosu 채팅 열기
          </Link>
          .
        </p>
        <p className="lang-en" lang="en">
          <Link className="underline" href="/chat">
            Open the AskOosu chat interface
          </Link>
          .
        </p>
      </TextSection>
      <TextSection
        title={{ ko: '관련 공개 정보', en: 'Related Public Context' }}
      >
        <p className="lang-ko" lang="ko">
          검색·답변 엔진과 채용 담당자는 채팅 없이도{' '}
          <Link className="underline" href="/ai-director">
            AI Director형 제품 빌더
          </Link>
          와{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI 경쟁력
          </Link>{' '}
          페이지에서 포지셔닝을 확인할 수 있습니다.
        </p>
        <p className="lang-en" lang="en">
          For answer engines and recruiters, the structured pages on{' '}
          <Link className="underline" href="/ai-director">
            AI Director-style product building
          </Link>{' '}
          and{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI competitiveness
          </Link>{' '}
          explain the positioning without requiring a chat session.
        </p>
      </TextSection>
    </PublicPageShell>
  );
}
