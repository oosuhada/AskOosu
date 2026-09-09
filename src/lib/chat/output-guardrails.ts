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
  /(?:위키|Wiki)\s*(?:자료|근거|문서|데이터)?[^\n]{0,140}(?:포함되어 있지|등록되어 있지|저장되어 있지|확인되지 않|근거가 부족|자료가 부족)/i,
  /(?:포트폴리오|프로젝트)[^\n]{0,80}(?:문서|자료)[^\n]{0,140}(?:포함되어 있지|등록되어 있지|저장되어 있지|확인되지 않)/i,
  /README\s*(?:근거|자료|문서)?[^\n]{0,120}(?:포함되어 있지|등록되어 있지|저장되어 있지|확인되지 않|없습니다|없어요)/i,
  /\bWiki\s+(?:evidence|materials?|documents?|data)\b[^\n]{0,140}(?:not enough|not available|missing|does not contain|do not contain|isn't available|is not available)/i,
  /\bno\s+public\s+(?:project\s+or\s+)?README\s+evidence\b/i,
  /\b(?:no|not enough|insufficient|missing)\b[^\n]{0,120}\bREADME\s+evidence\b/i,
  /\bavailable\s+portfolio\s+records\b/i,
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
