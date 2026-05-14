# Codex 작업 지시서: AskOosu RAG Wiki 업데이트 + Quote UI 연동

---

## 📋 작업 개요

이 지시서는 두 가지 작업을 포함합니다.

1. **RAG Wiki 업데이트**: 새 add-on 문서 2개를 Notion에 등록하고 RAG 파이프라인에 연동한다
2. **Quote UI 추가**: 우수의 표현이 담긴 답변에 인용 블록 UI를 추가하고, 짧은/오프토픽 답변 하단에 contextual quote를 표시한다

---

## 파일 위치

```
docs/
  askoosu-wiki-addon-v13-ko.md     ← 새로 추가할 KO 문서
  askoosu-wiki-addon-v13-en.md     ← 새로 추가할 EN 문서
```

---

---

# TASK 1: RAG Wiki 업데이트

## 1-1. Notion에 새 페이지 추가

아래 두 문서를 Notion Wiki에 **새 페이지**로 각각 생성한다.
기존 v11/v12 페이지를 수정하거나 덮어쓰지 않는다.

```
Notion 페이지 제목: [v13 Add-on] AI Era Competitiveness (KO)
Notion 페이지 제목: [v13 Add-on] AI Era Competitiveness (EN)
```

각 페이지의 Properties에 다음을 설정한다:

| Property | Value |
|---|---|
| docId | (frontmatter의 docId 그대로) |
| sourceType | faq_addon |
| language | ko / en |
| status | draft_for_review |
| intentGroup | ai_era_competitiveness |

## 1-2. RAG 청킹 기준

- heading `##` 기준으로 청크를 분리한다
- 각 청크에 아래 metadata를 포함한다:

```json
{
  "docId": "faq.ai_competitiveness_addon.v13.{ko|en}",
  "sourceType": "faq_addon",
  "sectionId": "{heading text를 snake_case로 변환}",
  "language": "ko | en",
  "intentGroup": "ai_era_competitiveness",
  "priority": "high",
  "confidence": "medium_high"
}
```

## 1-3. FAQ cache 등록 (직접 캐시 방식)

`data/faq-answers.{ko|en}.ts` (또는 프로젝트의 FAQ cache 파일)에 아래 항목들을 추가한다.

**추가할 FAQ ID 목록:**

```
faq.ai_era.replace_developer.default
faq.ai_era.skill_atrophy.default
faq.ai_era.competitiveness_source.default
faq.ai_competitiveness.ai_fluency_vs_dependency.default
```

각 항목의 `patterns` 배열에 문서에 명시된 trigger 패턴들을 그대로 등록한다.

**중요**: 기존 FAQ cache의 키와 충돌하는지 먼저 확인하고, 충돌이 있으면 기존 항목을 덮어쓰지 말고 merge 후 보고한다.

## 1-4. Intent routing 업데이트

기존 intent router (`lib/intent-classifier.ts` 또는 유사 파일)에
`ai_era_competitiveness` intent group을 추가한다.

이 intent group에 속하는 query가 들어오면:
1. FAQ cache에서 먼저 lookup
2. cache miss면 RAG retrieval로 fallback
3. RAG 결과에서 `sourceType: faq_addon` 청크를 우선 순위로 노출

---

---

# TASK 2: Quote UI 추가

## 2-1. 개요

우수의 직접적인 표현이 담긴 텍스트를 답변 안에서 `<QuoteBlock>` 형태로 시각적으로 강조한다.

적용 대상:
- FAQ cache 답변에서 `>` blockquote 형태로 표기된 문장들
- 면접 답변 초안의 대표 답변 (짧은/디폴트/상세 버전)
- 오프토픽/짧은 인사 응답 하단의 contextual quote

## 2-2. QuoteBlock 컴포넌트 요구사항

**파일 위치**: `components/ui/QuoteBlock.tsx` (또는 프로젝트 컴포넌트 디렉토리)

