import type { UIMessage } from 'ai';
import type { ChatLanguage } from '@/lib/i18n/detect-language';

export type ConversationIntent =
  | 'greeting_smalltalk'
  | 'off_topic_redirect'
  | 'portfolio_ambiguous'
  | 'portfolio_factual'
  | 'portfolio_recommendation'
  | 'technical_deep_dive'
  | 'recruiter_evaluation'
  | 'contact_or_link_request'
  | 'follow_up_question'
  | 'private_or_unsafe'
  | 'prompt_attack'
  | 'hostile_feedback'
  | 'playful_probe';

export type ConversationModifier =
  | 'language_switch'
  | 'format_transform'
  | 'follow_up'
  | 'correction'
  | 'multi_intent'
  | 'alias_or_typo'
  | 'metric_request';

export type ConversationIntentResult = {
  intent: ConversationIntent;
  reason: string;
  modifiers: ConversationModifier[];
};

const PROMPT_ATTACK_PATTERNS = [
  /system\s*prompt/i,
  /developer\s*(message|prompt|instruction)/i,
  /hidden\s*(prompt|instruction|context)/i,
  /raw\s*(prompt|rag|context)/i,
  /retrieved\s+wiki\s+context/i,
  /rag\s*context/i,
  /chunk[_\s-]*id/i,
  /entity[_\s-]*id/i,
  /section[_\s-]*path/i,
  /debug\s*metadata/i,
  /internal\s*(routing|metadata|prompt|context)/i,
  /ignore\s+(previous|all|system|developer)/i,
  /시스템\s*프롬프트/,
  /숨겨진\s*(지시|프롬프트|컨텍스트)/,
  /내부\s*(프롬프트|설정|라우팅|메타데이터|컨텍스트)/,
  /raw\s*prompt/i,
  /프롬프트.*(보여|말해|출력|공개)/,
  /이전.*(명령|지시).*(무시|잊어)/,
  /rag\s*원문/i,
  /컨텍스트\s*원문/,
];

const PRIVATE_OR_UNSAFE_PATTERNS = [
  /api\s*key/i,
  /secret/i,
  /credential/i,
  /password/i,
  /token/i,
  /private\s*(repo|repository|url|link)/i,
  /비공개\s*(레포|저장소|링크|url)/i,
  /(키|토큰|비밀번호|패스워드|인증정보|시크릿).*(보여|알려|줘|공개)/,
  /(집|자택|우수살롱|oosu\s*salon).*(주소|위치).*(알려|보내|공개|줘)/i,
  /(주소|위치).*(알려|보내|공개|줘).*(우수살롱|oosu\s*salon|집|자택)/i,
  /(주민등록|여권|계좌|카드번호|전화번호)/,
  /(가족|가족관계|부모|아버지|어머니|형제|자매|배우자|결혼|자녀|아이).*(알려|말해|공개|누구|어떻게|되|있|궁금)/,
  /(우수|oosu|jang).*(family|parents?|mother|father|siblings?|spouse|married|children|kids)/i,
  /(family|parents?|mother|father|siblings?|spouse|married|children|kids).*(oosu|우수|jang)/i,
];

