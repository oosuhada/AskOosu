import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import type { UIMessage } from 'ai';
import { oosuProfile, oosuProjects } from '@/lib/oosu-profile';

export function createStaticFallbackResponse({
  messages,
  query,
  retrievedContext,
}: {
  messages: UIMessage[];
  query: string;
  retrievedContext: string;
}) {
  const answer = buildStaticPortfolioAnswer({ query, retrievedContext });
  const stream = createUIMessageStream<UIMessage>({
    originalMessages: messages,
    execute({ writer }) {
      writer.write({ type: 'start' });
      writer.write({ type: 'text-start', id: 'fallback-text' });
      writer.write({
        type: 'text-delta',
        id: 'fallback-text',
        delta: answer,
      });
      writer.write({ type: 'text-end', id: 'fallback-text' });
      writer.write({ type: 'finish', finishReason: 'stop' });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function buildStaticPortfolioAnswer({
  query,
  retrievedContext,
}: {
  query: string;
  retrievedContext: string;
}) {
  const normalizedQuery = query.toLowerCase();

  if (matches(normalizedQuery, ['프로젝트', 'project', 'portfolio', '대표'])) {
    return [
      '지금은 AI 모델 키가 연결되지 않아 정적 포트폴리오 데이터로 답변할게요.',
      '',
      '우수의 대표 프로젝트는 다음과 같아요.',
      '',
      ...oosuProjects.slice(0, 5).map((project) => {
        const link = project.links[0]?.url ? `\n  링크: ${project.links[0].url}` : '';
        return `- ${project.title}: ${project.description}${link}`;
      }),
      '',
      '모델 키와 Notion 연동이 준비되면 이 답변은 Notion RAG 컨텍스트를 바탕으로 더 최신화됩니다.',
    ].join('\n');
  }

  if (matches(normalizedQuery, ['연락', '협업', 'contact', 'collab', 'github'])) {
    return [
      '지금은 AI 모델 키가 연결되지 않아 정적 연락처 정보로 답변할게요.',
      '',
      `- GitHub: ${oosuProfile.github}`,
      `- LinkedIn: ${oosuProfile.linkedin}`,
      `- Instagram: ${oosuProfile.instagram}`,
      `- Email: ${oosuProfile.email}`,
      '',
      'Resume은 한국어/영어 Notion 링크가 준비되면 사이드바에서 활성화될 예정입니다.',
    ].join('\n');
  }

  if (matches(normalizedQuery, ['스택', '기술', 'stack', 'skill', 'ai'])) {
    return [
      '지금은 AI 모델 키가 연결되지 않아 정적 기술 정보로 답변할게요.',
      '',
      '우수는 React, Next.js, TypeScript, Tailwind CSS 기반의 프론트엔드 경험 위에 Spring Boot, Node.js, PostgreSQL/MySQL, 그리고 AI SDK 기반 LLM 인터페이스를 확장하고 있어요.',
      '',
      'AskOosu 자체는 Next.js + AI SDK 6 + xAI Responses 경로 + Notion RAG 구조를 포트폴리오 안에서 증명하는 방향으로 업데이트 중입니다.',
    ].join('\n');
  }

  if (matches(normalizedQuery, ['이력서', 'resume', 'cv'])) {
    return [
      'Resume 링크는 아직 준비 중이에요.',
      '',
      '나중에 한국어 Notion Resume과 영어 Notion Resume 링크가 준비되면 사이드바의 비활성 Resume 항목을 실제 링크로 전환하면 됩니다.',
    ].join('\n');
  }

  if (retrievedContext) {
    return [
      '지금은 AI 모델 키가 연결되지 않아 검색된 포트폴리오 컨텍스트만 요약해서 보여드릴게요.',
      '',
      retrievedContext.replace(/^## Retrieved Portfolio Context\n/, ''),
    ].join('\n');
  }

  return [
    '지금은 AI 모델 키가 연결되지 않아 정적 답변으로 안내할게요.',
    '',
    `AskOosu는 ${oosuProfile.name}의 대화형 포트폴리오입니다. 프로젝트, 기술 스택, 연락처, Resume 준비 상태를 대화로 탐색하도록 설계되어 있어요.`,
    '',
    `GitHub: ${oosuProfile.github}`,
  ].join('\n');
}

function matches(query: string, keywords: string[]) {
  return keywords.some((keyword) => query.includes(keyword));
}