**시각 디자인 요구사항:**
- 좌측에 accent 컬러 세로 바 (border-left, 2-3px)
- 배경: 메인 배경보다 살짝 어둡거나 밝은 subtle 톤 (예: `bg-muted/50` 또는 `rgba(...)`)
- 인용 부호 `"` 또는 typographic quote 장식
- 텍스트는 italic 또는 다른 font-weight로 구분
- 작은 attribution 영역 (선택): `— Oosu` 또는 생략 가능

**예시 스펙 (Tailwind 기반):**

```tsx
// components/ui/QuoteBlock.tsx

interface QuoteBlockProps {
  children: React.ReactNode;
  attribution?: string;       // "— Oosu" 같은 출처 (선택)
  variant?: "default" | "subtle" | "highlight";
}

export function QuoteBlock({ children, attribution, variant = "default" }: QuoteBlockProps) {
  return (
    <div className={`
      relative pl-4 py-3 my-3
      border-l-2 border-primary/60
      bg-muted/40 rounded-r-md
      text-sm italic text-foreground/80
      ${variant === "highlight" ? "border-l-4 border-primary bg-muted/60" : ""}
    `}>
      <span className="absolute -left-1 top-2 text-primary/40 text-2xl leading-none select-none">"</span>
      <div className="pl-2">{children}</div>
      {attribution && (
        <div className="mt-1 pl-2 text-xs text-muted-foreground not-italic">
          {attribution}
        </div>
      )}
    </div>
  );
}
```

## 2-3. FAQ 답변 렌더링에 QuoteBlock 연동

FAQ cache 또는 RAG 응답을 렌더링하는 컴포넌트 (예: `components/ChatMessage.tsx` 또는 `components/AnswerRenderer.tsx`)에서:

1. 마크다운의 `>` blockquote를 `<QuoteBlock>`으로 렌더링한다
2. 기존 마크다운 파서(예: `react-markdown`)를 쓰고 있다면 `components` prop으로 override한다:

```tsx
import { QuoteBlock } from "@/components/ui/QuoteBlock";

// react-markdown 사용 시
<ReactMarkdown
  components={{
    blockquote: ({ children }) => (
      <QuoteBlock>{children}</QuoteBlock>
    ),
  }}
>
  {answerText}
</ReactMarkdown>
```

## 2-4. 짧은 응답 / 오프토픽 응답 하단 Quote

짧은 인사 응답이나 포트폴리오와 무관한 질문에 대한 응답 (예: "안녕", "우주", "좋아요" 같은 응답)에는
응답 텍스트 하단에 `<ContextualQuote>`를 추가한다.

**이 컴포넌트의 역할:**
- 오프토픽 응답처럼 텍스트가 짧을 때, 우수의 생각/철학이 담긴 한 문장을 quote 형태로 표시한다
- 매번 같은 quote가 나오지 않도록 여러 quote 중 랜덤 또는 질문 카테고리 기반으로 선택한다

**Quote 풀 (기본값, 확장 가능):**

```ts
// data/contextual-quotes.ts

export const contextualQuotes = [
  {
    text: "AI가 실행을 빠르게 만들수록, 무엇을 만들지 판단하는 눈이 더 중요해집니다.",
    category: "ai_era",
  },
  {
    text: "좋은 UX는 예쁜 게 아니라 막히지 않는 겁니다.",
    category: "ux",
  },
  {
    text: "읽기만 한 기술과 직접 배포까지 해본 기술은 다릅니다.",
    category: "learning",
  },
  {
    text: "AI를 잘 검토할 수 있어야 잘 쓸 수 있습니다.",
    category: "ai_era",
  },
  {
    text: "기능이 아니라 질문이 출발점입니다.",
    category: "product",
  },
  {
    text: "AI는 옵션을 제안하지만, 그 선택의 무게를 지는 건 사람입니다.",
    category: "ai_era",
  },
  {
    text: "AI 코드는 초안이고, 제품에 들어가는 판단은 사람이 책임집니다.",
    category: "ai_era",
  },
  {
    text: "경쟁자는 AI 자체가 아니라, AI를 잘 활용하는 사람들입니다.",
    category: "positioning",
  },
];
```

