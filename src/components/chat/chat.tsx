'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// Component imports
import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import { PortfolioSidebar } from '@/components/portfolio-sidebar';
import { OosuAvatar } from '@/components/oosu-avatar';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import { getUiText } from '@/lib/i18n';
import type { QuestionSurface } from '@/data/question-surfaces.shared';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import { useSuggestedQuestions } from '@/hooks/use-suggested-questions';
import {
  findSuggestedQuestionId,
  type SuggestedQuestion,
} from '@/lib/suggested-questions';
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
import { Button } from '@/components/ui/button';
import WelcomeModal from '@/components/welcome-modal';
import { ArrowDown, Info } from 'lucide-react';
import HelperBoost from './HelperBoost';

const MOTION_CONFIG = {
  initial: false,
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
  const [activeSurface, setActiveSurface] = useState<QuestionSurface>('home');
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const autoSubmittedQueryRef = useRef<string | null>(null);
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
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const isScrolledNearBottom = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return true;

    const distanceFromBottom =
      scrollContainer.scrollHeight -
      scrollContainer.scrollTop -
      scrollContainer.clientHeight;

    return distanceFromBottom < 180;
  }, []);

  const scrollToLatest = useCallback((behavior: ScrollBehavior = 'smooth') => {
    conversationEndRef.current?.scrollIntoView({
      block: 'end',
      behavior,
    });
    setShowJumpToLatest(false);
  }, []);

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
    const handleSurfaceChange = (event: Event) => {
      const detail = (event as CustomEvent<{ surface?: QuestionSurface }>)
        .detail;
      if (!detail?.surface) return;
      setActiveSurface(detail.surface);
    };

    window.addEventListener('askoosu:question-surface', handleSurfaceChange);
    return () => {
      window.removeEventListener(
        'askoosu:question-surface',
        handleSurfaceChange
      );
    };
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

  const { latestUserMessage, hasActiveTool, latestAssistantMessageIndex } =
    useMemo(() => {
      const latestAIMessageIndex = messages.findLastIndex(
        (m) => m.role === 'assistant'
      );
      const latestUserMessageIndex = messages.findLastIndex(
        (m) => m.role === 'user'
      );

      const result = {
        latestUserMessage:
          latestUserMessageIndex !== -1
            ? messages[latestUserMessageIndex]
            : null,
        hasActiveTool: false,
        latestAssistantMessageIndex: latestAIMessageIndex,
      };

      const currentAIMessage =
        latestAIMessageIndex !== -1 ? messages[latestAIMessageIndex] : null;

      if (currentAIMessage) {
        result.hasActiveTool =
          currentAIMessage.parts?.some((part) => isCompletedToolPart(part)) ||
          false;
      }

      return result;
    }, [messages]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' && m.parts?.some((part) => isPendingToolPart(part))
  );

  const submitQuery = useCallback(
    (query: string, suggestedQuestion?: SuggestedQuestion) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery || isToolInProgress) return;

      const conversationId = activeConversationId ?? createConversationId();
      if (!activeConversationId) setActiveConversationId(conversationId);

      setLastSubmittedQuery(trimmedQuery);
      setChatErrorMessage(null);
      clearError();
      if (!suggestedQuestion) {
        markQueryAsked(trimmedQuery);
      }
      setLoadingSubmit(true);
      void sendMessage(
        {
          text: trimmedQuery,
        },
        {
          body: {
            message: trimmedQuery,
            conversationId,
            locale: language,
            language,
            starterQuestionId:
              suggestedQuestion?.id ??
              findSuggestedQuestionId(trimmedQuery) ??
              null,
            faqId: suggestedQuestion?.faqId,
            intentId: suggestedQuestion?.intentId,
            displayQuestion: suggestedQuestion?.displayQuestion,
            originalQuickLabel: suggestedQuestion?.quickLabel,
            answerVariant: suggestedQuestion?.answerVariant,
            renderSpec: suggestedQuestion?.renderSpec,
            source: suggestedQuestion ? 'quick_question' : 'typed_question',
          },
        }
      );
    },
    [
      activeConversationId,
      clearError,
      isToolInProgress,
      language,
      markQueryAsked,
      sendMessage,
    ]
  );

  useEffect(() => {
    const trimmedInitialQuery = initialQuery?.trim();
    if (
      trimmedInitialQuery &&
      !autoSubmitted &&
      autoSubmittedQueryRef.current !== trimmedInitialQuery
    ) {
      autoSubmittedQueryRef.current = trimmedInitialQuery;
      setAutoSubmitted(true);
      setInput('');
      submitQuery(trimmedInitialQuery);
      replaceChatUrl();
    }
  }, [initialQuery, autoSubmitted, replaceChatUrl, setInput, submitQuery]);

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
    setActiveSurface('home');
    setLastSubmittedQuery(null);
    setChatErrorMessage(null);
    setLoadingSubmit(false);
    setAutoSubmitted(false);
    autoSubmittedQueryRef.current = null;
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
  const shouldOfferJumpToLatest =
    hasConversationContent && messages.length >= 4;

  const handleChatScroll = useCallback(() => {
    if (!shouldOfferJumpToLatest) {
      setShowJumpToLatest(false);
      return;
    }

    setShowJumpToLatest(!isScrolledNearBottom());
  }, [isScrolledNearBottom, shouldOfferJumpToLatest]);

  useEffect(() => {
    if (!hasConversationContent) {
      setShowJumpToLatest(false);
      return;
    }

    if (isScrolledNearBottom()) {
      scrollToLatest('auto');
      return;
    }

    if (shouldOfferJumpToLatest) {
      setShowJumpToLatest(true);
    }
  }, [
    hasConversationContent,
    isScrolledNearBottom,
    loadingSubmit,
    messages,
    scrollToLatest,
    shouldOfferJumpToLatest,
    status,
  ]);

  return (
    <div className="relative h-screen overflow-hidden md:pl-[72px]">
      <PortfolioSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      />

      <div className="absolute top-4 right-4 z-51 flex flex-col-reverse items-center justify-center gap-1 md:top-6 md:right-8 md:flex-row">
        <WelcomeModal
          trigger={
            <div className="hover:bg-accent cursor-pointer rounded-2xl px-3 py-1.5">
              <Info className="text-accent-foreground h-8" />
            </div>
          }
        />
      </div>

      {/* Main Content Area */}
      <div className="relative container mx-auto flex h-full max-w-3xl flex-col">
        {/* Scrollable Chat Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto px-2 pt-4 pb-36 md:pb-40"
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
                className="flex min-h-full flex-col justify-start gap-4 pb-4"
                {...MOTION_CONFIG}
              >
                <ConversationAvatarHeader compact={hasActiveTool} />

                {messages.map((message, index) =>
                  message.role === 'user' ? (
                    <UserQuestionBubble
                      key={message.id}
                      content={getMessageText(message)}
                    />
                  ) : message.role === 'assistant' ? (
                    <SimplifiedChatView
                      key={message.id}
                      message={message}
                      isLoading={
                        isLoading && index === latestAssistantMessageIndex
                      }
                      regenerate={regenerate}
                      sessionId={activeConversationId}
                      question={getPreviousUserText(messages, index)}
                    />
                  ) : null
                )}

                {loadingSubmit &&
                latestAssistantMessageIndex <
                  messages.findLastIndex(
                    (message) => message.role === 'user'
                  ) ? (
                  <div className="px-4 pt-4">
                    <ChatBubble variant="received">
                      <ChatBubbleMessage isLoading />
                    </ChatBubble>
                  </div>
                ) : null}

                {chatErrorMessage && (
                  <AssistantNoticeBubble content={chatErrorMessage} />
                )}
                <div ref={conversationEndRef} className="h-1" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-2 pt-8 pb-[max(0.75rem,env(safe-area-inset-bottom))] before:pointer-events-none before:absolute before:inset-x-[-100vw] before:top-0 before:bottom-0 before:-z-10 before:bg-white/[0.025] before:backdrop-blur-2xl before:[mask-image:linear-gradient(to_bottom,transparent,black_34%,black)] md:px-0 md:pb-4 dark:before:bg-white/[0.012]">
          <div className="pointer-events-auto relative flex flex-col items-center gap-3">
            <AnimatePresence>
              {showJumpToLatest && (
                <motion.div
                  key="jump-to-latest"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute -top-10 right-3 z-10 md:-top-12 md:right-6"
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    aria-label={
                      language === 'ko'
                        ? '최신 답변으로 이동'
                        : 'Jump to the latest answer'
                    }
                    className="h-8 rounded-full border shadow-sm"
                    onClick={() => scrollToLatest()}
                  >
                    <ArrowDown className="h-4 w-4" />
                    {language === 'ko' ? '최신 답변' : 'Latest'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <HelperBoost
              submitQuery={submitQuery}
              setInput={setInput}
              activeSurface={activeSurface}
            />
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

function ConversationAvatarHeader({ compact }: { compact: boolean }) {
  return (
    <div className="flex justify-center pt-4">
      <button
        className="cursor-pointer"
        onClick={() => (window.location.href = '/')}
        aria-label="Go to AskOosu home"
      >
        <OosuAvatar
          priority
          variant="static"
          animate={false}
          className={`transition-all duration-300 ${compact ? 'h-20 w-20' : 'h-28 w-28'}`}
        />
      </button>
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

function getPreviousUserText(messages: UIMessage[], assistantIndex: number) {
  for (let index = assistantIndex - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === 'user') return getMessageText(message);
  }

  return null;
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
