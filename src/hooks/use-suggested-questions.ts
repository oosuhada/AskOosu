'use client';

import {
  findSuggestedQuestionId,
  getRelatedSuggestedQuestionIds,
  getSuggestedQuestions,
  suggestedQuestionIds,
  type SuggestedQuestionId,
} from '@/lib/suggested-questions';
import type { QuestionSurface } from '@/data/question-surfaces.shared';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import { useCallback, useEffect, useMemo, useState } from 'react';

const ASKED_QUESTIONS_STORAGE_KEY = 'ask-oosu-asked-question-ids';
const ASKED_QUESTIONS_CHANGE_EVENT = 'askoosu:asked-questions-change';

export function useSuggestedQuestions(
  limit = 5,
  surface: QuestionSurface = 'home',
  conversationId?: string | null
) {
  const { language } = useDisplayPreferences();
  const [askedQuestionIds, setAskedQuestionIds] = useState<
    SuggestedQuestionId[]
  >([]);

  useEffect(() => {
    const refreshAskedQuestionIds = () => {
      setAskedQuestionIds(readAskedQuestionIds(conversationId));
    };

    refreshAskedQuestionIds();

    const handleAskedQuestionsChange = (event: Event) => {
      const changedConversationId = (
        event as CustomEvent<{ conversationId?: string | null }>
      ).detail?.conversationId;
      if (changedConversationId !== conversationId) return;
      refreshAskedQuestionIds();
    };

    window.addEventListener(
      ASKED_QUESTIONS_CHANGE_EVENT,
      handleAskedQuestionsChange
    );
    return () => {
      window.removeEventListener(
        ASKED_QUESTIONS_CHANGE_EVENT,
        handleAskedQuestionsChange
      );
    };
  }, [conversationId]);

  const allQuestions = useMemo(
    () => getSuggestedQuestions(language, surface),
    [language, surface]
  );

  const visibleQuestions = useMemo(() => {
    return allQuestions.slice(0, limit);
  }, [allQuestions, limit]);

  const markQuestionAsked = useCallback(
    (id: SuggestedQuestionId, targetConversationId = conversationId) => {
      const storedIds = readAskedQuestionIds(targetConversationId);
      const nextIds = [
        ...new Set([...storedIds, ...getRelatedSuggestedQuestionIds(id)]),
      ];

      if (nextIds.length === storedIds.length) {
        if (targetConversationId === conversationId) {
          setAskedQuestionIds(storedIds);
        }
        return;
      }

      writeAskedQuestionIds(nextIds, targetConversationId);
      if (targetConversationId === conversationId) {
        setAskedQuestionIds(nextIds);
      }
    },
    [conversationId]
  );

  const markQueryAsked = useCallback(
    (query: string, targetConversationId = conversationId) => {
      const id = findSuggestedQuestionId(query);
      if (id) markQuestionAsked(id, targetConversationId);
    },
    [conversationId, markQuestionAsked]
  );

  const resetAskedQuestions = useCallback(() => {
    writeAskedQuestionIds([], conversationId);
    setAskedQuestionIds([]);
  }, [conversationId]);

  return {
    allQuestions,
    visibleQuestions,
    askedQuestionIds,
    markQuestionAsked,
    markQueryAsked,
    resetAskedQuestions,
  };
}

function readAskedQuestionIds(
  conversationId?: string | null
): SuggestedQuestionId[] {
  if (typeof window === 'undefined') return [];
  if (!conversationId) return [];

  try {
    const rawValue = window.sessionStorage.getItem(
      getAskedQuestionsStorageKey(conversationId)
    );
    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    const storedIds = parsedValue.filter(
      (id): id is SuggestedQuestionId =>
        typeof id === 'string' &&
        suggestedQuestionIds.includes(id as SuggestedQuestionId)
    );
    return [
      ...new Set(storedIds.flatMap((id) => getRelatedSuggestedQuestionIds(id))),
    ];
  } catch {
    return [];
  }
}

function writeAskedQuestionIds(
  ids: SuggestedQuestionId[],
  conversationId?: string | null
) {
  if (typeof window === 'undefined') return;
  if (!conversationId) return;
  window.sessionStorage.setItem(
    getAskedQuestionsStorageKey(conversationId),
    JSON.stringify(ids)
  );
  window.queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent(ASKED_QUESTIONS_CHANGE_EVENT, {
        detail: { conversationId },
      })
    );
  });
}

function getAskedQuestionsStorageKey(conversationId: string) {
  return `${ASKED_QUESTIONS_STORAGE_KEY}:${conversationId}`;
}
