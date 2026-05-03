'use client';
import { useChat } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Component imports
import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import ChatMessageContent from '@/components/chat/chat-message-content';
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
  const [isTalking, setIsTalking] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<StoredChatConversation[]>(
    []
  );
  const { language, theme } = useDisplayPreferences();
  const { markQueryAsked } = useSuggestedQuestions(5);
  const text = getUiText(language);

  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    stop,
    setMessages,
    setInput,
    reload,
    addToolResult,
    append,
  } = useChat({
    body: {
      conversationId: activeConversationId,
    },
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
        setIsTalking(true);
      }
    },
    onFinish: () => {
      setLoadingSubmit(false);
      setIsTalking(false);
    },
    onError: (error) => {
      setLoadingSubmit(false);
      setIsTalking(false);
      console.error('Chat error:', error.message, error.cause);
      toast.error(`Error: ${error.message}`);
    },
    onToolCall: (tool) => {
      const toolName = tool.toolCall.toolName;
      console.log('Tool call:', toolName);
    },
  });

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
        result.currentAIMessage.parts?.some(
          (part) =>
            part.type === 'tool-invocation' &&
            part.toolInvocation?.state === 'result'
        ) || false;
    }

    if (latestAIMessageIndex < latestUserMessageIndex) {
      result.currentAIMessage = null;
    }

    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' &&
      m.parts?.some(
        (part) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation?.state !== 'result'
      )
  );

  const submitQuery = useCallback(
    (query: string) => {
      if (!query.trim() || isToolInProgress) return;

      if (!activeConversationId) {
        setActiveConversationId(createConversationId());
      }

      markQueryAsked(query);
      setLoadingSubmit(true);
      void append({
        role: 'user',
        content: query,
      });
    },
    [activeConversationId, append, isToolInProgress, markQueryAsked]
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
    stop();
    setLoadingSubmit(false);
    setIsTalking(false);
  };

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    setActiveConversationId(null);
    setLoadingSubmit(false);
    setIsTalking(false);
    setAutoSubmitted(false);
    replaceChatUrl();
  }, [replaceChatUrl, setInput, setMessages]);

  const handleSelectConversation = useCallback(
    (conversation: StoredChatConversation) => {
      setMessages(conversation.messages);
      setInput('');
      setActiveConversationId(conversation.id);
      setLoadingSubmit(false);
      setIsTalking(false);
      replaceChatUrl();
    },
    [replaceChatUrl, setInput, setMessages]
  );

  // Check if this is the initial empty state (no messages)
  const isEmptyState =
    !currentAIMessage && !latestUserMessage && !loadingSubmit;

  // Calculate header height based on hasActiveTool
  const headerHeight = hasActiveTool ? 100 : 180;

  return (
    <div className="relative h-screen overflow-hidden">
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
      <div className="from-background via-background/95 to-background/0 fixed top-0 right-0 left-0 z-50 bg-gradient-to-b">
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
                variant={
                  isTalking || isLoading || loadingSubmit ? 'hover' : 'static'
                }
                animate={isTalking || isLoading || loadingSubmit}
                interval={hasActiveTool ? 150 : 120}
                className={`transition-all duration-300 ${hasActiveTool ? 'h-20 w-20' : 'h-28 w-28'}`}
              />
            </button>
          </div>

          <AnimatePresence>
            {latestUserMessage && !currentAIMessage && (
              <motion.div
                {...MOTION_CONFIG}
                className="mx-auto flex max-w-3xl px-4"
              >
                <ChatBubble variant="sent">
                  <ChatBubbleMessage>
                    <ChatMessageContent
                      message={latestUserMessage}
                      isLast={true}
                      isLoading={false}
                      reload={() => Promise.resolve(null)}
                    />
                  </ChatBubbleMessage>
                </ChatBubble>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
                <ChatLanding submitQuery={submitQuery} />
              </motion.div>
            ) : currentAIMessage ? (
              <div className="pb-4">
                <SimplifiedChatView
                  message={currentAIMessage}
                  isLoading={isLoading}
                  reload={reload}
                  addToolResult={addToolResult}
                />
              </div>
            ) : (
              loadingSubmit && (
                <motion.div
                  key="loading"
                  {...MOTION_CONFIG}
                  className="px-4 pt-18"
                >
                  <ChatBubble variant="received">
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                </motion.div>
              )
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