const GREETING_SMALLTALK_PATTERNS = [
  /^(hi|hello|hey|yo|sup|howdy)[!.?\s]*$/i,
  /^(how are you|how's it going|nice to meet you)[!.?\s]*$/i,
  /^(안녕|안녕하세요|ㅎㅇ|하이|헬로|반가워|반갑습니다)[!.?\s]*$/,
  /^(뭐해|뭐 하고 있어|잘 지내|잘지내)[?.!\s]*$/,
];

const HOSTILE_FEEDBACK_PATTERNS = [
  /(구린|별로|쓰레기|못하네|허접|이상한|마음에 안)/,
  /(bad|terrible|awful|sucks|lame)/i,
];

const PLAYFUL_PROBE_PATTERNS = [
  /우수.*잘생/,
  /몇\s*점/,
  /100점/,
  /게임하자/,
  /시\s*써/,
  /너\s*진짜\s*ai/i,
  /(are you real|write me a poem|play a game)/i,
];

const OFF_TOPIC_PATTERNS = [
  /(오늘|내일).*(날씨|기온|비\s*와|눈\s*와)/,
  /(농담|유머).*해/,
  /(심심|지루)/,
  /(점심|저녁|아침).*(뭐|추천|먹)/,
  /(연애|고민)\s*상담/,
  /(주식|비트코인|뉴스|맛집|여행).*(추천|알려|어때)/,
  /(weather|joke|bored|lunch|dinner|relationship advice|stock|bitcoin|news)/i,
];

const AMBIGUOUS_PORTFOLIO_INPUTS = new Set([
  '우수',
  '장우수',
  '경력',
  '커리어',
  '포트폴리오',
  '더',
  '그래서',
  '알려줘',
  '말해줘',
  '궁금해',
  'ㅇㅇ',
  'ㄱㄱ',
  'career',
  'portfolio',
  'more',
  'tell me',
  'show me',
]);

const CONTACT_OR_LINK_PATTERNS = [
  /(github|git\s*hub|linkedin|instagram|email|e-mail|contact|collaborat|link|url)/i,
  /(깃허브|깃헙|링크드인|인스타|이메일|메일|연락|협업|링크|url)/,
];

const UNAVAILABLE_LINK_PATTERNS = [
  /(resume|cv).*(url|link|download|send|show)/i,
  /(이력서|레주메).*(url|링크|다운로드|보내|줘|알려|바로)/,
];

const RECOMMENDATION_PATTERNS = [
  /(추천|대표|뭐부터|먼저|best|top|which project|where should i start)/i,
  /(리크루터|면접관).*(입장|관점)/,
];

const TECHNICAL_DEEP_DIVE_PATTERNS = [
  /(rag|groq|postgres|postgresql|pgvector|cache|fallback|docker|compose|next\.?js|ai sdk|semantic router|routeDecision)/i,
  /(아키텍처|구조|캐시|라우팅|검색|하이브리드|임베딩|벡터|배포|서버|기술적으로|자세히)/,
];

const RECRUITER_EVALUATION_PATTERNS = [
  /(뽑|채용|포지션|주니어|시니어|실무|투입|강점|약점|협업|평가)/,
  /(hire|recruiter|position|junior|senior|strength|weakness|collaboration|fit)/i,
];

const METRIC_REQUEST_PATTERNS = [
  /(몇\s*명|사용자\s*수|실제\s*유저|유저\s*몇|방문자|트래픽|매출|수익|다운로드|가입자|mau|dau)/i,
  /(how many users|actual users|traffic|revenue|downloads|signups|metrics)/i,
];

const FOLLOW_UP_PATTERNS = [
  /^(그|그거|거기|그럼|방금|아까|이어서|왜|어떻게|링크는|백엔드는|프론트는)/,
  /^(what about|then|why|how about|and the|that project)/i,
];

const PORTFOLIO_KEYWORD_PATTERNS = [
  /(askoosu|oosu|장우수|우수|portfolio|portfoli|project|aigram|instagram clone|sticks|stones|pylingo|javalingo|nomad|onjung)/i,
  /(포트폴리오|프로젝트|개발자|기술|스택|경력|커리어|작업|협업|연락|이력서|레주메|위키|노션)/,
  /(react|typescript|spring|flutter|dart|java|python|node|backend|frontend|fullstack|ai|notion|wiki)/i,
];

const LANGUAGE_SWITCH_PATTERNS = [
  /(영어로|한국어로|한글로|in english|in korean|translate)/i,
];

const FORMAT_PATTERNS = [
  /(짧게|3줄|세 줄|표로|bullet|bullets|table|요약|면접관|비전공자|블로그 스타일)/i,
];

const CORRECTION_PATTERNS = [
  /(틀렸|아닌 것|아니야|다시 확인|근거 보여|왜 그렇게)/,
  /(wrong|not true|check again|show evidence|why did you say)/i,
];

const ALIAS_OR_TYPO_PATTERNS = [
  /ask\s+oosu/i,
  /포트폴리오오/,
  /portfoli\s*oh/i,
  /stick\s*and\s*stone/i,
  /우수\s*포폴/,
];

export function classifyConversationIntent({
  question,
  messages,
}: {
  question: string;
  messages: UIMessage[];
}): ConversationIntentResult {
  const trimmedQuestion = question.trim();
  const normalizedQuestion = normalizeForClassification(trimmedQuestion);
  const modifiers = getConversationModifiers(trimmedQuestion);
  const hasPreviousAssistantMessage = messages
    .slice(0, -1)
    .some((message) => message.role === 'assistant');

  if (matchesAny(trimmedQuestion, PROMPT_ATTACK_PATTERNS)) {
    return { intent: 'prompt_attack', reason: 'prompt_or_internal_request', modifiers };
  }

  if (matchesAny(trimmedQuestion, PRIVATE_OR_UNSAFE_PATTERNS)) {
    return { intent: 'private_or_unsafe', reason: 'private_or_sensitive_request', modifiers };
  }

  if (matchesAny(trimmedQuestion, GREETING_SMALLTALK_PATTERNS)) {
    return { intent: 'greeting_smalltalk', reason: 'greeting_or_light_smalltalk', modifiers };
  }

  if (matchesAny(trimmedQuestion, HOSTILE_FEEDBACK_PATTERNS)) {
    return { intent: 'hostile_feedback', reason: 'hostile_or_sharp_feedback', modifiers };
  }

  if (matchesAny(trimmedQuestion, PLAYFUL_PROBE_PATTERNS)) {
    return { intent: 'playful_probe', reason: 'playful_probe', modifiers };
  }

  if (isBroadProjectRequest(normalizedQuestion)) {
    return {
      intent: 'portfolio_recommendation',
      reason: 'broad_project_request',
      modifiers,
    };
  }

  if (isBroadSkillRequest(normalizedQuestion)) {
    return {
      intent: 'technical_deep_dive',
      reason: 'broad_skill_request',
      modifiers,
    };
  }

  if (isBroadContactRequest(normalizedQuestion)) {
    return {
      intent: 'contact_or_link_request',
      reason: 'contact_or_public_link_request',
      modifiers,
    };
  }

  if (isPublicLifeRequest(trimmedQuestion)) {
    return {
      intent: 'portfolio_factual',
      reason: 'public_life_notes_request',
      modifiers,
    };
  }

  if (
    AMBIGUOUS_PORTFOLIO_INPUTS.has(normalizedQuestion) ||
    (normalizedQuestion.length <= 12 &&
      matchesAny(trimmedQuestion, PORTFOLIO_KEYWORD_PATTERNS) &&
      !containsQuestionShape(trimmedQuestion))
  ) {
    return { intent: 'portfolio_ambiguous', reason: 'short_or_ambiguous_portfolio_input', modifiers };
  }

  if (matchesAny(trimmedQuestion, OFF_TOPIC_PATTERNS)) {
    return { intent: 'off_topic_redirect', reason: 'off_topic_light', modifiers };
  }

  if (matchesAny(trimmedQuestion, FOLLOW_UP_PATTERNS)) {
    return {
      intent: 'follow_up_question',
      reason: hasPreviousAssistantMessage
        ? 'follow_up_with_conversation_context'
        : 'follow_up_without_context',
      modifiers: addModifier(modifiers, 'follow_up'),
    };
  }

  if (
    matchesAny(trimmedQuestion, METRIC_REQUEST_PATTERNS) &&
    matchesAny(trimmedQuestion, PORTFOLIO_KEYWORD_PATTERNS)
  ) {
    return {
      intent: 'portfolio_factual',
      reason: 'metric_or_usage_claim_request',
      modifiers: addModifier(modifiers, 'metric_request'),
    };
  }

  if (matchesAny(trimmedQuestion, UNAVAILABLE_LINK_PATTERNS)) {
    return {
      intent: 'contact_or_link_request',
      reason: 'unavailable_resume_link_request',
      modifiers,
    };
  }

  if (matchesAny(trimmedQuestion, CONTACT_OR_LINK_PATTERNS)) {
    return { intent: 'contact_or_link_request', reason: 'contact_or_public_link_request', modifiers };
  }

  if (matchesAny(trimmedQuestion, RECOMMENDATION_PATTERNS)) {
    return { intent: 'portfolio_recommendation', reason: 'portfolio_recommendation_or_comparison', modifiers };
  }

  if (matchesAny(trimmedQuestion, TECHNICAL_DEEP_DIVE_PATTERNS)) {
    return { intent: 'technical_deep_dive', reason: 'technical_deep_dive', modifiers };
  }

  if (matchesAny(trimmedQuestion, RECRUITER_EVALUATION_PATTERNS)) {
    return { intent: 'recruiter_evaluation', reason: 'recruiter_or_collaboration_evaluation', modifiers };
  }

  if (matchesAny(trimmedQuestion, PORTFOLIO_KEYWORD_PATTERNS)) {
    return { intent: 'portfolio_factual', reason: 'portfolio_keyword_match', modifiers };
  }

  return { intent: 'off_topic_redirect', reason: 'no_portfolio_intent_detected', modifiers };
}

export function shouldAnswerIntentDirectly(intent: ConversationIntent) {
  return (
    intent === 'greeting_smalltalk' ||
    intent === 'off_topic_redirect' ||
    intent === 'portfolio_ambiguous' ||
    intent === 'private_or_unsafe' ||
    intent === 'prompt_attack' ||
    intent === 'hostile_feedback' ||
    intent === 'playful_probe'
  );
}

export function shouldFallbackWhenNoEvidence({
  reason,
}: ConversationIntentResult) {
  return reason === 'unavailable_resume_link_request';
}

export function shouldBypassFaqDirectAnswer({
  reason,
}: ConversationIntentResult) {
  return reason === 'metric_or_usage_claim_request';
}

export function shouldBypassAnswerCache({
  reason,
  modifiers,
}: ConversationIntentResult) {
  return (
    reason === 'metric_or_usage_claim_request' ||
    reason === 'unavailable_resume_link_request' ||
    modifiers.includes('alias_or_typo')
  );
}

export function getConversationEntityHints(question: string) {
  const hints: string[] = [];

  if (/(askoosu|ask\s+oosu|우수.*포트폴리오)/i.test(question)) {
    hints.push('project.askoosu');
  }

  if (/(instagram\s*clone|aigram|인스타그램\s*클론|인스타\s*클론)/i.test(question)) {
    hints.push('project.instagram_clone');
  }

  if (/(포트폴리오오|portfoli[-\s]?oh|portfoli-oh)/i.test(question)) {
    hints.push('project.portfoli_oh');
  }

  if (/(sticks?\s*&?\s*stones?|스틱스|스톤즈|stks)/i.test(question)) {
    hints.push('project.sticks_and_stones');
  }

  return Array.from(new Set(hints));
}

export function buildConversationIntentAnswer({
  intent,
  language,
  question,
}: {
  intent: ConversationIntent;
  language: ChatLanguage;
  question: string;
}) {
  if (intent === 'off_topic_redirect') {
    return buildOffTopicRedirectAnswer({ question, language });
  }

  const copy = isDirectAnswerIntent(intent)
    ? CONVERSATION_DIRECT_ANSWERS[intent]
    : undefined;
  return copy?.[language] ?? CONVERSATION_DIRECT_ANSWERS.off_topic_redirect[language];
}

function isDirectAnswerIntent(
  intent: ConversationIntent
): intent is keyof typeof CONVERSATION_DIRECT_ANSWERS {
  return intent in CONVERSATION_DIRECT_ANSWERS;
}

function getConversationModifiers(question: string): ConversationModifier[] {
  const modifiers: ConversationModifier[] = [];

  if (matchesAny(question, LANGUAGE_SWITCH_PATTERNS)) modifiers.push('language_switch');
  if (matchesAny(question, FORMAT_PATTERNS)) modifiers.push('format_transform');
  if (matchesAny(question, CORRECTION_PATTERNS)) modifiers.push('correction');
  if (question.split(/[?？]/).filter(Boolean).length > 1) modifiers.push('multi_intent');
  if (matchesAny(question, ALIAS_OR_TYPO_PATTERNS)) modifiers.push('alias_or_typo');
  if (matchesAny(question, METRIC_REQUEST_PATTERNS)) modifiers.push('metric_request');

  return modifiers;
}

function addModifier(
  modifiers: ConversationModifier[],
  modifier: ConversationModifier
) {
  return modifiers.includes(modifier) ? modifiers : [...modifiers, modifier];
}

function matchesAny(question: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(question));
}

