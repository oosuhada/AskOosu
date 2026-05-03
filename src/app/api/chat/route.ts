import { convertToModelMessages, streamText, stepCountIs } from 'ai';
import type { UIMessage } from 'ai';
import {
  getChatModel,
  recordChatModelFailure,
  recordChatModelSuccess,
} from './model-provider';
import { SYSTEM_PROMPT_TEXT } from './prompt';
import { getCrazy } from './tools/getCrazy';
import { getContact } from './tools/getContact';
import { getInternship } from './tools/getIntership';
import { getPresentation } from './tools/getPresentation';
import { getProjects } from './tools/getProjects';
import { getResume } from './tools/getResume';
import { getSkills } from './tools/getSkills';
import { getSports } from './tools/getSport';
import { retrievePortfolioContext } from '@/lib/rag/notion-rag';

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
  try {
    const { messages } = (await req.json()) as {
      messages: UIMessage[];
    };
    const chatModel = getChatModel();

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
    const retrievedContext = await retrievePortfolioContext(latestUserText);
    const promptMessages = await convertToModelMessages(messages, {
      tools,
      ignoreIncompleteToolCalls: true,
    });

    const result = streamText({
      model: chatModel.model,
      system: [SYSTEM_PROMPT_TEXT, retrievedContext]
        .filter(Boolean)
        .join('\n\n'),
      messages: promptMessages,
      tools,
      stopWhen: stepCountIs(2),
      maxRetries: chatModel.provider === 'groq' ? 0 : undefined,
      onError: ({ error }) => {
        recordChatModelFailure(chatModel, error);
      },
      onFinish: () => {
        recordChatModelSuccess(chatModel);
      },
    });

    return result.toUIMessageStreamResponse({
      onError: errorHandler,
    });
  } catch (err) {
    console.error('Global error:', err);
    const errorMessage = errorHandler(err);
    return new Response(errorMessage, { status: 500 });
  }
}

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
