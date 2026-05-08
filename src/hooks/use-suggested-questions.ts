'use client';

import {
  findSuggestedQuestionId,
  getSuggestedQuestions,
  suggestedQuestionIds,
  type SuggestedQuestionId,
} from '@/lib/suggested-questions';
import type { QuestionSurface } from '@/data/question-surfaces.shared';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import { useCallback, useEffect, useMemo, useState } from 'react';

const ASKED_QUESTIONS_STORAGE_KEY = 'ask-oosu-asked-question-ids';

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
    setAskedQuestionIds(readAskedQuestionIds(conversationId));
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
      setAskedQuestionIds((currentIds) => {
        const storedIds =
          targetConversationId === conversationId
            ? currentIds
            : readAskedQuestionIds(targetConversationId);
        if (storedIds.includes(id)) return currentIds;

        const nextIds = [...storedIds, id];
        writeAskedQuestionIds(nextIds, targetConversationId);
        return targetConversationId === conversationId ? nextIds : currentIds;
      });
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

    return parsedValue.filter(
      (id): id is SuggestedQuestionId =>
        typeof id === 'string' &&
        suggestedQuestionIds.includes(id as SuggestedQuestionId)
    );
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
}

function getAskedQuestionsStorageKey(conversationId: string) {
  return `${ASKED_QUESTIONS_STORAGE_KEY}:${conversationId}`;
}