function normalizeForClassification(question: string) {
  return question
    .toLocaleLowerCase()
    .replace(/[?!.,~。！？\s]+/g, ' ')
    .trim();
}

function containsQuestionShape(question: string) {
  return /[?？]|(뭐|무엇|어떤|어디|어떻게|왜|설명|알려|보여|추천|차이|쓰였|썼|만들|해줘|주세요)/.test(
    question
  );
}

function isBroadProjectRequest(normalizedQuestion: string) {
  return [
    '프로젝트',
    '대표 프로젝트',
    '프로젝트 소개',
    'projects',
    'project',
    'top projects',
    'representative projects',
  ].includes(normalizedQuestion);
}

function isBroadSkillRequest(normalizedQuestion: string) {
  return [
    '기술',
    '기술 스택',
    '스택',
    'skills',
    'skill',
    'tech stack',
  ].includes(normalizedQuestion);
}

function isBroadContactRequest(normalizedQuestion: string) {
  return ['연락', '연락처', 'contact', 'contacts'].includes(
    normalizedQuestion
  );
}

function isPublicLifeRequest(question: string) {
  return /(fun|취미|취향|작업\s*성향|일하는\s*스타일|라이프|개인적인|사람다운|oosu\s*salon|우수살롱)/i.test(
    question
  );
}

