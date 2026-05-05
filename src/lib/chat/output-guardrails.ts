import type { ChatLanguage } from '@/lib/i18n/detect-language';

export const PROMPT_LEAK_DETECTED_ERROR_CODE = 'prompt_leak_detected';

const PROMPT_LEAKAGE_PATTERNS = [
  /Retrieved Wiki Context/i,
  /chunk_id\s*=/i,
  /entity_id\s*=/i,
  /section_path\s*=/i,
  /SYSTEM_PROMPT/i,
  /RAG_CHAT_SYSTEM_PROMPT/i,
];

export function detectPromptLeakage(answer: string) {
  return PROMPT_LEAKAGE_PATTERNS.some((pattern) => pattern.test(answer));
}

export function buildInsufficientEvidenceAnswer(language: ChatLanguage) {
  if (language === 'ko') {
    return [
      '이 질문에 바로 답할 만큼의 Wiki 근거를 찾지 못했어요.',
      '',
      '대신 AskOosu의 기술 구조, 대표 프로젝트, 연락 방법처럼 문서화된 주제로 질문해 주시면 더 정확히 답할 수 있어요.',
    ].join('\n');
  }

  return [
    'I could not find enough Wiki evidence to answer that confidently.',
    '',
    'Try asking about AskOosu architecture, representative projects, skills, or contact details.',
  ].join('\n');
}
