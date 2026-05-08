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
import { isAskOosuDebugUiEnabled } from '@/lib/debug-ui';
import type {
  AnswerVariant,
  QuestionSurface,
} from '@/data/question-surfaces.shared';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import { useSuggestedQuestions } from '@/hooks/use-suggested-questions';
import {
  findSuggestedQuestionId,
  getSuggestedQuestionRoutingMeta,
  type SuggestedQuestion,
} from '@/lib/suggested-questions';
import {
  archiveAllStoredConversations,
  archiveStoredConversation,
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
import { ArrowDown, Info, MailWarning, RefreshCcw } from 'lucide-react';
import HelperBoost from './HelperBoost';
import { buildVisibleAnswerPlan } from '@/lib/chat/visible-answer-plan';

const MOTION_CONFIG = {
  initial: false,
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
};

const ERROR_REPORT_EMAIL = 'gabrieldiseoul@gmail.com';
const MAX_REQUEST_HISTORY_MESSAGES = 8;

type ChatErrorNotice = {
  title: string;
  message: string;
  retryLabel: string;
  reportLabel: string;
  reportHref: string;
};

type PendingChatQuery = {
  query: string;
  suggestedQuestion?: SuggestedQuestion;
};

const Chat = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('query');
  const initialConversationId = searchParams.get('conversationId');
  const isDebugMode = isAskOosuDebugUiEnabled(searchParams);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState<string | null>(
    null
  );
  const [chatErrorNotice, setChatErrorNotice] =
    useState<ChatErrorNotice | null>(null);
  const [pendingQueries, setPendingQueries] = useState<PendingChatQuery[]>([]);
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
  const { markQuestionAsked, markQueryAsked } = useSuggestedQuestions(
    5,
    'home',
    activeConversationId
  );
  const text = getUiText(language);
  const loadingLabel = text.chatLoadingMessages[0];
  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: '/api/chat',
        prepareSendMessagesRequest({
          api,
          body,
          credentials,
          headers,
          id,
          messageId,
          messages,
          trigger,
        }) {
          return {
            api,
            credentials,
            headers,
            body: {
              ...(body ?? {}),
              id,
              messageId,
              trigger,
              messages: prepareClientMessagesForRequest(messages),
            },
          };
        },
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
      setChatErrorNotice(buildChatErrorNotice(error, language));
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
    if (isDebugMode) params.set('debug', 'true');
    router.replace(`/chat?${params.toString()}`, { scroll: false });
  }, [isDebugMode, language, router, theme]);

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

  useEffect(() => {
    if (!activeConversationId || messages.length === 0) return;

    for (const message of messages) {
      if (message.role !== 'user') continue;
      markQueryAsked(getMessageText(message), activeConversationId);
    }
  }, [activeConversationId, markQueryAsked, messages]);

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
  const isGeneratingAnswer = isLoading || isToolInProgress || loadingSubmit;

  const enqueuePendingQuery = useCallback(
    (query: string, suggestedQuestion?: SuggestedQuestion) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return false;

      setPendingQueries((currentQueries) => {
        if (currentQueries.some((item) => item.query === trimmedQuery)) {
          return currentQueries;
        }

        return [...currentQueries, { query: trimmedQuery, suggestedQuestion }];
      });
      return true;
    },
    []
  );

  const executeQuery = useCallback(
    (query: string, suggestedQuestion?: SuggestedQuestion) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return false;

      const exactSuggestedQuestion =
        suggestedQuestion ??
        getSuggestedQuestionRoutingMeta(
          findSuggestedQuestionId(trimmedQuery),
          language
        ) ??
        undefined;
      const conversationId = activeConversationId ?? createConversationId();
      if (!activeConversationId) setActiveConversationId(conversationId);

      setLastSubmittedQuery(trimmedQuery);
      setChatErrorNotice(null);
      clearError();
      if (exactSuggestedQuestion?.id) {
        markQuestionAsked(exactSuggestedQuestion.id, conversationId);
      } else {
        markQueryAsked(trimmedQuery, conversationId);
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
            starterQuestionId: exactSuggestedQuestion?.id ?? null,
            faqId: exactSuggestedQuestion?.faqId,
            intentId: exactSuggestedQuestion?.intentId,
            displayQuestion: exactSuggestedQuestion?.displayQuestion,
            originalQuickLabel: exactSuggestedQuestion?.quickLabel,
            answerVariant: exactSuggestedQuestion?.answerVariant,
            renderSpec: exactSuggestedQuestion?.renderSpec,
            source: exactSuggestedQuestion ? 'quick_question' : 'typed_question',
          },
        }
      );
      return true;
    },
    [
      activeConversationId,
      clearError,
      language,
      markQuestionAsked,
      markQueryAsked,
      sendMessage,
    ]
  );

  const submitQuery = useCallback(
    (query: string, suggestedQuestion?: SuggestedQuestion) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return false;

      if (isGeneratingAnswer) {
        const exactSuggestedQuestion =
          suggestedQuestion ??
          getSuggestedQuestionRoutingMeta(
            findSuggestedQuestionId(trimmedQuery),
            language
          ) ??
          undefined;
        const conversationId = activeConversationId ?? createConversationId();
        if (!activeConversationId) setActiveConversationId(conversationId);

        if (exactSuggestedQuestion?.id) {
          markQuestionAsked(exactSuggestedQuestion.id, conversationId);
        } else {
          markQueryAsked(trimmedQuery, conversationId);
        }

        return enqueuePendingQuery(trimmedQuery, exactSuggestedQuestion);
      }

      return executeQuery(trimmedQuery, suggestedQuestion);
    },
    [
      activeConversationId,
      enqueuePendingQuery,
      executeQuery,
      isGeneratingAnswer,
      language,
      markQuestionAsked,
      markQueryAsked,
    ]
  );

  useEffect(() => {
    if (isGeneratingAnswer || pendingQueries.length === 0) return;

    const [nextQuery, ...remainingQueries] = pendingQueries;
    setPendingQueries(remainingQueries);
    executeQuery(nextQuery.query, nextQuery.suggestedQuestion);
  }, [executeQuery, isGeneratingAnswer, pendingQueries]);

  useEffect(() => {
    const trimmedInitialQuery = initialQuery?.trim();
    const initialQueryKey = trimmedInitialQuery
      ? buildInitialQueryKey(searchParams, trimmedInitialQuery)
      : null;
    if (
      trimmedInitialQuery &&
      !initialConversationId &&
      autoSubmittedQueryRef.current !== initialQueryKey
    ) {
      const suggestedQuestion = buildInitialSuggestedQuestion(
        searchParams,
        trimmedInitialQuery
      );

      setInput('');
      const didSubmit = submitQuery(trimmedInitialQuery, suggestedQuestion);
      if (didSubmit) {
        autoSubmittedQueryRef.current = initialQueryKey;
        replaceChatUrl();
      }
    }
  }, [
    initialQuery,
    initialConversationId,
    replaceChatUrl,
    searchParams,
    setInput,
    submitQuery,
  ]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;
    const didSubmit = submitQuery(input);
    if (didSubmit) setInput('');
  };

  const handleStop = () => {
    void stop();
    setLoadingSubmit(false);
    setPendingQueries([]);
  };

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    setActiveConversationId(null);
    setActiveSurface('home');
    setLastSubmittedQuery(null);
    setChatErrorNotice(null);
    setLoadingSubmit(false);
    setPendingQueries([]);
    autoSubmittedQueryRef.current = null;
    replaceChatUrl();
  }, [replaceChatUrl, setInput, setMessages]);

  const handleSelectConversation = useCallback(
    (conversation: StoredChatConversation) => {
      setMessages(conversation.messages);
      setInput('');
      setActiveConversationId(conversation.id);
      setLastSubmittedQuery(null);
      setChatErrorNotice(null);
      setLoadingSubmit(false);
      setPendingQueries([]);
      replaceChatUrl();
    },
    [replaceChatUrl, setInput, setMessages]
  );

  const handleArchiveConversation = useCallback(
    (conversationId: string) => {
      const nextConversations = archiveStoredConversation(conversationId);
      setConversations(nextConversations);

      if (activeConversationId === conversationId) {
        setMessages([]);
        setInput('');
        setActiveConversationId(null);
        setActiveSurface('home');
        setLastSubmittedQuery(null);
        setChatErrorNotice(null);
        setLoadingSubmit(false);
        setPendingQueries([]);
        autoSubmittedQueryRef.current = null;
        replaceChatUrl();
      }
    },
    [activeConversationId, replaceChatUrl, setInput, setMessages]
  );

  const handleArchiveAllConversations = useCallback(() => {
    setConversations(archiveAllStoredConversations());
    setMessages([]);
    setInput('');
    setActiveConversationId(null);
    setActiveSurface('home');
    setLastSubmittedQuery(null);
    setChatErrorNotice(null);
    setLoadingSubmit(false);
    setPendingQueries([]);
    autoSubmittedQueryRef.current = null;
    replaceChatUrl();
  }, [replaceChatUrl, setInput, setMessages]);

  const latestUserText =
    (latestUserMessage ? getMessageText(latestUserMessage) : '') ||
    lastSubmittedQuery;
  const visibleLoadingSteps = useMemo(
    () => buildVisibleAnswerPlan(latestUserText, language),
    [language, latestUserText]
  );

  const handleRetryChatError = useCallback(() => {
    setChatErrorNotice(null);
    clearError();
    setLoadingSubmit(true);
    void regenerate().catch((error) => {
      setLoadingSubmit(false);
      setChatErrorNotice(buildChatErrorNotice(error, language));
    });
  }, [clearError, language, regenerate]);

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
    <div className="relative h-dvh overflow-hidden md:pl-[72px]">
      <PortfolioSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onArchiveConversation={handleArchiveConversation}
        onArchiveAllConversations={handleArchiveAllConversations}
        onConversationsChange={setConversations}
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

                {messages.map((message, index) => {
                  if (message.role === 'user') {
                    return (
                      <UserQuestionBubble
                        key={message.id}
                        content={getMessageText(message)}
                      />
                    );
                  }

                  if (message.role === 'assistant') {
                    const previousUserText = getPreviousUserText(
                      messages,
                      index
                    );

                    return (
                      <SimplifiedChatView
                        key={message.id}
                        message={message}
                        isLoading={
                          isLoading && index === latestAssistantMessageIndex
                        }
                        regenerate={regenerate}
                        sessionId={activeConversationId}
                        question={previousUserText}
                        loadingLabel={loadingLabel}
                        loadingSteps={buildVisibleAnswerPlan(
                          previousUserText,
                          language
                        )}
                      />
                    );
                  }

                  return null;
                })}

                {loadingSubmit &&
                latestAssistantMessageIndex <
                  messages.findLastIndex(
                    (message) => message.role === 'user'
                  ) ? (
                  <div className="px-4 pt-4">
                    <ChatBubble variant="received">
                      <ChatBubbleMessage
                        isLoading
                        loadingLabel={loadingLabel}
                        loadingSteps={visibleLoadingSteps}
                        className="bg-background/85 min-h-[5.75rem] w-full rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-sm"
                      />
                    </ChatBubble>
                  </div>
                ) : null}

                {chatErrorNotice && (
                  <AssistantNoticeBubble
                    notice={chatErrorNotice}
                    onRetry={handleRetryChatError}
                  />
                )}
                {pendingQueries.map((pendingQuery, index) => (
                  <PendingQuestionBubble
                    key={`${pendingQuery.query}-${index}`}
                    content={pendingQuery.query}
                    language={language}
                  />
                ))}
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
              conversationId={activeConversationId}
              hasReachedLimit={isToolInProgress}
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