function buildOffTopicRedirectAnswer({
  question,
  language,
}: {
  question: string;
  language: ChatLanguage;
}) {
  if (isLightTranslationRequest(question)) {
    return language === 'ko'
      ? '좋은 샛길이에요. "우주"는 universe, 문맥에 따라 space라고 보면 됩니다. 이제 AskOosu 안쪽 우주도 둘러볼까요? 프로젝트부터 보면 꽤 재밌습니다.'
      : 'Nice little detour. "우주" is universe, or space depending on the context. Want to tour the little universe inside AskOosu now? The projects are a fun place to start.';
  }

  if (/(우주|space|universe|cosmos|별|행성|은하|너머)/i.test(question)) {
    return language === 'ko'
      ? '좋은 샛길이에요. 우주 끝까지는 같이 못 가도 AskOosu 안쪽 우주는 꽤 잘 안내할 수 있어요. 프로젝트부터 보면 꽤 재밌습니다.'
      : "Nice detour. I cannot guide us to the edge of space, but I can tour the little universe inside AskOosu. The projects are a fun place to start.";
  }

  if (/(날씨|기온|비\s*와|눈\s*와|weather|temperature|rain|snow)/i.test(question)) {
    return language === 'ko'
      ? '실시간 날씨는 제가 확인해드리기 어려워요. 대신 우수의 프로젝트 흐름은 꽤 맑게 정리해드릴 수 있습니다. 대표 프로젝트부터 볼까요?'
      : "I cannot check live weather here. I can give you a much clearer forecast of Oosu's project flow, though. Want the representative projects first?";
  }

  if (/(농담|유머|심심|지루|joke|bored)/i.test(question)) {
    return language === 'ko'
      ? '가볍게 웃고 가는 건 좋아요. 다만 여기서는 잡담을 길게 끌기보다 우수의 프로젝트, 기술 스택, 커리어 방향으로 다시 돌아가볼게요.'
      : "A little levity is welcome. I will keep it short here and steer us back to Oosu's projects, tech stack, or career direction.";
  }

  if (/(점심|저녁|아침|먹|lunch|dinner|breakfast|eat)/i.test(question)) {
    return language === 'ko'
      ? '메뉴 추천은 잠깐만 맡길게요. 이 공간에서는 우수의 대표 프로젝트나 기술 스택을 고르는 쪽이 제 전문이에요.'
      : "I will leave menu picks to someone hungrier. In this space, I am better at helping you choose which Oosu project or tech stack to inspect first.";
  }

  const variants =
    language === 'ko'
      ? [
          '그쪽 이야기도 살짝은 받을 수 있지만, AskOosu에서는 우수의 프로젝트와 기술 경험을 소개하는 데 집중할게요. 어떤 프로젝트부터 볼까요?',
          '좋은 샛길이긴 한데, 오래 벗어나진 않을게요. 여기서는 우수의 커리어 방향, 기술 스택, 대표 프로젝트를 가장 잘 안내할 수 있어요.',
          '가볍게 받아치면 좋죠. 다만 이 포트폴리오에서는 우수의 작업 방식이나 프로젝트 맥락으로 다시 돌아오는 게 제 역할이에요.',
        ]
      : [
          "I can play along briefly, but AskOosu is here to keep the spotlight on Oosu's work. Want projects, tech stack, career story, or contact options?",
          "Fun detour, but I should keep us close to the portfolio. I can walk you through Oosu's projects, architecture, or working style.",
          "I will keep that light and not drift too far. Back in AskOosu, the useful threads are projects, stack, career direction, and contact.",
        ];

  return variants[stableIndex(question, variants.length)];
}