**ContextualQuote 컴포넌트 스펙:**

```tsx
// components/ui/ContextualQuote.tsx

import { contextualQuotes } from "@/data/contextual-quotes";

interface ContextualQuoteProps {
  category?: string;   // 카테고리 기반 필터링 (선택)
}

export function ContextualQuote({ category }: ContextualQuoteProps) {
  const pool = category
    ? contextualQuotes.filter((q) => q.category === category)
    : contextualQuotes;

  const quote = pool[Math.floor(Math.random() * pool.length)];

  return (
    <QuoteBlock variant="subtle" attribution="— Oosu">
      {quote.text}
    </QuoteBlock>
  );
}
```

## 2-5. 짧은/오프토픽 응답에 ContextualQuote 주입 위치

짧은 응답을 반환하는 부분 (예: intent = `greeting`, `off_topic`, `disambiguation`)에서
응답 컴포넌트 하단에 `<ContextualQuote>`를 추가한다.

예시 (응답 흐름이 컴포넌트 기반인 경우):

```tsx
// 응답 렌더러에서
if (intent === "greeting" || intent === "off_topic") {
  return (
    <div>
      <ChatBubble>{responseText}</ChatBubble>
      <ContextualQuote category="ai_era" />
    </div>
  );
}
```

예시 (응답이 마크다운 string으로 내려오는 경우):

짧은 응답 string 뒤에 아래 마크다운을 append한다:

```
---
> {랜덤으로 선택한 quote text}
```

그러면 마크다운 렌더러가 `<QuoteBlock>`으로 처리한다.

---

---

# 검토 및 보고 요청

작업 완료 후 다음 항목을 보고한다:

1. Notion에 추가된 페이지 URL 2개
2. FAQ cache에 추가된 항목 수 (충돌 여부 포함)
3. `QuoteBlock.tsx`, `ContextualQuote.tsx` 파일 생성 위치
4. 기존 markdown renderer override 적용 여부
5. 짧은/오프토픽 응답에 ContextualQuote 주입이 적용된 intent 목록
6. 작업 중 애매했던 부분이나 결정이 필요한 항목 (의존성, 파일 경로, 기존 코드 충돌 등)

---

# 금지사항

- 기존 v11/v12 Wiki 페이지를 수정하거나 삭제하지 않는다
- 기존 FAQ cache 항목을 덮어쓰지 않는다 (충돌 시 보고 후 대기)
- QuoteBlock을 FAQ 답변 전체에 무조건 적용하지 않는다 — `>` blockquote로 명시된 부분에만 적용한다
- ContextualQuote를 긴 답변이나 상세 설명이 필요한 응답에는 추가하지 않는다 (짧은 응답 / 오프토픽 전용)
- 새 npm 패키지를 추가할 경우 반드시 먼저 보고한다

---

# 참고: 현재 오프토픽 응답 예시 (quote 주입 대상)

아래는 현재 AskOosu에서 짧은 응답이 나오는 케이스들이다.
이 응답들 하단에 ContextualQuote를 추가하는 것이 목표다.

```
[인사] "안녕" →
  "안녕! AskOosu에 온 걸 환영해요. 우수의 대표 프로젝트, 기술 스택, 커리어 방향 중 뭐부터 볼까요?"
  + <ContextualQuote>

[이름] "우수" →
  "좋아요. 대표 프로젝트, 기술 스택, 커리어 스토리, 연락 방법 중 어떤 쪽이 궁금하세요?"
  + <ContextualQuote>

[오프토픽] "우주" →
  "좋은 샛길이에요. 우주 끝까지는 같이 못 가도 AskOosu 안쪽 우주는 꽤 잘 안내할 수 있어요. 프로젝트부터 보면 꽤 재밌습니다."
  + <ContextualQuote category="product">
```
