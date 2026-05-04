'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// Component imports
import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import { PortfolioSidebar } from '@/components/portfolio-sidebar';
import { OosuAvatar } from '@/components/oosu-avatar';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import { getUiText } from '@/lib/i18n';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import { useSuggestedQuestions } from '@/hooks/use-suggested-questions';
import {
  createConversationId,
  readStoredConversations,
  upsertStoredConversation,
  writeStoredConversations,
  type StoredChatConversation,
} from '@/lib/chat-history';
import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import WelcomeModal from '@/components/welcome-modal';
import { Info } from 'lucide-react';
import HelperBoost from './HelperBoost';

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
};

const Chat = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('query');
  const initialConversationId = searchParams.get('conversationId');
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState<string | null>(
    null
  );
  const [chatErrorMessage, setChatErrorMessage] = useState<string | null>(null);
  const [conversations, setConversations] = useState<StoredChatConversation[]>(
    []
  );
  const [input, setInput] = useState('');
  const { language, theme } = useDisplayPreferences();
  const { markQueryAsked } = useSuggestedQuestions(5);
  const text = getUiText(language);
  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
      }),
    []
  );

  const {
    messages,
    status,
    stop,
    setMessages,
    regenerate,
    sendMessage,
    clearError,
  } = useChat({
    transport: chatTransport,
    onFinish: () => {
      setLoadingSubmit(false);
    },
    onError: (error) => {
      setLoadingSubmit(false);
      setChatErrorMessage(text.aiResponseUnavailable);
      console.warn('Chat request failed:', error.message, error.cause);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  useEffect(() => {
    if (status === 'streaming') {
      setLoadingSubmit(false);
      return;
    }

    if (status === 'ready' || status === 'error') {
      setLoadingSubmit(false);
    }
  }, [status]);

  const replaceChatUrl = useCallback(() => {
    const params = new URLSearchParams({ lang: language, theme });
    router.replace(`/chat?${params.toString()}`, { scroll: false });
  }, [language, router, theme]);

  useEffect(() => {
    setConversations(readStoredConversations());
  }, []);

  useEffect(() => {
    if (
      !initialConversationId ||
      activeConversationId === initialConversationId
    ) {
      return;
    }

    const requestedConversation = readStoredConversations().find(
      (conversation) => conversation.id === initialConversationId
    );

    if (!requestedConversation) return;

    setMessages(requestedConversation.messages);
    setInput('');
    setActiveConversationId(requestedConversation.id);
    setAutoSubmitted(true);
  }, [activeConversationId, initialConversationId, setInput, setMessages]);

  useEffect(() => {
    if (!activeConversationId || messages.length === 0) return;

    const nextConversations = upsertStoredConversation({
      conversations: readStoredConversations(),
      id: activeConversationId,
      messages,
    });

    writeStoredConversations(nextConversations);
    setConversations(nextConversations);
  }, [activeConversationId, messages]);

  const { currentAIMessage, latestUserMessage, hasActiveTool } = useMemo(() => {
    const latestAIMessageIndex = messages.findLastIndex(
      (m) => m.role === 'assistant'
    );
    const latestUserMessageIndex = messages.findLastIndex(
      (m) => m.role === 'user'
    );

    const result = {
      currentAIMessage:
        latestAIMessageIndex !== -1 ? messages[latestAIMessageIndex] : null,
      latestUserMessage:
        latestUserMessageIndex !== -1 ? messages[latestUserMessageIndex] : null,
      hasActiveTool: false,
    };

    if (result.currentAIMessage) {
      result.hasActiveTool =
        result.currentAIMessage.parts?.some((part) =>
          isCompletedToolPart(part)
        ) || false;
    }

    if (latestAIMessageIndex < latestUserMessageIndex) {
      result.currentAIMessage = null;
    }

    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' && m.parts?.some((part) => isPendingToolPart(part))
  );

  const submitQuery = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery || isToolInProgress) return;

      const conversationId = activeConversationId ?? createConversationId();
      if (!activeConversationId) setActiveConversationId(conversationId);

      setLastSubmittedQuery(trimmedQuery);
      setChatErrorMessage(null);
      clearError();
      markQueryAsked(trimmedQuery);
      setLoadingSubmit(true);
      void sendMessage(
        {
          text: trimmedQuery,
        },
        {
          body: {
            conversationId,
          },
        }
      );
    },
    [
      activeConversationId,
      clearError,
      isToolInProgress,
      markQueryAsked,
      sendMessage,
    ]
  );

  useEffect(() => {
    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);
      setInput('');
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted, setInput, submitQuery]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isToolInProgress) return;
    submitQuery(input);
    setInput('');
  };

  const handleStop = () => {
    void stop();
    setLoadingSubmit(false);
  };

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    setActiveConversationId(null);
    setLastSubmittedQuery(null);
    setChatErrorMessage(null);
    setLoadingSubmit(false);
    setAutoSubmitted(false);
    replaceChatUrl();
  }, [replaceChatUrl, setInput, setMessages]);

  const handleSelectConversation = useCallback(
    (conversation: StoredChatConversation) => {
      setMessages(conversation.messages);
      setInput('');
      setActiveConversationId(conversation.id);
      setLastSubmittedQuery(null);
      setChatErrorMessage(null);
      setLoadingSubmit(false);
      replaceChatUrl();
    },
    [replaceChatUrl, setInput, setMessages]
  );

  const latestUserText =
    (latestUserMessage ? getMessageText(latestUserMessage) : '') ||
    lastSubmittedQuery;

  const hasConversationContent =
    loadingSubmit ||
    Boolean(latestUserText) ||
    messages.some(
      (message) => message.role === 'user' || message.role === 'assistant'
    );
  const isEmptyState = !hasConversationContent;
  const shouldShowFixedHeader = hasConversationContent;

  // Calculate header height based on hasActiveTool
  const headerHeight = !shouldShowFixedHeader ? 24 : hasActiveTool ? 100 : 180;

  return (
    <div className="relative h-screen overflow-hidden pl-[72px]">
      <PortfolioSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      />

      <div className="absolute top-6 right-8 z-51 flex flex-col-reverse items-center justify-center gap-1 md:flex-row">
        <WelcomeModal
          trigger={
            <div className="hover:bg-accent cursor-pointer rounded-2xl px-3 py-1.5">
              <Info className="text-accent-foreground h-8" />
            </div>
          }
        />
      </div>

      {/* Fixed Avatar Header with Gradient */}
      {shouldShowFixedHeader && (
        <div className="from-background via-background/95 to-background/0 fixed top-0 right-0 left-[72px] z-50 bg-gradient-to-b">
          <div
            className={`transition-all duration-300 ease-in-out ${hasActiveTool ? 'pt-6 pb-0' : 'py-6'}`}
          >
            <div className="flex justify-center">
              <button
                className="cursor-pointer"
                onClick={() => (window.location.href = '/')}
                aria-label="Go to AskOosu home"
              >
                <OosuAvatar
                  priority
                  variant="static"
                  animate={false}
                  className={`transition-all duration-300 ${hasActiveTool ? 'h-20 w-20' : 'h-28 w-28'}`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="container mx-auto flex h-full max-w-3xl flex-col">
        {/* Scrollable Chat Content */}
        <div
          className="flex-1 overflow-y-auto px-2"
          style={{ paddingTop: `${headerHeight}px` }}
        >
          <AnimatePresence mode="wait">
            {isEmptyState ? (
              <motion.div
                key="landing"
                className="flex min-h-full items-center justify-center"
                {...MOTION_CONFIG}
              >
                <ChatLanding />
              </motion.div>
            ) : (
              <motion.div
                key="conversation"
                className="flex min-h-full flex-col justify-start pb-4"
                {...MOTION_CONFIG}
              >
                {latestUserText && (
                  <UserQuestionBubble content={latestUserText} />
                )}

                {currentAIMessage ? (
                  <SimplifiedChatView
                    message={currentAIMessage}
                    isLoading={isLoading}
                    regenerate={regenerate}
                    sessionId={activeConversationId}
                    question={latestUserText}
                  />
                ) : loadingSubmit ? (
                  <div className="px-4 pt-4">
                    <ChatBubble variant="received">
                      <ChatBubbleMessage isLoading />
                    </ChatBubble>
                  </div>
                ) : (
                  chatErrorMessage && (
                    <AssistantNoticeBubble content={chatErrorMessage} />
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="bg-background sticky bottom-0 px-2 pt-3 md:px-0 md:pb-4">
          <div className="relative flex flex-col items-center gap-3">
            <HelperBoost submitQuery={submitQuery} setInput={setInput} />
            <ChatBottombar
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              stop={handleStop}
              isToolInProgress={isToolInProgress}
              placeholder={text.askAnything}
              thinkingLabel={text.thinking}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

function UserQuestionBubble({ content }: { content: string }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pb-4">
      <ChatBubble
        variant="sent"
        className="mr-0 ml-auto max-w-[min(85%,40rem)] self-end"
      >
        <ChatBubbleMessage>{content}</ChatBubbleMessage>
      </ChatBubble>
    </div>
  );
}

function AssistantNoticeBubble({ content }: { content: string }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl justify-start px-4 pt-2">
      <ChatBubble variant="received" className="max-w-[min(90%,42rem)]">
        <ChatBubbleMessage className="text-muted-foreground rounded-lg border px-4 py-3 text-sm">
          {content}
        </ChatBubbleMessage>
      </ChatBubble>
    </div>
  );
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function isToolPart(part: UIMessage['parts'][number]) {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-');
}

function isCompletedToolPart(part: UIMessage['parts'][number]) {
  if (!isToolPart(part) || !('state' in part)) return false;

  return (
    part.state === 'output-available' ||
    part.state === 'output-error' ||
    part.state === 'output-denied'
  );
}

function isPendingToolPart(part: UIMessage['parts'][number]) {
  return isToolPart(part) && !isCompletedToolPart(part);
}