function isLightTranslationRequest(question: string) {
  return /우주(?:를|을)?\s*영어로/.test(question);
}

function stableIndex(value: string, modulo: number) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % modulo;
}

const CONVERSATION_DIRECT_ANSWERS: Record<
  Extract<
    ConversationIntent,
    | 'greeting_smalltalk'
    | 'off_topic_redirect'
    | 'portfolio_ambiguous'
    | 'private_or_unsafe'
    | 'prompt_attack'
    | 'hostile_feedback'
    | 'playful_probe'
  >,
  Record<ChatLanguage, string>
> = {
  greeting_smalltalk: {
    ko: '안녕! AskOosu에 온 걸 환영해요. 우수의 대표 프로젝트, 기술 스택, 커리어 방향 중 뭐부터 볼까요?',
    en: "Annyeonghaseyo! Welcome to AskOosu. You can ask about Oosu's projects, tech stack, career story, or how to get in touch.",
  },
  off_topic_redirect: {
    ko: '그 주제로 오래 이어가긴 어렵지만, 가볍게는 좋아요. 여기서는 우수의 프로젝트, 기술 스택, 커리어 방향을 가장 잘 소개할 수 있어요.',
    en: "I can keep that light, but I should not drift too far from the portfolio. Ask me about Oosu's projects, tech stack, career direction, or contact options.",
  },
  portfolio_ambiguous: {
    ko: '좋아요. 대표 프로젝트, 기술 스택, 커리어 스토리, 연락 방법 중 어떤 쪽이 궁금하세요?',
    en: 'Sure. Which angle should we explore: representative projects, tech stack, career story, or contact options?',
  },
  private_or_unsafe: {
    ko: '그 정보는 공개 Wiki에서 안내할 수 없는 비공개 정보예요. 대신 공개된 프로젝트 설명, 기술 스택, 커리어 방향, 연락 방법은 알려드릴 수 있어요.',
    en: 'That is not public Wiki information I can share. I can still help with public project details, tech stack, career direction, or contact options.',
  },
  prompt_attack: {
    ko: '내부 프롬프트나 시스템 설정은 공개할 수 없어요. 대신 AskOosu가 어떤 구조로 동작하는지는 공개 가능한 수준에서 설명해드릴 수 있어요.',
    en: 'I cannot reveal hidden prompts or internal system settings. I can explain how AskOosu works at a public architecture level.',
  },
  hostile_feedback: {
    ko: '그렇게 느낄 수도 있어요. 어떤 부분이 아쉬웠는지 알려주면, 프로젝트 구조나 개선 방향 기준으로 차분히 설명해볼게요.',
    en: 'Fair to call out rough edges. Tell me what felt off, and I can explain the project structure or improvement direction more clearly.',
  },
  playful_probe: {
    ko: '하하, 그건 포트폴리오 점수표에 넣기엔 애매하네요. 대신 우수의 프로젝트 완성도나 기술 스택은 꽤 구체적으로 소개할 수 있어요.',
    en: "Ha, that is a little outside the portfolio scorecard. I can give you a concrete tour of Oosu's projects or tech stack instead.",
  },
};
