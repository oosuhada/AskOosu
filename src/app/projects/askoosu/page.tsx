import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FaqList,
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { LocalizedText } from '@/components/localized-content';
import { oosuProjects } from '@/lib/oosu-profile';
import { createPageMetadata } from '@/lib/seo';

const askoosu = oosuProjects[0];

export const metadata: Metadata = createPageMetadata({
  title: 'AskOosu — RAG Portfolio System',
  description:
    'AskOosu is Oosu’s conversational RAG portfolio system built with Next.js, FAQ routing, Wiki source docs, and source-aware AI answer UX.',
  path: '/projects/askoosu',
  keywords: ['AskOosu', 'RAG portfolio system', 'portfolio chatbot'],
});

export default function AskOosuProjectPage() {
  return (
    <PublicPageShell
      eyebrow={{ ko: '프로젝트', en: 'Project' }}
      title={{
        ko: 'AskOosu — RAG 포트폴리오 시스템',
        en: 'AskOosu — RAG Portfolio System',
      }}
      summary={{
        ko: 'AskOosu는 FAQ 라우팅, Wiki 원문, RAG 기반 포트폴리오 근거를 통해 질문에 답하는 장우수의 Next.js 대화형 AI 포트폴리오입니다.',
        en: 'AskOosu is Oosu’s conversational AI portfolio: a Next.js application that answers questions through FAQ routing, Wiki source documents, and RAG-backed portfolio evidence.',
      }}
    >
      <TextSection title={{ ko: '프로젝트 소개', en: 'What It Is' }}>
        <p>
          <LocalizedText
            ko="AskOosu는 Mac mini 홈 서버에서 운영되는 2026 AI 포트폴리오입니다. 스크롤 중심의 정적 소개 대신 자연어 질문을 통해 프로젝트, 기술, 경험을 탐색할 수 있습니다."
            en={askoosu.description}
          />
        </p>
        <p>
          <LocalizedText
            ko="일반적인 챗봇 주장에 의존하지 않도록 결정형 FAQ 답변, RAG 근거, 공개 출처 요약을 분리해 신뢰할 수 있는 AI UX를 설계했습니다."
            en="AskOosu is designed as a product surface for trustworthy AI UX. It separates deterministic FAQ answers, RAG-backed evidence, and public source summaries so visitors can understand Oosu’s profile without relying on generic chatbot claims."
          />
        </p>
      </TextSection>

      <TextSection title={{ ko: '기술', en: 'Technology' }}>
        <p>{askoosu.techStack.join(', ')}</p>
      </TextSection>

      <TextSection
        title={{ ko: '관련 AI·Wiki 페이지', en: 'Related AI/Wiki Pages' }}
      >
        <p className="lang-ko" lang="ko">
          <Link className="underline" href="/faq/ai-competitiveness">
            AI 경쟁력 FAQ
          </Link>
          ,{' '}
          <Link className="underline" href="/ai-director">
            AI Director형 제품 빌더 노트
          </Link>
          , 또는{' '}
          <Link className="underline" href="/chat">
            AskOosu 채팅
          </Link>
          을 확인해 보세요.
        </p>
        <p className="lang-en" lang="en">
          Read the{' '}
          <Link className="underline" href="/faq/ai-competitiveness">
            AI competitiveness FAQ
          </Link>
          ,{' '}
          <Link className="underline" href="/ai-director">
            AI Director-style product builder notes
          </Link>
          , or open{' '}
          <Link className="underline" href="/chat">
            the live AskOosu chat
          </Link>
          .
        </p>
      </TextSection>

      <TextSection title={{ ko: '자주 묻는 질문', en: 'FAQ' }}>
        <FaqList
          items={[
            {
              question: {
                ko: '왜 정적 사이트 대신 RAG 포트폴리오인가요?',
                en: 'Why is AskOosu a RAG portfolio instead of a static site?',
              },
              answer: {
                ko: '방문자가 자연스럽게 질문하면서도 답변은 관리되는 포트폴리오 근거와 Wiki 문서에 기반하도록 만들기 위해서입니다.',
                en: 'The goal is to let visitors ask natural questions while keeping answers grounded in maintained portfolio evidence and Wiki documents.',
              },
            },
            {
              question: {
                ko: 'AskOosu가 비공개 데이터를 노출하나요?',
                en: 'Does AskOosu expose private data?',
              },
              answer: {
                ko: '아니요. 공개 답변은 공개 프로필, 프로젝트, Wiki 근거만 사용합니다. 비공개·관리자·API 영역은 sitemap에서 제외하고 robots 정책으로 차단합니다.',
                en: 'No. Public answers should stay grounded in public profile, project, and Wiki evidence. Private/admin/API surfaces are excluded from sitemap and blocked in robots policy.',
              },
            },
          ]}
        />
      </TextSection>
    </PublicPageShell>
  );
}
