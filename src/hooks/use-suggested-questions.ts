'use client';

import {
  findSuggestedQuestionId,
  getSuggestedQuestions,
  suggestedQuestionIds,
  type SuggestedQuestionId,
} from '@/lib/suggested-questions';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import { useCallback, useEffect, useMemo, useState } from 'react';

const ASKED_QUESTIONS_STORAGE_KEY = 'ask-oosu-asked-question-ids';

export function useSuggestedQuestions(limit = 5) {
  const { language } = useDisplayPreferences();
  const [askedQuestionIds, setAskedQuestionIds] = useState<
    SuggestedQuestionId[]
  >([]);

  useEffect(() => {
    setAskedQuestionIds(readAskedQuestionIds());
  }, []);

  const allQuestions = useMemo(
    () => getSuggestedQuestions(language),
    [language]
  );

  const visibleQuestions = useMemo(() => {
    const askedSet = new Set(askedQuestionIds);
    const unanswered = allQuestions.filter(
      (question) => !askedSet.has(question.id)
    );

    return (unanswered.length > 0 ? unanswered : allQuestions).slice(0, limit);
  }, [allQuestions, askedQuestionIds, limit]);

  const markQuestionAsked = useCallback((id: SuggestedQuestionId) => {
    setAskedQuestionIds((currentIds) => {
      if (currentIds.includes(id)) return currentIds;

      const nextIds = [...currentIds, id];
      writeAskedQuestionIds(nextIds);
      return nextIds;
    });
  }, []);

  const markQueryAsked = useCallback(
    (query: string) => {
      const id = findSuggestedQuestionId(query);
      if (id) markQuestionAsked(id);
    },
    [markQuestionAsked]
  );

  const resetAskedQuestions = useCallback(() => {
    writeAskedQuestionIds([]);
    setAskedQuestionIds([]);
  }, []);

  return {
    allQuestions,
    visibleQuestions,
    askedQuestionIds,
    markQuestionAsked,
    markQueryAsked,
    resetAskedQuestions,
  };
}

function readAskedQuestionIds(): SuggestedQuestionId[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawValue = window.sessionStorage.getItem(ASKED_QUESTIONS_STORAGE_KEY);
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

function writeAskedQuestionIds(ids: SuggestedQuestionId[]) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(
    ASKED_QUESTIONS_STORAGE_KEY,
    JSON.stringify(ids)
  );
}