function PendingQuestionBubble({
  content,
  language,
}: {
  content: string;
  language: 'ko' | 'en';
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pb-4">
      <div className="mr-0 ml-auto max-w-[min(85%,40rem)] rounded-2xl border border-dashed border-teal-400/45 bg-teal-500/10 px-4 py-3 text-right text-sm text-teal-900/75 backdrop-blur-sm dark:text-teal-100/75">
        <p className="break-words whitespace-pre-wrap">{content}</p>
        <p className="mt-1 text-xs text-teal-800/55 dark:text-teal-100/50">
          {language === 'ko' ? '답변 대기 중' : 'Queued'}
        </p>
      </div>
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

function AssistantNoticeBubble({
  notice,
  onRetry,
}: {
  notice: ChatErrorNotice;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl justify-start px-4 pt-2">
      <ChatBubble variant="received" className="max-w-[min(90%,42rem)]">
        <ChatBubbleMessage className="text-muted-foreground rounded-lg border px-4 py-3 text-sm">
          <div className="space-y-3">
            <div>
              <p className="text-foreground font-medium">{notice.title}</p>
              <p className="mt-1 leading-relaxed">{notice.message}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 rounded-lg"
                onClick={onRetry}
              >
                <RefreshCcw className="h-4 w-4" />
                {notice.retryLabel}
              </Button>
              <Button
                asChild
                type="button"
                size="sm"
                variant="outline"
                className="h-8 rounded-lg"
              >
                <a href={notice.reportHref}>
                  <MailWarning className="h-4 w-4" />
                  {notice.reportLabel}
                </a>
              </Button>
            </div>
          </div>
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

function prepareClientMessagesForRequest(messages: UIMessage[]): UIMessage[] {
  return messages
    .slice(-MAX_REQUEST_HISTORY_MESSAGES)
    .map((message) => {
      const parts = message.parts
        .map((part) => {
          if (part.type !== 'text') return null;
          const text = part.text.trim();
          if (!text) return null;

          return { type: 'text' as const, text };
        })
        .filter((part): part is { type: 'text'; text: string } =>
          Boolean(part)
        );

      return {
        id: message.id,
        role: message.role,
        parts,
      } as UIMessage;
    })
    .filter((message) => message.parts.length > 0);
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

function buildInitialSuggestedQuestion(
  searchParams: Pick<URLSearchParams, 'get'>,
  query: string
): SuggestedQuestion | undefined {
  if (searchParams.get('source') !== 'quick_question') return undefined;

  const faqId = searchParams.get('faqId');
  if (!faqId) return undefined;

  const displayQuestion = searchParams.get('displayQuestion') ?? query;
  const quickLabel =
    searchParams.get('originalQuickLabel') ?? displayQuestion ?? query;

  return {
    id: searchParams.get('starterQuestionId') ?? faqId,
    faqId,
    surface: 'typed_only',
    priority: 0,
    quickLabel,
    displayQuestion,
    text: quickLabel,
    intentId: searchParams.get('intentId') ?? faqId,
    answerVariant: toAnswerVariant(searchParams.get('answerVariant')),
    renderSpec: searchParams.get('renderSpec') ?? undefined,
    visibleByDefault: false,
  };
}

function buildInitialQueryKey(
  searchParams: Pick<URLSearchParams, 'get'>,
  query: string
) {
  return [
    query,
    searchParams.get('source') ?? '',
    searchParams.get('starterQuestionId') ?? '',
    searchParams.get('faqId') ?? '',
    searchParams.get('intentId') ?? '',
    searchParams.get('answerVariant') ?? '',
    searchParams.get('renderSpec') ?? '',
  ].join('|');
}

function toAnswerVariant(value: string | null): AnswerVariant {
  if (value === 'short' || value === 'detailed') return value;
  return 'default';
}

function buildChatErrorNotice(
  error: unknown,
  language: 'ko' | 'en'
): ChatErrorNotice {
  const message = getErrorMessage(error);
  const normalizedMessage = message.toLowerCase();
  const isOffline =
    typeof navigator !== 'undefined' && navigator.onLine === false;
  const kind = isOffline
    ? 'network'
    : normalizedMessage.includes('429') ||
        normalizedMessage.includes('too many') ||
        normalizedMessage.includes('rate limit') ||
        normalizedMessage.includes('quota') ||
        normalizedMessage.includes('insufficient_quota')
      ? 'limit'
      : normalizedMessage.includes('fetch failed') ||
          normalizedMessage.includes('failed to fetch') ||
          normalizedMessage.includes('network') ||
          normalizedMessage.includes('timeout')
        ? 'network'
        : 'api';

  const copy = getChatErrorCopy(language);

  return {
    ...copy,
    retryLabel: language === 'ko' ? '다시 시도' : 'Retry',
    reportLabel: language === 'ko' ? '오류 리포트 보내기' : 'Report this issue',
    reportHref: buildErrorReportHref({
      kind,
      language,
    }),
  };
}

function getChatErrorCopy(language: 'ko' | 'en') {
  if (language === 'ko') {
    return {
      title: '잠시 후 다시 시도해 주세요.',
      message: '답변 엔진이 잠깐 쉬는 중이에요. 잠시 후 다시 시도해 주세요.',
    };
  }

  return {
    title: 'Please try again soon.',
    message:
      'The answer engine is taking a short break. Please try again soon.',
  };
}

function buildErrorReportHref({
  kind,
  language,
}: {
  kind: string;
  language: 'ko' | 'en';
}) {
  const subject = `[AskOosu] Chat error report: ${kind}`;
  const currentUrl =
    typeof window === 'undefined' ? 'unknown' : window.location.href;
  const body = [
    'AskOosu chat error report',
    '',
    `Kind: ${kind}`,
    `Language: ${language}`,
    `URL: ${currentUrl}`,
    'Raw provider details are omitted from the public UI.',
  ].join('\n');

  return `mailto:${ERROR_REPORT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown chat error';
}
