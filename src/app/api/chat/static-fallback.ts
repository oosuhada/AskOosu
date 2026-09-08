import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import type { UIMessage } from 'ai';
import { oosuProfile, oosuProjects } from '@/lib/oosu-profile';

export function createStaticFallbackResponse({
  messages,
  query,
  retrievedContext,
  reason = 'model_unavailable',
  metadata,
}: {
  messages: UIMessage[];
  query: string;
  retrievedContext: string;
  reason?: 'model_unavailable' | 'rate_limit';
  metadata?: unknown;
}) {
  const answer = buildStaticPortfolioAnswer({
    query,
    retrievedContext,
    reason,
  });
  const stream = createUIMessageStream<UIMessage>({
    originalMessages: messages,
    execute({ writer }) {
      writer.write({ type: 'start', messageMetadata: metadata });
      writer.write({ type: 'text-start', id: 'fallback-text' });
      writer.write({
        type: 'text-delta',
        id: 'fallback-text',
        delta: answer,
      });
      writer.write({ type: 'text-end', id: 'fallback-text' });
      writer.write({
        type: 'finish',
        finishReason: 'stop',
        messageMetadata: addAnswerToMetadata(metadata, answer),
      });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function buildStaticPortfolioAnswer({
  query,
  retrievedContext,
  reason,
}: {
  query: string;
  retrievedContext: string;
  reason: 'model_unavailable' | 'rate_limit';
}) {
  const normalizedQuery = query.toLowerCase();
  const language = /[가-힣]/.test(query) ? 'ko' : 'en';
  const fallbackIntro =
    language === 'ko'
      ? reason === 'rate_limit'
        ? '요청이 잠시 많아져서, 지금 확인 가능한 공개 정보만 간단히 안내할게요.'
        : '지금 확인 가능한 공개 정보만 간단히 안내할게요.'
      : reason === 'rate_limit'
        ? 'Requests are temporarily busy, so I’ll answer with the public information that is available right now.'
        : 'I’ll answer with the public information that is available right now.';

  if (matches(normalizedQuery, ['프로젝트', 'project', 'portfolio', '대표'])) {
    return [
      fallbackIntro,
      '',
      language === 'ko'
        ? '우수의 대표 프로젝트는 다음과 같습니다.'
        : 'Oosu’s representative projects include:',
      '',
      ...oosuProjects.slice(0, 5).map((project) => {
        const link = project.links[0]?.url
          ? `\n  ${language === 'ko' ? '링크' : 'Link'}: ${project.links[0].url}`
          : '';
        return `- ${project.title}: ${project.description}${link}`;
      }),
    ].join('\n');
  }

  if (
    matches(normalizedQuery, ['연락', '협업', 'contact', 'collab', 'github'])
  ) {
    return [
      fallbackIntro,
      '',
      `- GitHub: ${oosuProfile.github}`,
      `- LinkedIn: ${oosuProfile.linkedin}`,
      `- Instagram: ${oosuProfile.instagram}`,
      `- Email: ${oosuProfile.email}`,
      '',
      language === 'ko'
        ? '이력서 공개 링크는 준비되는 대로 안내할 예정입니다.'
        : 'Public resume links will be shared once they are ready.',
    ].join('\n');
  }

  if (matches(normalizedQuery, ['스택', '기술', 'stack', 'skill', 'ai'])) {
    return language === 'ko'
      ? [
          fallbackIntro,
          '',
          '우수는 React, Next.js, TypeScript, Tailwind CSS 기반의 프론트엔드 경험 위에 Spring Boot, Node.js, PostgreSQL/MySQL, 그리고 AI 기능을 실제 서비스에 연결하는 경험을 넓히고 있습니다.',
          '',
          'AskOosu에서는 Next.js, PostgreSQL, RAG, 모델 API를 하나의 대화형 포트폴리오 서비스로 연결했습니다.',
        ].join('\n')
      : [
          fallbackIntro,
          '',
          'Oosu builds on frontend experience with React, Next.js, TypeScript, and Tailwind CSS, and has expanded into Spring Boot, Node.js, PostgreSQL/MySQL, and AI-connected product work.',
          '',
          'AskOosu connects Next.js, PostgreSQL, RAG, and model APIs in one conversational portfolio service.',
        ].join('\n');
  }

  if (matches(normalizedQuery, ['이력서', 'resume', 'cv'])) {
    return language === 'ko'
      ? [
          '공개 이력서 링크는 아직 준비 중입니다.',
          '',
          '그동안 프로젝트, 기술 스택, 경력 방향은 여기서 바로 확인할 수 있습니다.',
        ].join('\n')
      : [
          'A public resume link is still being prepared.',
          '',
          'In the meantime, I can walk you through Oosu’s projects, stack, and career direction here.',
        ].join('\n');
  }

  // Never expose raw retrieved context in a visitor-facing fallback. It may
  // contain internal labels or formatting intended only for model grounding.
  void retrievedContext;

  return language === 'ko'
    ? [
        fallbackIntro,
        '',
        `AskOosu는 ${oosuProfile.name}의 대화형 포트폴리오입니다. 프로젝트, 기술 스택, 경력, 연락 방법을 질문으로 탐색할 수 있습니다.`,
        '',
        `GitHub: ${oosuProfile.github}`,
      ].join('\n')
    : [
        fallbackIntro,
        '',
        `AskOosu is ${oosuProfile.name}’s conversational portfolio. You can explore projects, skills, career direction, and contact information by asking questions.`,
        '',
        `GitHub: ${oosuProfile.github}`,
      ].join('\n');
}

function matches(query: string, keywords: string[]) {
  return keywords.some((keyword) => query.includes(keyword));
}

function addAnswerToMetadata(metadata: unknown, answer: string) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return { answer };
  }

  return {
    ...metadata,
    answer,
  };
}
