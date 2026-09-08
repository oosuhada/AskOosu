import type { ChatLanguage } from '@/lib/i18n/detect-language';

export const PROMPT_LEAK_DETECTED_ERROR_CODE = 'prompt_leak_detected';

const PROMPT_LEAKAGE_PATTERNS = [
  /Retrieved Wiki Context/i,
  /chunk_id\s*=/i,
  /entity_id\s*=/i,
  /section_path\s*=/i,
  /SYSTEM_PROMPT/i,
  /RAG_CHAT_SYSTEM_PROMPT/i,
  /\bget(?:Projects|Presentation|Resume|Contact|Skills|Internship|Crazy|Sports)\b/,
  /(?:이런 경우|이 경우)\s+policy에 따라/i,
  /(?:내부|internal)\s*(?:routing|router|policy|tool|metadata|prompt|context)/i,
  /현재\s+AskOosu(?:의)?[^\n]{0,80}(?:위키|Wiki|데이터베이스|지식\s*베이스)[^\n]{0,120}(?:등록되어 있지|저장되어 있지|포함되어 있지|확인되지 않)/i,
  /AskOosu(?:'s)?[^\n]{0,80}(?:Wiki|knowledge base|database)[^\n]{0,120}(?:not registered|not stored|does not contain|doesn't contain|is not available)/i,
];

export function detectPromptLeakage(answer: string) {
  return PROMPT_LEAKAGE_PATTERNS.some((pattern) => pattern.test(answer));
}

export function buildInsufficientEvidenceAnswer(language: ChatLanguage) {
  if (language === 'ko') {
    return [
      '이 질문은 현재 공개된 자료만으로 정확하게 답하기 어렵습니다.',
      '',
      '확인되지 않은 내용을 추측하지 않고, 공개적으로 확인 가능한 범위까지만 답변하겠습니다. 다른 프로젝트, 기술 스택, 경력, 연락 방법은 바로 이어서 설명할 수 있어요.',
    ].join('\n');
  }

  return [
    'There is not enough public information to answer that accurately.',
    '',
    'Rather than guess, I’ll stay within what can be verified publicly. I can still help with Oosu’s documented projects, skills, career, or contact details.',
  ].join('\n');
}
