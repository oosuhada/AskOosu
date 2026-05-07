import type { ChatLanguage } from '@/lib/i18n/detect-language';

const MAX_VISIBLE_STEPS = 3;

type TopicRule = {
  ko: string;
  en: string;
  pattern: RegExp;
};

const TOPIC_RULES: TopicRule[] = [
  {
    ko: 'IDE/작업환경 이슈 분리',
    en: 'Separate IDE/workspace issues',
    pattern:
      /(vscode|intellij|IDE|창|절전|비활성화|battery|배터리|sleep|window)/i,
  },
  {
    ko: '서버/Docker 관리 방법 확인',
    en: 'Check server/Docker management',
    pattern:
      /(localserver|localhost|docker|서버|도커|GUI|껐다|켰다|compose|container)/i,
  },
  {
    ko: '메모리 사용량 해석',
    en: 'Interpret memory usage',
    pattern: /(메모리|램|RAM|GB|프로세스|memory|pressure|swap)/i,
  },
  {
    ko: '프로젝트 근거 확인',
    en: 'Check project evidence',
    pattern:
      /(프로젝트|대표|포트폴리오|askoosu|aigram|instagram|project|portfolio)/i,
  },
  {
    ko: 'AI 활용 방식 분리',
    en: 'Separate AI workflow points',
    pattern:
      /(ai|AI|Claude|Codex|Gemini|에이전트|agent|workflow|워크플로|활용|사용)/i,
  },
  {
    ko: '협업/팀 적합성 확인',
    en: 'Check collaboration fit',
    pattern: /(협업|팀워크|팀|collaboration|teamwork|team fit|work in a team)/i,
  },
  {
    ko: '역할 포지셔닝 정리',
    en: 'Frame role positioning',
    pattern:
      /(PM|PO|Product Owner|개발자|프론트엔드|풀스택|developer|role|position)/i,
  },
  {
    ko: '연락/제안 방식 확인',
    en: 'Check contact path',
    pattern:
      /(연락|이메일|메일|깃허브|링크드인|contact|email|github|linkedin)/i,
  },
  {
    ko: '리스크 표현 완화',
    en: 'Calibrate risk wording',
    pattern:
      /(리스크|걱정|우려|의존|혼자|부족|risk|concern|dependent|solo|weak)/i,
  },
];

export function buildVisibleAnswerPlan(
  question: string | null | undefined,
  language: ChatLanguage
) {
  const normalizedQuestion = normalizeQuestion(question ?? '');
  if (!normalizedQuestion) return getDefaultVisiblePlan(language);

  const matchedTopics = uniqueValues(
    TOPIC_RULES.filter((rule) => rule.pattern.test(question ?? '')).map(
      (rule) => rule[language]
    )
  );

  if (matchedTopics.length > 0) {
    if (
      matchedTopics.length >= 2 ||
      shouldSplitLongQuestion(normalizedQuestion)
    ) {
      return matchedTopics.slice(0, MAX_VISIBLE_STEPS);
    }

    return [
      getQuestionSplitLabel(language, normalizedQuestion),
      ...matchedTopics,
    ].slice(0, MAX_VISIBLE_STEPS);
  }

  if (shouldSplitLongQuestion(normalizedQuestion)) {
    return getLongQuestionPlan(language);
  }

  return getDefaultVisiblePlan(language);
}

function shouldSplitLongQuestion(question: string) {
  return (
    question.length >= 80 ||
    question.split(/[?？]/).filter(Boolean).length > 1 ||
    /(그리고|또|마지막으로|추가로|한가지는|두번째|first|second|also|lastly)/i.test(
      question
    )
  );
}

function getQuestionSplitLabel(language: ChatLanguage, question: string) {
  if (shouldSplitLongQuestion(question)) {
    return language === 'ko'
      ? '긴 질문을 2~3개 포인트로 나누는 중'
      : 'Splitting the longer question into 2-3 points';
  }

  return language === 'ko'
    ? '질문 의도를 확인하는 중'
    : 'Checking the question intent';
}

function getDefaultVisiblePlan(language: ChatLanguage) {
  return language === 'ko'
    ? ['질문 의도 확인', 'Wiki/FAQ 근거 확인', '답변 구조 정리']
    : ['Check intent', 'Review Wiki/FAQ evidence', 'Shape the answer'];
}

function getLongQuestionPlan(language: ChatLanguage) {
  return language === 'ko'
    ? [
        '긴 질문을 2~3개 포인트로 나누는 중',
        '각 포인트별 근거 확인',
        '겹치는 답변은 줄이고 구조화',
      ]
    : [
        'Splitting the longer question into 2-3 points',
        'Checking evidence for each point',
        'Removing repeated answer blocks',
      ];
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeQuestion(input: string) {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[“”‘’]/g, "'")
    .toLowerCase();
}
