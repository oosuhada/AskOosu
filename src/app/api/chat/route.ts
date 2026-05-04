import { convertToModelMessages, streamText, stepCountIs } from 'ai';
import type { UIMessage } from 'ai';
import {
  getChatModel,
  isChatModelRateLimitError,
  recordChatModelFailure,
  recordChatModelSuccess,
} from './model-provider';
import { SYSTEM_PROMPT_TEXT } from './prompt';
import { createStaticFallbackResponse } from './static-fallback';
import { getCrazy } from './tools/getCrazy';
import { getContact } from './tools/getContact';
import { getInternship } from './tools/getIntership';
import { getPresentation } from './tools/getPresentation';
import { getProjects } from './tools/getProjects';
import { getResume } from './tools/getResume';
import { getSkills } from './tools/getSkills';
import { getSports } from './tools/getSport';
import { buildRagChatContext } from '@/lib/rag/chat-context';

export const maxDuration = 30;

function errorHandler(error: unknown) {
  if (error == null) {
    return 'Unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  let messages: UIMessage[] = [];

  try {
    const body = (await req.json()) as { messages?: UIMessage[] };
    messages = Array.isArray(body.messages) ? body.messages : [];

    const tools = {
      getProjects,
      getPresentation,
      getResume,
      getContact,
      getSkills,
      getInternship,
      getCrazy,
      getSports,
    };

    const latestUserText = getLatestUserText(messages);
    const ragContext = await buildRagChatContext(latestUserText);
    const promptMessages = await convertToModelMessages(messages, {
      tools,
      ignoreIncompleteToolCalls: true,
    });
    const chatModel = getChatModel();
    let generatedAnswer = '';

    const result = streamText({
      model: chatModel.model,
      system: [
        SYSTEM_PROMPT_TEXT,
        RAG_CHAT_SYSTEM_PROMPT,
        ragContext.contextText,
      ]
        .filter(Boolean)
        .join('\n\n'),
      messages: promptMessages,
      tools,
      stopWhen: stepCountIs(2),
      maxRetries: chatModel.provider === 'groq' ? 0 : undefined,
      onError: ({ error }) => {
        recordChatModelFailure(chatModel, error);
      },
      onFinish: ({ text }) => {
        generatedAnswer = text;
        recordChatModelSuccess(chatModel);
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => getSafeChatErrorMessage(error, latestUserText),
      messageMetadata: ({ part }) => {
        if (part.type === 'finish') {
          return {
            ...ragContext.metadata,
            answer: generatedAnswer,
          };
        }
      },
    });
  } catch (err) {
    console.error('Global error:', err);
    const latestUserText = getLatestUserText(messages);
    const ragContext = await buildRagChatContext(latestUserText);

    return createStaticFallbackResponse({
      messages,
      query: latestUserText,
      retrievedContext: ragContext.contextText,
      reason: isChatModelRateLimitError(err)
        ? 'rate_limit'
        : 'model_unavailable',
      metadata: ragContext.metadata,
    });
  }
}

const RAG_CHAT_SYSTEM_PROMPT = `
## Wiki Grounding Rules
- Answer from the retrieved Wiki context whenever it is available.
- Do not guess facts that are not present in the Wiki context or the stable portfolio prompt.
- Treat TODO, needs_review, private, or uncertain chunks as unconfirmed. Mention uncertainty instead of stating them as final.
- Be natural, warm, and helpful for a portfolio visitor.
- Answer in Korean when the user asks in Korean, and in English when the user asks in English.
- Do not output raw JSON metadata. Metadata is attached by the API separately.
`;

function getLatestUserText(messages: UIMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user');

  return (
    latestUserMessage?.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n') ?? ''
  );
}

function getSafeChatErrorMessage(error: unknown, query: string) {
  if (isChatModelRateLimitError(error)) {
    return [
      'Groq 무료 API 사용량 또는 속도 제한에 걸려 지금은 실시간 답변을 완료하지 못했어요.',
      '잠시 후 다시 시도하거나, GitHub/LinkedIn/이메일 링크로 우수에게 직접 문의해 주세요.',
      query ? `질문: ${query}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return errorHandler(error);
}
