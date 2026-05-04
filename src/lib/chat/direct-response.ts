import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import type { UIMessage } from 'ai';

export function createDirectAnswerResponse({
  messages,
  answer,
  metadata,
}: {
  messages: UIMessage[];
  answer: string;
  metadata: unknown;
}) {
  const stream = createUIMessageStream<UIMessage>({
    originalMessages: messages,
    execute({ writer }) {
      writer.write({ type: 'start', messageMetadata: metadata });
      writer.write({ type: 'text-start', id: 'direct-answer-text' });
      writer.write({
        type: 'text-delta',
        id: 'direct-answer-text',
        delta: answer,
      });
      writer.write({ type: 'text-end', id: 'direct-answer-text' });
      writer.write({
        type: 'finish',
        finishReason: 'stop',
        messageMetadata: addAnswerToMetadata(metadata, answer),
      });
    },
  });

  return createUIMessageStreamResponse({ stream });
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
