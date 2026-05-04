'use client';

import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import type { UIMessage } from 'ai';
import { motion } from 'framer-motion';
import ChatMessageContent from './chat-message-content';
import ToolRenderer from './tool-renderer';

type CompletedToolPart = {
  type: string;
  toolCallId: string;
  toolName?: string;
  output?: unknown;
  errorText?: string;
};

interface SimplifiedChatViewProps {
  message: UIMessage;
  isLoading: boolean;
  regenerate: () => Promise<void>;
  sessionId?: string | null;
  question?: string | null;
}

const MOTION_CONFIG = {
  initial: false,
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
};

export function SimplifiedChatView({
  message,
  isLoading,
  regenerate,
  sessionId,
  question,
}: SimplifiedChatViewProps) {
  if (message.role !== 'assistant') return null;

  const toolInvocations = message.parts.filter(isCompletedToolPart);

  // Only display the first tool (if any)
  const currentTool = toolInvocations.length > 0 ? [toolInvocations[0]] : [];

  const hasTextContent = getMessageText(message).length > 0;
  const hasTools = currentTool.length > 0;

  return (
    <motion.div {...MOTION_CONFIG} className="flex w-full flex-col px-4">
      <div className="flex w-full flex-col">
        {/* Tool invocation result - displayed at the top */}
        {hasTools && (
          <div className="mb-4 w-full">
            <ToolRenderer toolInvocations={currentTool} />
          </div>
        )}

        {/* Text content */}
        {(hasTextContent || isLoading) && (
          <div className="w-full">
            <ChatBubble variant="received" className="w-full">
              <ChatBubbleMessage
                isLoading={!hasTextContent && isLoading}
                className="bg-background/85 w-full rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-sm"
              >
                {hasTextContent ? (
                  <ChatMessageContent
                    message={message}
                    isLast={true}
                    isLoading={isLoading}
                    regenerate={regenerate}
                    skipToolRendering={true}
                    feedbackContext={{
                      sessionId,
                      question,
                    }}
                  />
                ) : null}
              </ChatBubbleMessage>
            </ChatBubble>
          </div>
        )}

        {/* Add some padding at the bottom for better scrolling experience */}
        <div className="pb-4"></div>
      </div>
    </motion.div>
  );
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function isCompletedToolPart(
  part: UIMessage['parts'][number]
): part is UIMessage['parts'][number] & CompletedToolPart {
  if (
    !(part.type === 'dynamic-tool' || part.type.startsWith('tool-')) ||
    !('state' in part)
  ) {
    return false;
  }

  return (
    part.state === 'output-available' ||
    part.state === 'output-error' ||
    part.state === 'output-denied'
  );
}
