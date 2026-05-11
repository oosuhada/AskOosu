# AskOosu Notion Wiki — v12 KO ADD
## Recruiter Risk / Interview Objection Answer Bank

> 목적: AskOosu가 채용자·면접관·협업자가 던질 수 있는 날카로운 질문을 일반 잡담 fallback으로 돌리지 않고, 신뢰감 있는 포트폴리오 답변으로 처리하기 위한 추가 문서입니다.
> 권장 적용: 기존 `v11 KO` 본문을 전면 교체하지 말고, `notion-wiki-draft-v12-ko-add.md` 또는 별도 Notion 페이지로 추가한 뒤 FAQ cache / RAG source에 병합합니다.
> 핵심 방향: 질문자의 우려를 인정하고, 무리한 방어 대신 조건과 판단 기준을 제시하며, Wiki에 있는 프로젝트·경력·학습 근거로만 답합니다.

---

## 0. 왜 이 파일은 v12 전체 병합보다 add 파일이 좋은가?

v11은 이미 Notion Wiki, FAQ cache, RAG, rich answer rendering, Answer Engine Guide 구조를 갖고 있습니다. 따라서 전체 문서를 v12로 다시 묶기보다, 이 파일처럼 **고위험 채용 질문 전용 answer bank**를 추가하는 편이 안전합니다.

### 권장 구조

```text
docs/wiki/
  notion-wiki-draft-v11-ko.md
  notion-wiki-draft-v11-en.md
  notion-wiki-draft-v12-ko-add-recruiter-risk.md
  notion-wiki-draft-v12-en-add-recruiter-risk.md  # optional
```

### 권장 라우팅

```text
1. user question
2. language detection
3. safety / privacy filter
4. recruiter-risk intent matcher
5. FAQ/model answer cache
6. RAG search
7. Groq rewrite or synthesis
8. final answer with source/confidence badge
```

이 파일에 있는 질문은 일반 casual fallback보다 우선순위가 높아야 합니다. 예를 들어 “오래 못 다닐 것 같은데?”, “AI 쓰면 실력 없는 것 아닌가?”, “비전공인데 깊이가 있나?” 같은 질문은 잡담이 아니라 채용 판단 질문입니다.

---

## 1. Recruiter Risk Intent Definition

| Field | Content |
| --- | --- |
| Intent Group | `recruiter_risk` |
| Audience | recruiter, hiring manager, engineer interviewer, founder, collaborator |
| Cache Priority | high |
| Recommended Cache Mode | `direct_cache` for short/default answers, `faq_rewrite` for nuanced follow-ups |
| RAG Role | Use RAG to add project evidence, not to invent new personal claims |
| Answer Tone | calm, honest, recruiter-safe, not defensive |
| Default Perspective | third person Korean: “우수는…” / subject omission |
| Default Length | 3-5 short paragraphs for risk questions |
| Avoid | “절대 안 그만둡니다”, “창업 생각 없습니다”, “그건 오해입니다” 같은 과도한 단정 |
| Prefer | “그렇게 볼 수 있는 지점도 있습니다”, “다만 핵심은…”, “이런 환경에서 더 오래 기여할 가능성이 큽니다” |

---

## 2. Answer Strategy for Risk Questions

### 2-1. Ideal Answer Shape

1. **우려 인정**
   “좋은 우려예요. 그렇게 볼 수 있는 지점도 있습니다.”

2. **리스크를 숨기지 않고 정확히 정의**
   “우수는 단순 반복 업무에 오래 머무르는 타입이라기보다, 배운 것을 실제 제품이나 시스템으로 빠르게 연결하고 싶어 하는 사람에 가깝습니다.”

3. **조건부로 설명**
   “역할이 너무 좁거나 성장·책임 범위가 막혀 있으면 답답함을 느낄 수 있습니다.”

4. **근거 제시**
   “다만 프로젝트에서 보이는 강점은 UI, API, 데이터, AI, 배포를 끝까지 연결하려는 실행력입니다.”

5. **판단 기준 전환**
   “오래 묶어둘 수 있는 사람인가보다, 어떤 문제를 맡기면 책임 있게 끝까지 가져가는 사람인가를 보는 편이 더 정확합니다.”

### 2-2. Bad Fallback Examples

| Bad Answer | Why bad |
| --- | --- |
| “좋은 샛길이긴 한데, 오래 벗어나진 않을게요.” | 채용 리스크 질문을 잡담처럼 처리해 회피적으로 보임 |
| “우수는 절대 금방 그만두지 않습니다.” | 검증 불가능하고 과장된 보증처럼 들림 |
| “창업 생각은 없습니다.” | 사용자가 제기한 창업 성향을 억지로 부정해 부자연스러움 |
| “포트폴리오 주제로 돌아갈게요.” | 채용자가 진짜 궁금해할 수 있는 질문을 차단함 |
| “우수는 모든 분야를 잘합니다.” | 기술 깊이 우려를 오히려 키움 |

---

## 3. High-Risk FAQ / Model Answer Bank

아래 항목들은 추천 질문 버튼으로 모두 노출할 필요는 없습니다. 다만 사용자가 직접 물었을 때는 높은 우선순위로 매칭되어야 합니다.

---

### FAQ R1. 오래 근무할 사람인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.retention.default` |
| Intent ID | `recruiter_risk.retention` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `오래 근무할 사람인가요?`, `금방 그만둘 것 같은데`, `오래 못 다닐 것 같은데`, `배울 것만 배우고 나갈 것 같은데`, `Will Oosu stay long?`, `Is Oosu a retention risk?` |
| Source Chunk IDs | `profile.work_style`, `profile.growth_areas`, `career.target_role`, `project.askoosu.fact`, `project.instagram_clone.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

그렇게 볼 수 있는 지점도 있지만, 핵심은 “오래 묶어둘 수 있는 사람인가”보다 “어떤 문제를 맡기면 책임 있게 끝까지 가져가는 사람인가”에 가깝습니다. 우수는 역할이 너무 좁으면 답답함을 느낄 수 있지만, 제품·사용자·기술이 연결되는 책임 있는 문제를 맡을 때 더 오래 몰입하고 기여할 가능성이 큽니다.

**Default Answer**

좋은 우려예요. 그렇게 볼 수 있는 지점도 있다고 생각해요.

우수는 단순 반복 업무에 오래 머무르는 타입이라기보다는, 배운 것을 실제 제품이나 시스템으로 빠르게 연결하고 싶어 하는 사람에 가깝습니다. 그래서 역할이 너무 좁거나 성장과 책임 범위가 막혀 있으면 답답함을 느낄 가능성은 있습니다.

다만 그게 곧 “배울 것만 얻고 떠난다”는 뜻은 아닙니다. 포트폴리오에서 보이는 강점은 UI, API, 데이터, AI, 배포를 끝까지 연결해서 실제로 돌아가는 결과물을 만들고 개선하는 쪽입니다. 회사 안에서도 그런 책임과 문제를 맡을 수 있다면 오래 기여할 가능성이 더 높습니다.

면접에서는 “오래 붙잡아둘 수 있는 사람인가”보다 “어떤 문제를 맡기면 책임 있게 끝까지 가져가는 사람인가”, “회사의 제품 방향과 개인의 성장 욕구가 맞는가”를 확인하는 게 더 정확할 것 같습니다.

---

### FAQ R2. 창업 생각이 있으면 회사에 집중하지 못하는 것 아닌가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.founder_mindset.default` |
| Intent ID | `recruiter_risk.founder_mindset` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `창업 생각이 있으면 회사에 집중 못 하는 것 아닌가요?`, `창업 쪽으로 빠질 것 같은데`, `founder mindset risk`, `will Oosu leave to start a company`, `entrepreneurial risk` |
| Source Chunk IDs | `career.oosu_salon.story`, `profile.work_style`, `profile.business_to_dev`, `career.target_role` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

창업 경험은 리스크라기보다 제품과 고객을 실제 운영 관점에서 보는 배경에 가깝습니다. 회사의 문제가 사용자·비즈니스·기술을 함께 고민해야 하는 문제라면, 오히려 그 경험이 집중력과 책임감으로 이어질 수 있습니다.

**Default Answer**

그 우려는 자연스럽습니다. 창업 경험이 있는 사람에게 “다시 자기 일을 하러 가지 않을까?”라는 질문은 충분히 나올 수 있습니다.

다만 우수의 창업 경험은 단순히 독립 욕구만을 의미하기보다, 고객 경험과 운영 현실을 직접 겪어본 배경에 가깝습니다. 우수살롱을 운영하면서 브랜드, 공간, 메뉴, 고객 응대, 매출, 운영 피로도까지 직접 다뤘고, 그 경험이 지금은 서비스 구조와 사용자 흐름을 보는 관점으로 연결되고 있습니다.

회사에서 집중하기 어려운 사람이라기보다, 왜 이 기능을 만들고 어떤 사용자 문제를 해결하는지 납득될 때 더 강하게 몰입하는 타입에 가깝습니다. 특히 AI 서비스, 풀스택 제품, 사용자 경험과 데이터가 연결되는 일이라면 창업 경험은 이탈 리스크보다 책임감 있는 제품 감각으로 작동할 가능성이 큽니다.

---

### FAQ R3. 비전공/전환형 개발자로서 깊이가 부족하지 않나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.non_cs_depth.default` |
| Intent ID | `recruiter_risk.non_cs_depth` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `비전공인데 개발 깊이가 부족하지 않나요?`, `전환형 개발자로서 한계가 있지 않나요?`, `non CS background`, `career changer developer depth`, `not a computer science major` |
| Source Chunk IDs | `profile.education`, `skills.backend`, `skills.frontend`, `project.instagram_clone.fact`, `project.askoosu.fact`, `profile.learning_style` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

전통적인 CS 전공자와 같은 출발점은 아니지만, 우수는 실제 서비스 구조를 만들며 깊이를 쌓는 방식으로 성장하고 있습니다. React/TypeScript, Spring Boot, PostgreSQL, AI/RAG 프로젝트를 연결하며 “화면만 만드는 개발자”에서 “서비스 흐름을 설계하는 개발자”로 확장 중입니다.

**Default Answer**

맞는 지적입니다. 우수는 컴퓨터공학 전공자로 오래 훈련된 개발자는 아니기 때문에, 알고리즘·시스템 설계·대규모 운영 경험에서는 아직 더 쌓아야 할 부분이 있습니다.

다만 전환형 개발자라는 점이 곧 깊이 부족만을 의미하지는 않습니다. 우수는 고객 리서치, 데이터 분석, 브랜드 운영, UX 디자인을 거쳐 개발로 확장해 왔고, 그 과정에서 문제 정의와 사용자 흐름을 먼저 잡는 강점이 생겼습니다.

기술적으로는 React/TypeScript 기반 프론트엔드에서 시작해 Spring Boot, PostgreSQL, API, AI/RAG 구조로 확장하고 있습니다. 특히 Instagram Clone은 전통적인 풀스택 구조를, AskOosu는 Notion Wiki와 RAG 기반의 AI 포트폴리오 구조를 보여주는 프로젝트입니다. 따라서 현재의 강점은 “완성된 시니어 백엔드 깊이”가 아니라, 빠르게 배우고 서비스 단위로 연결하는 성장 속도와 구조화 능력에 있습니다.

---

### FAQ R4. AI를 많이 쓰면 직접 실력이 부족한 것 아닌가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.ai_dependency.default` |
| Intent ID | `recruiter_risk.ai_dependency` |
| Entity ID | `ai_usage` |
| Cache Mode | `direct_cache` |
| Patterns | `AI를 많이 쓰면 실력이 부족한 것 아닌가요?`, `AI 없으면 개발 못 하는 것 아닌가요?`, `AI 의존도가 높은 것 아닌가요?`, `Does Oosu rely too much on AI?`, `Can Oosu code without AI?` |
| Source Chunk IDs | `ai_usage.workflow`, `ai_usage.validation`, `project.portfolio_oh.fact`, `project.instagram_clone.fact`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

AI를 많이 쓰는 것은 맞지만, 우수는 AI를 대체물이 아니라 설계·구현·디버깅을 빠르게 연결하는 도구로 사용합니다. 중요한 기준은 AI가 코드를 써줬는지가 아니라, 구조를 판단하고, 오류를 검증하고, 실제 서비스에 통합할 수 있는가입니다.

**Default Answer**

그 질문은 AskOosu에서 꼭 제대로 답해야 하는 질문입니다. 우수는 AI를 많이 쓰는 개발자가 맞습니다. 다만 그것을 숨기기보다, AI를 어떻게 검증하고 실제 결과물로 연결하는지가 더 중요한 기준이라고 봅니다.

AI는 코드를 빠르게 생성할 수 있지만, 어떤 구조가 맞는지, API와 상태 흐름이 어떻게 연결되는지, 오류가 어디서 발생하는지, 사용자가 실제로 이해할 수 있는 UI인지 판단하는 것은 여전히 사람의 몫입니다. 우수는 AI에게 단순히 “만들어줘”라고 시키는 방식보다, 기획·설계·구현·디버깅·문서화 단계를 나누어 활용하는 쪽에 가깝습니다.

또한 Portfoli-Oh!처럼 바닐라 JavaScript와 인터랙션 구현을 직접 다뤘던 경험, Instagram Clone처럼 API와 DB 구조를 연결하는 학습, AskOosu처럼 RAG 응답 품질과 fallback을 설계하는 프로젝트를 통해 AI 사용을 검증 가능한 결과물로 바꾸고 있습니다. 따라서 이 질문의 핵심은 “AI를 쓰느냐”가 아니라 “AI 결과물을 읽고 판단하고 책임질 수 있느냐”입니다.

---

### FAQ R5. 프로젝트가 많은데 깊이가 있는 프로젝트가 있나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.project_depth.default` |
| Intent ID | `recruiter_risk.project_depth` |
| Entity ID | `projects` |
| Cache Mode | `direct_cache` |
| Patterns | `프로젝트가 많은데 깊이가 있나요?`, `프로젝트가 산만해 보이는데`, `too many projects not enough depth`, `Are Oosu's projects shallow?`, `portfolio depth` |
| Source Chunk IDs | `project.askoosu.fact`, `project.instagram_clone.fact`, `project.sticks.fact`, `project.portfolio_oh.story`, `profile.growth_areas` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

프로젝트 수가 많아 산만해 보일 수 있지만, 대표 깊이 프로젝트는 AskOosu와 Instagram Clone입니다. AskOosu는 AI/RAG 답변 품질과 포트폴리오 정보 구조를, Instagram Clone은 사용자·게시물·댓글·팔로우·검색 같은 전통적인 풀스택 흐름을 보여줍니다.

**Default Answer**

그렇게 보일 수 있습니다. 우수의 포트폴리오는 여러 관심사가 넓게 펼쳐져 있어서, 처음 보면 “깊이보다 양이 많은 것 아닌가?”라는 인상을 줄 수 있습니다.

다만 모든 프로젝트를 같은 무게로 보려는 것이 아니라, 대표 프로젝트와 보조 프로젝트의 역할을 분리해서 보는 것이 좋습니다. AskOosu는 AI 포트폴리오와 RAG 구조, 답변 캐시, Notion Wiki, 검색 품질을 보여주는 핵심 프로젝트입니다. Instagram Clone은 Spring Boot, PostgreSQL, 사용자·게시물·댓글·팔로우·검색 같은 서비스 백엔드 구조를 연결한 풀스택 학습 프로젝트입니다.

반대로 Uncorked, Gradient Therapy, Lab 계열 작업은 깊이 있는 백엔드 프로젝트라기보다 시각 감각, 브랜딩, 자동화, 실험성을 보여주는 보조 증거에 가깝습니다. 따라서 평가 기준은 “모든 프로젝트가 깊은가”보다 “대표 프로젝트에서 어떤 구조적 깊이를 보여주는가”가 더 적절합니다.

---

### FAQ R6. 프론트/백/AI를 다 한다고 하는데 포지션이 애매하지 않나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.position_ambiguity.default` |
| Intent ID | `recruiter_risk.position_ambiguity` |
| Entity ID | `career_target` |
| Cache Mode | `direct_cache` |
| Patterns | `프론트 백 AI 다 한다고 하면 애매하지 않나요?`, `포지션이 애매하지 않나요?`, `generalist risk`, `frontend backend AI position fit`, `not specialized enough` |
| Source Chunk IDs | `career.target_role`, `skills.frontend`, `skills.backend`, `skills.ai`, `project.askoosu.fact`, `project.instagram_clone.fact` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

애매한 올라운더라기보다, AI 서비스나 풀스택 제품에서 사용자 흐름과 API, 데이터, AI 응답을 연결하는 쪽에 강점이 있습니다. 첫 포지션은 AI 서비스 프론트엔드, 풀스택 주니어, AI application developer 쪽이 가장 자연스럽습니다.

**Default Answer**

그 우려도 현실적입니다. “프론트도 하고 백엔드도 하고 AI도 합니다”라는 말은 잘못 들리면 전문성이 흐릿한 사람처럼 보일 수 있습니다.

우수의 방향은 모든 분야를 같은 깊이로 한다는 의미가 아닙니다. 더 정확히는 사용자 경험을 이해하고, 프론트엔드 화면과 API, 데이터, AI 응답 흐름을 하나의 서비스로 연결하는 데 강점이 있는 타입입니다. 그래서 순수 알고리즘 연구자나 깊은 인프라 엔지니어라기보다, AI application developer, 풀스택 주니어, AI 서비스 프론트엔드, 프로덕트 지향 개발자에 더 가깝습니다.

특히 AskOosu는 이 방향성을 잘 보여줍니다. 단순 챗봇이 아니라, Notion Wiki, FAQ cache, RAG, 답변 품질, UI 렌더링을 함께 설계해야 하는 프로젝트이기 때문입니다. 따라서 포지션을 잡는다면 “무엇이든 다 하는 사람”보다 “AI 기능이 들어간 서비스 경험을 끝까지 연결하는 개발자”로 보는 편이 좋습니다.

---

### FAQ R7. 단점이나 리스크는 무엇인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.weakness.default` |
| Intent ID | `recruiter_risk.weakness` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `단점이 뭐예요?`, `리스크가 뭐예요?`, `약점은 무엇인가요?`, `What are Oosu's weaknesses?`, `biggest risk`, `concerns about Oosu` |
| Source Chunk IDs | `profile.growth_areas`, `profile.work_style`, `skills.backend`, `skills.ai`, `answer_guardrails` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

가장 큰 리스크는 관심 범위가 넓어 초점이 분산될 수 있다는 점과, 백엔드·AI 깊이를 계속 쌓아야 한다는 점입니다. 다만 우수는 이를 인식하고, AskOosu처럼 하나의 서비스 안에서 우선순위와 완료 기준을 잡는 방식으로 보완하고 있습니다.

**Default Answer**

우수의 리스크는 크게 세 가지입니다. 첫째, 관심 범위가 넓어서 프로젝트가 확장되기 쉽습니다. 둘째, 기획과 구조 설계에 강하게 몰입하는 편이라 마무리 기준을 먼저 정하지 않으면 스코프가 커질 수 있습니다. 셋째, 백엔드와 AI는 계속 깊이를 쌓는 중이기 때문에, 초반부터 시니어 수준의 시스템 설계를 기대하기보다는 성장형 풀스택/AI 서비스 개발자로 보는 것이 더 정확합니다.

다만 이 리스크를 모르는 상태는 아닙니다. AskOosu에서도 FAQ cache, RAG, fallback, answer guardrail처럼 답변 품질을 구조화하려는 시도를 하고 있고, 프로젝트를 단순히 늘리기보다 대표 프로젝트의 완성도를 높이는 방향으로 정리하고 있습니다.

그래서 평가할 때는 “완성형인가?”보다 “자기 리스크를 알고 개선하는 방식이 있는가?”를 보는 것이 좋습니다. 이 관점에서는 우수의 강점과 리스크가 꽤 명확하게 드러나는 편입니다.

---

### FAQ R8. 지금 채용하면 어떤 일을 맡기는 게 좋나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.fit.best_tasks.default` |
| Intent ID | `recruiter_fit.best_tasks` |
| Entity ID | `career_target` |
| Cache Mode | `direct_cache` |
| Patterns | `지금 채용하면 어떤 일을 맡기면 좋나요?`, `어떤 업무에 잘 맞나요?`, `where would Oosu fit`, `best tasks for Oosu`, `what should we hire Oosu for` |
| Source Chunk IDs | `career.target_role`, `profile.strengths`, `skills.frontend`, `skills.backend`, `skills.ai`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

AI 기능이 들어간 웹 서비스에서 사용자 흐름, 프론트엔드 UI, API 연동, 데이터 구조, 답변 품질을 함께 다루는 일이 잘 맞습니다. 예를 들면 AI 챗봇 UI, 내부 도구, RAG 기반 검색/추천, 서비스 관리자 화면, 프로토타입 고도화 같은 업무입니다.

**Default Answer**

지금 우수를 채용한다면, 완전히 분리된 단순 퍼블리싱 작업보다 “사용자 문제를 이해하고 기능 흐름을 끝까지 연결해야 하는 업무”가 잘 맞습니다.

예를 들면 AI 챗봇 UI, RAG 기반 검색/추천 서비스, API 연동이 많은 프론트엔드, 내부 운영 도구, 관리자 페이지, MVP 프로토타입 고도화, 사용자 흐름 개선 같은 업무가 적합합니다. 우수는 디자인 감각과 개발 구현을 함께 다루고, 사용자가 왜 이 기능을 써야 하는지까지 생각하는 편이기 때문입니다.

반대로 초반부터 대규모 인프라 최적화나 고난도 알고리즘 중심 역할을 단독으로 맡기는 것은 적합도가 낮을 수 있습니다. 대신 제품 맥락을 이해해야 하는 AI application / fullstack / frontend-heavy 역할에서는 빠르게 기여할 가능성이 큽니다.

---

### FAQ R9. 나이가 있거나 커리어 전환이 늦은 편 아닌가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.career_transition_timing.default` |
| Intent ID | `recruiter_risk.career_transition_timing` |
| Entity ID | `career_transition` |
| Cache Mode | `faq_rewrite` |
| Patterns | `커리어 전환이 늦은 것 아닌가요?`, `나이가 있는 신입 아닌가요?`, `late career changer`, `older junior developer`, `career transition timing` |
| Source Chunk IDs | `career.timeline`, `profile.business_to_dev`, `profile.strengths`, `project.askoosu.fact`, `public_redaction_rules` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

출발이 빠른 개발자와는 다른 경로지만, 그만큼 고객·비즈니스·운영·UX를 경험한 상태에서 개발로 들어왔다는 차이가 있습니다. 단순 주니어라기보다 제품 맥락을 이해하는 전환형 개발자로 보는 것이 더 정확합니다.

**Default Answer**

그 질문은 현실적인 평가 포인트입니다. 우수는 전형적인 컴퓨터공학 전공 신입 개발자와 같은 경로는 아닙니다.

대신 고객 리서치, POS 데이터 분석, 브랜드 운영, 와인바 창업, UX 디자인, 실서비스 웹사이트 업데이트를 거쳐 개발로 들어왔습니다. 그래서 순수 개발 연차만 보면 늦게 시작한 편이지만, 사용자와 비즈니스 맥락을 이해하는 경험은 이미 쌓여 있습니다.

채용 관점에서는 이 점을 “늦은 신입”으로만 볼 수도 있고, “제품 맥락을 알고 개발을 배우는 전환형 인재”로 볼 수도 있습니다. 특히 AI 서비스나 B2B 도구처럼 사용자 문제와 서비스 구조를 함께 봐야 하는 팀이라면, 이 경로는 단점만이 아니라 차별점이 될 수 있습니다.

---

### FAQ R10. 협업 경험은 충분한가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.collaboration.default` |
| Intent ID | `recruiter_risk.collaboration` |
| Entity ID | `collaboration` |
| Cache Mode | `direct_cache` |
| Patterns | `협업 경험은 충분한가요?`, `혼자 만든 프로젝트만 많은 것 아닌가요?`, `team collaboration experience`, `can Oosu work in a team`, `solo portfolio risk` |
| Source Chunk IDs | `profile.collaboration`, `career.timeline`, `project.ezair.fact`, `project.sticks.fact`, `profile.global_communication` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

개발 프로젝트 중에는 개인 작업도 많지만, 우수는 이전 경력에서 클라이언트 커뮤니케이션, 글로벌 운영, 컨설팅, 매장 운영, 팀 프로젝트를 경험했습니다. 개발 협업은 더 쌓아야 하지만, 이해관계자와 목적을 맞추는 커뮤니케이션 기반은 강한 편입니다.

**Default Answer**

개발 포트폴리오만 보면 개인 프로젝트 비중이 높아 보일 수 있습니다. 이 부분은 실제로 앞으로 더 보완해야 할 지점입니다.

다만 우수가 협업 경험이 없는 사람은 아닙니다. GfK Korea에서는 글로벌 계정 데이터 분석과 고객 커뮤니케이션을 경험했고, JW CRONY WORLDWIDE에서는 해외 VR-4D 운영과 설치·유지보수 커뮤니케이션을 다뤘습니다. Sticks & Stones에서는 클라이언트가 있는 웹사이트 업데이트를 진행했고, EZ Air는 팀 프로젝트에서 AI 방향을 설득하고 통합하는 경험이 있었습니다.

따라서 개발 팀 협업은 더 쌓아가야 하지만, 비즈니스 언어와 개발 언어 사이를 연결하고, 목적과 실행 가능성을 정리하는 커뮤니케이션 기반은 강점으로 볼 수 있습니다.

---

### FAQ R11. 마무리 집중력이 약한 편인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.finishing.default` |
| Intent ID | `recruiter_risk.finishing` |
| Entity ID | `work_style` |
| Cache Mode | `direct_cache` |
| Patterns | `마무리 집중력이 약한가요?`, `완성도가 떨어지는 것 아닌가요?`, `scope creep`, `finishing risk`, `does Oosu finish projects` |
| Source Chunk IDs | `profile.growth_areas`, `profile.work_style`, `project.askoosu.fact`, `answer_engine_rules` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

우수는 초기 기획과 구조 설계에 강하게 몰입하는 편이라 스코프가 커질 수 있습니다. 그래서 최근에는 완료 기준, 우선순위, fallback, 평가 질문을 먼저 정해 마무리 리스크를 줄이는 방식으로 개선하고 있습니다.

**Default Answer**

어느 정도 맞는 지적입니다. 우수는 문제를 넓게 보고 구조를 잡는 데 강점이 있지만, 그만큼 프로젝트가 커지거나 세부 아이디어가 늘어날 수 있습니다.

이 리스크를 줄이기 위해 최근 프로젝트에서는 완료 기준을 먼저 정하는 방식을 쓰고 있습니다. AskOosu의 경우에도 FAQ cache, RAG fallback, answer guardrail, evaluation set처럼 “어디까지가 잘 된 답변인가”를 먼저 정의하려고 합니다.

그래서 마무리 리스크는 존재하지만, 방치된 약점이라기보다 현재 개선 중인 작업 방식에 가깝습니다. 특히 명확한 목표와 우선순위가 주어지면, 기획력과 실행력을 더 안정적으로 연결할 수 있습니다.

---

### FAQ R12. 개발자로서 가장 신뢰할 수 있는 근거는 무엇인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.evidence.developer_trust.default` |
| Intent ID | `recruiter_evidence.developer_trust` |
| Entity ID | `projects` |
| Cache Mode | `direct_cache` |
| Patterns | `개발자로서 신뢰할 수 있는 근거는 무엇인가요?`, `무엇을 보고 개발 실력을 판단하면 되나요?`, `developer evidence`, `proof of skill`, `technical credibility` |
| Source Chunk IDs | `project.askoosu.fact`, `project.instagram_clone.fact`, `project.sticks.fact`, `project.portfolio_oh.fact`, `skills.frontend`, `skills.backend` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

AskOosu, Instagram Clone, Sticks & Stones, Portfoli-Oh!를 보는 것이 좋습니다. 각각 AI/RAG 구조, 풀스택 API/DB 흐름, 실서비스 웹사이트 업데이트, 바닐라 JS 인터랙션 구현을 보여줍니다.

**Default Answer**

우수의 개발 역량을 판단하려면 프로젝트를 역할별로 나눠 보는 것이 좋습니다.

AskOosu는 AI/RAG 기반 포트폴리오 구조와 답변 품질 설계를 보여줍니다. Instagram Clone은 Spring Boot, PostgreSQL, 사용자·게시물·댓글·팔로우·검색 같은 전통적인 서비스 흐름을 다룬 풀스택 학습 근거입니다. Sticks & Stones는 클라이언트가 있는 실서비스 웹사이트 업데이트 경험이고, Portfoli-Oh!는 바닐라 JavaScript와 인터랙션 중심 구현 경험을 보여줍니다.

즉 “한 프로젝트가 모든 것을 증명한다”기보다, 여러 프로젝트가 각각 프론트엔드 감각, 백엔드 구조, AI 연결, 실서비스 경험을 나눠서 보여주는 방식입니다.

---

### FAQ R13. 비즈니스 경험이 개발에 정말 도움이 되나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.evidence.business_to_dev.default` |
| Intent ID | `recruiter_evidence.business_to_dev` |
| Entity ID | `business_to_dev` |
| Cache Mode | `direct_cache` |
| Patterns | `비즈니스 경험이 개발에 도움이 되나요?`, `경영학이 개발과 무슨 관련이 있나요?`, `business background developer`, `customer experience to development`, `CX to UX` |
| Source Chunk IDs | `profile.business_to_dev`, `profile.development_philosophy`, `career.oosu_salon.story`, `career.gfk.story`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

도움이 됩니다. 우수의 비즈니스 경험은 기능을 만들기 전에 사용자 문제, 고객 맥락, 운영 현실, 서비스 가치를 먼저 보는 습관으로 연결됩니다.

**Default Answer**

우수의 비즈니스 경험은 개발을 대체하는 장점이 아니라, 개발 방향을 잡는 데 도움을 주는 배경입니다. 고객 리서치, POS 데이터 분석, CRM, 브랜드 운영, 와인바 창업 경험은 사용자가 왜 특정 기능을 필요로 하는지, 서비스가 어떤 흐름으로 작동해야 하는지 생각하는 데 연결됩니다.

예를 들어 AskOosu는 단순히 “AI 챗봇을 붙인 포트폴리오”가 아니라, 방문자가 어떤 질문을 할지, 어떤 답변을 신뢰할지, 어떤 정보가 채용자에게 중요할지를 구조화한 프로젝트입니다. 이런 문제 정의 능력은 비즈니스 경험에서 온 강점입니다.

따라서 우수의 차별점은 개발만 잘한다고 주장하는 것이 아니라, 사용자 경험과 비즈니스 목적을 이해한 뒤 그에 맞는 기술 구조를 만들려는 데 있습니다.

---

### FAQ R14. 기술적으로 가장 부족한 부분은 무엇인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.technical_gap.default` |
| Intent ID | `recruiter_risk.technical_gap` |
| Entity ID | `skills` |
| Cache Mode | `direct_cache` |
| Patterns | `기술적으로 가장 부족한 부분은 무엇인가요?`, `어떤 기술을 더 배워야 하나요?`, `technical weakness`, `skill gap`, `backend depth gap`, `AI depth gap` |
| Source Chunk IDs | `profile.growth_areas`, `skills.backend`, `skills.ai`, `profile.learning_style`, `kosa.learning_log` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

백엔드와 AI/RAG는 계속 깊이를 쌓는 중입니다. 현재는 서비스 구조를 연결하는 단계에 강점이 있고, 앞으로는 테스트, 성능, 보안, 배포 안정성, 데이터 모델링 깊이를 더 강화해야 합니다.

**Default Answer**

기술적으로는 백엔드와 AI/RAG의 깊이를 계속 쌓아야 합니다. Spring Boot, PostgreSQL, API 설계, RAG 구조를 프로젝트에 적용하고 있지만, 대규모 트래픽 운영, 복잡한 시스템 설계, 고급 성능 최적화까지 충분히 경험했다고 말하기는 어렵습니다.

다만 현재 우수의 강점은 여러 기술을 서비스 흐름으로 연결하는 데 있습니다. 프론트엔드 화면, API, DB, AI 응답, fallback을 하나의 사용자 경험으로 묶으려는 방향이 뚜렷합니다.

따라서 기술적 평가는 “이미 깊이가 완성됐는가”보다 “현재 어떤 기반을 갖고 있고, 어떤 방향으로 깊어지고 있는가”로 보는 것이 좋습니다. 앞으로는 테스트 자동화, 보안, 관측성, 배포 안정성, DB 설계 품질을 더 강화하는 것이 핵심 과제입니다.

---

### FAQ R15. 포트폴리오가 너무 AI 포장처럼 보이지 않나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.ai_wrapping.default` |
| Intent ID | `recruiter_risk.ai_wrapping` |
| Entity ID | `askoosu` |
| Cache Mode | `direct_cache` |
| Patterns | `AI 포장처럼 보이지 않나요?`, `그냥 AI 붙인 포트폴리오 아닌가요?`, `AI wrapper`, `just a chatbot portfolio`, `AI buzzword risk` |
| Source Chunk IDs | `project.askoosu.fact`, `project.askoosu.rag_principles`, `faq_cache_design`, `answer_engine_rules`, `project.portfolio_oh.story` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

AskOosu의 핵심은 AI를 붙였다는 사실보다, 포트폴리오 정보를 질문 가능하게 구조화하고 답변 품질을 관리하는 데 있습니다. FAQ cache, RAG, source badge, fallback, evaluation set 같은 구조가 단순 AI 포장과 구분되는 지점입니다.

**Default Answer**

그 우려는 충분히 가능합니다. AI 포트폴리오라고 하면 “기존 포트폴리오에 챗봇만 붙인 것 아닌가?”라는 인상을 줄 수 있습니다.

AskOosu가 보여주려는 핵심은 AI 자체보다 정보 구조입니다. 방문자가 어떤 질문을 할지, 어떤 답변은 캐시로 처리할지, 어떤 질문은 RAG로 근거를 찾아야 할지, 근거가 없을 때 어떻게 fallback할지를 설계하는 프로젝트입니다.

따라서 AskOosu는 단순한 AI wrapper라기보다, 포트폴리오 콘텐츠를 검색 가능한 지식베이스로 바꾸고, 답변 품질을 운영하는 실험에 가깝습니다. 이 점이 Portfoli-Oh!의 정적인 JSON 챗봇 한계를 넘어서는 방향입니다.

---

### FAQ R16. 프로젝트들이 실제 운영 가능한 수준인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.production_readiness.default` |
| Intent ID | `recruiter_risk.production_readiness` |
| Entity ID | `projects` |
| Cache Mode | `faq_rewrite` |
| Patterns | `실제 운영 가능한 수준인가요?`, `프로덕션 수준인가요?`, `toy project 아닌가요?`, `production ready`, `real service readiness` |
| Source Chunk IDs | `project.askoosu.fact`, `project.sticks.fact`, `project.instagram_clone.fact`, `answer_guardrails`, `freshness_policy` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

모든 프로젝트가 프로덕션 수준이라고 말하면 과장입니다. 다만 Sticks & Stones는 실서비스 웹사이트 업데이트 경험이고, AskOosu는 포트폴리오 자체를 운영 가능한 AI 서비스 형태로 만들려는 프로젝트이며, Instagram Clone은 풀스택 구조 학습 근거로 보는 것이 정확합니다.

**Default Answer**

모든 프로젝트를 프로덕션 수준이라고 말하는 것은 맞지 않습니다. 우수의 프로젝트는 실서비스 경험, 학습 프로젝트, 포트폴리오 실험이 섞여 있습니다.

Sticks & Stones는 클라이언트가 있는 실서비스 웹사이트 업데이트 경험으로 볼 수 있습니다. AskOosu는 실제 포트폴리오에 적용되는 AI/RAG 서비스 구조를 목표로 하고 있고, FAQ cache, fallback, source badge, RAG 평가 질문 같은 운영 요소를 포함합니다. Instagram Clone은 실제 서비스 출시보다는 백엔드와 DB 구조를 익히기 위한 풀스택 프로젝트로 보는 것이 정확합니다.

따라서 “전부 운영 중인 상용 서비스”처럼 포장하면 안 됩니다. 대신 각 프로젝트가 어떤 수준의 증거인지 구분해서 설명하는 편이 가장 신뢰감 있습니다.

---

### FAQ R17. 왜 회사가 우수를 뽑아야 하나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.fit.why_hire.default` |
| Intent ID | `recruiter_fit.why_hire` |
| Entity ID | `career_target` |
| Cache Mode | `direct_cache` |
| Patterns | `왜 회사가 우수를 뽑아야 하나요?`, `채용해야 하는 이유`, `why hire Oosu`, `what is Oosu's value`, `hiring value proposition` |
| Source Chunk IDs | `profile.strengths`, `profile.business_to_dev`, `project.askoosu.fact`, `project.instagram_clone.fact`, `project.sticks.fact` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

우수는 사용자 경험, 비즈니스 맥락, 프론트엔드 구현, 백엔드/API, AI 활용을 연결하려는 개발자입니다. AI 기능이 들어간 서비스나 MVP를 빠르게 구조화하고 실제 화면과 데이터 흐름으로 옮기는 팀에서 가치가 큽니다.

**Default Answer**

우수를 뽑아야 하는 이유는 “한 가지 기술만 깊게 파는 완성형 전문가”라서가 아닙니다. 더 정확히는 사용자 문제를 이해하고, 그 문제를 화면·API·데이터·AI 응답 흐름으로 연결하는 데 강점이 있기 때문입니다.

경영학, 고객 리서치, POS 데이터 분석, 브랜드 운영, UX 디자인을 거쳐 개발로 들어온 경로는 일반적인 개발자와 다르지만, 그만큼 서비스 맥락을 먼저 보는 장점이 있습니다. AskOosu, Instagram Clone, Sticks & Stones는 각각 AI/RAG 구조, 풀스택 흐름, 실서비스 웹 업데이트 경험을 보여줍니다.

따라서 AI 기능이 들어간 웹 서비스, 내부 도구, 사용자 중심 프로토타입, 풀스택 MVP를 빠르게 만들고 개선해야 하는 팀이라면 우수의 조합이 꽤 실용적으로 맞을 수 있습니다.

---

### FAQ R18. 어떤 회사나 팀에는 잘 맞지 않을 수 있나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.fit.bad_fit.default` |
| Intent ID | `recruiter_fit.bad_fit` |
| Entity ID | `career_target` |
| Cache Mode | `direct_cache` |
| Patterns | `어떤 회사에는 잘 안 맞나요?`, `어떤 팀과 안 맞을까요?`, `bad fit`, `not a good fit`, `what environment is not suitable for Oosu` |
| Source Chunk IDs | `profile.work_style`, `profile.growth_areas`, `career.target_role`, `answer_guardrails` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

목적 설명 없이 반복 구현만 요구하거나, 사용자 문제와 제품 맥락을 거의 다루지 않는 환경에는 잘 맞지 않을 수 있습니다. 반대로 문제 정의와 구현을 함께 요구하는 팀에서 강점이 더 잘 드러납니다.

**Default Answer**

우수는 모든 팀에 똑같이 잘 맞는 타입은 아닙니다. 목적과 맥락 없이 작은 작업만 반복하거나, 사용자 문제와 제품 방향을 거의 공유하지 않는 환경에서는 답답함을 느낄 수 있습니다.

또한 초반부터 대규모 인프라나 고난도 백엔드 성능 최적화를 단독으로 맡기는 팀이라면 현재 단계와 맞지 않을 수 있습니다. 그보다 사용자 흐름, 기능 설계, 프론트엔드, API, 데이터, AI 응답을 함께 다루는 팀에서 더 적합합니다.

이 답변은 약점을 숨기기 위한 것이 아니라, 핏을 정확히 보기 위한 기준입니다. 우수에게 맞는 환경은 성장 기회가 있으면서도 실제 사용자 문제와 연결된 책임을 맡을 수 있는 팀입니다.

---

### FAQ R19. 스타트업과 대기업 중 어디에 더 맞나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.fit.company_type.default` |
| Intent ID | `recruiter_fit.company_type` |
| Entity ID | `career_target` |
| Cache Mode | `faq_rewrite` |
| Patterns | `스타트업과 대기업 중 어디에 맞나요?`, `어떤 회사 규모가 맞나요?`, `startup or enterprise`, `company type fit` |
| Source Chunk IDs | `profile.work_style`, `profile.business_to_dev`, `career.timeline`, `career.target_role` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

회사 규모보다 역할의 성격이 더 중요합니다. 문제 정의와 실행을 함께 요구하는 환경, AI 서비스나 사용자 경험 개선처럼 맥락을 이해해야 하는 일이 있는 팀에 더 잘 맞습니다.

**Default Answer**

스타트업이냐 대기업이냐보다 중요한 것은 역할의 성격입니다. 우수는 정해진 티켓만 빠르게 처리하는 환경보다, 왜 이 기능이 필요한지 이해하고 사용자 경험과 구현을 함께 고민해야 하는 환경에 더 잘 맞습니다.

스타트업에서는 빠른 학습과 범위 연결 능력이 장점이 될 수 있습니다. 대기업이나 중견 조직에서는 비즈니스 커뮤니케이션, 데이터/고객 경험 이해, 문서화 능력이 강점이 될 수 있습니다.

따라서 규모로 단정하기보다, AI application, 풀스택 서비스, 내부 도구, 사용자 경험 개선처럼 제품 맥락과 기술 구현이 연결되는 역할인지 보는 것이 더 정확합니다.

---

### FAQ R20. 우수는 주니어인가요, 경력자인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.fit.level.default` |
| Intent ID | `recruiter_fit.level` |
| Entity ID | `career_level` |
| Cache Mode | `direct_cache` |
| Patterns | `우수는 주니어인가요 경력자인가요?`, `개발 경력 수준`, `junior or experienced`, `career level`, `seniority` |
| Source Chunk IDs | `career.timeline`, `project.sticks.fact`, `project.askoosu.fact`, `project.instagram_clone.fact`, `profile.business_to_dev` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

개발자로서는 성장 중인 주니어/전환형 개발자에 가깝고, 비즈니스·고객 경험·운영·UX 관점에서는 경력 기반이 있습니다. 그래서 순수 신입보다는 제품 맥락을 이해하는 주니어 풀스택/AI 서비스 개발자로 보는 것이 적절합니다.

**Default Answer**

개발 직무 기준으로는 우수는 성장 중인 주니어 또는 전환형 개발자에 가깝습니다. 아직 대규모 운영 경험이나 시니어 수준의 시스템 설계를 주장하기는 어렵습니다.

다만 커리어 전체로 보면 고객 리서치, 데이터 분석, 글로벌 커뮤니케이션, 브랜드 운영, 창업, UX 디자인, 실서비스 웹사이트 업데이트 경험이 있습니다. 그래서 완전한 사회초년생 신입과는 다른 기반을 갖고 있습니다.

가장 정확한 포지셔닝은 “비즈니스와 UX 기반이 있는 주니어 풀스택/AI application developer”입니다. 기술 깊이를 계속 쌓는 중이지만, 사용자 문제와 서비스 구조를 이해하는 속도는 강점으로 볼 수 있습니다.

---

### FAQ R21. 포트폴리오에 TODO가 남아 있으면 신뢰가 떨어지지 않나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.todo_visibility.default` |
| Intent ID | `recruiter_risk.todo_visibility` |
| Entity ID | `answer_guardrails` |
| Cache Mode | `direct_cache` |
| Patterns | `TODO가 남아 있으면 신뢰가 떨어지지 않나요?`, `미완성 아닌가요?`, `TODO fields`, `unfinished portfolio`, `missing links` |
| Source Chunk IDs | `answer_guardrails`, `freshness_policy`, `link_policy`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

TODO가 그대로 사용자에게 노출되면 신뢰가 떨어질 수 있습니다. 다만 내부 Wiki에서 TODO를 명시하는 것은 오히려 AI가 확인되지 않은 링크나 성과를 지어내지 않도록 막는 안전장치입니다.

**Default Answer**

사용자 화면에 TODO가 그대로 보이면 확실히 좋지 않습니다. 채용자가 보는 포트폴리오에서는 미완성처럼 느껴질 수 있습니다.

다만 내부 Notion Wiki나 RAG source에서 TODO를 관리하는 것은 다른 의미가 있습니다. 확인되지 않은 이력서 링크, 라이브 URL, 수치, private repo 정보를 AI가 임의로 말하지 않도록 막는 안전장치이기 때문입니다.

따라서 TODO는 프론트 화면에서 그대로 노출하는 것이 아니라, 답변 엔진의 guardrail로 사용해야 합니다. 사용자에게는 “현재 공개된 링크는 아직 정리 중입니다”처럼 정제된 fallback으로 보여주는 것이 좋습니다.

---

### FAQ R22. 기술 블로그나 문서화 습관은 있나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.evidence.documentation.default` |
| Intent ID | `recruiter_evidence.documentation` |
| Entity ID | `documentation` |
| Cache Mode | `direct_cache` |
| Patterns | `문서화 습관이 있나요?`, `기술 블로그를 쓰나요?`, `documentation habit`, `technical writing`, `learning notes` |
| Source Chunk IDs | `creative.medium`, `creative.tistory`, `kosa.learning_log`, `project.askoosu.wiki`, `profile.academic_interpretation` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

우수는 Notion Wiki, README, 학습 로그, Tistory/Medium 같은 문서화 흐름을 중요하게 봅니다. AskOosu 자체도 포트폴리오 내용을 RAG 가능한 지식베이스로 정리하는 문서화 프로젝트에 가깝습니다.

**Default Answer**

네, 문서화는 우수의 중요한 강점 중 하나입니다. 단순히 결과물을 보여주는 것보다, 왜 만들었고 어떤 구조로 작동하며 어떤 기준으로 답변해야 하는지를 정리하는 데 관심이 많습니다.

AskOosu는 이 성향이 가장 잘 드러나는 프로젝트입니다. 포트폴리오 내용을 Notion Wiki로 정리하고, FAQ cache, RAG source, answer guardrail, evaluation set으로 연결하려는 구조이기 때문입니다.

다만 공개 링크나 글 목록은 확인된 것만 제공해야 합니다. 링크가 정리되지 않은 상태에서는 구체 URL을 지어내지 않고, 문서화 습관과 사용 목적 위주로 설명하는 것이 안전합니다.

---

### FAQ R23. 실서비스 경험이 있나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.evidence.real_service.default` |
| Intent ID | `recruiter_evidence.real_service` |
| Entity ID | `career_projects` |
| Cache Mode | `direct_cache` |
| Patterns | `실서비스 경험이 있나요?`, `클라이언트 프로젝트 경험`, `real service experience`, `client project`, `production client work` |
| Source Chunk IDs | `project.sticks.fact`, `career.oosu_salon.story`, `career.gfk.story`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

개발 실서비스 경험으로는 Sticks & Stones 웹사이트 업데이트가 가장 직접적입니다. 그 외 우수살롱 운영, GfK 데이터 리포팅, 글로벌 운영 경험은 개발 이전의 실제 고객·운영 경험으로 연결됩니다.

**Default Answer**

개발 관점에서 가장 직접적인 실서비스 경험은 Sticks & Stones 웹사이트 업데이트입니다. 클라이언트가 있는 환경에서 기존 웹사이트를 개선하고, 사용자 참여와 디지털 여정을 고려해 인터페이스를 업데이트한 경험입니다.

개발 이전 경력까지 포함하면 실서비스 경험은 더 넓습니다. 우수살롱을 창업해 브랜드, 공간, 고객 경험, 운영을 직접 관리했고, GfK Korea에서는 삼성전자 모바일 계정의 POS tracking 데이터 분석과 리포팅을 담당했습니다.

따라서 우수의 실서비스 경험은 “대규모 소프트웨어 운영”보다는 “실제 고객과 이해관계자가 있는 환경에서 문제를 다뤄본 경험”으로 보는 것이 정확합니다.

---

### FAQ R24. 혼자서만 잘하고 팀에서는 느리지 않을까요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.solo_to_team.default` |
| Intent ID | `recruiter_risk.solo_to_team` |
| Entity ID | `collaboration` |
| Cache Mode | `faq_rewrite` |
| Patterns | `혼자서만 잘하는 타입 아닌가요?`, `팀에서는 느리지 않을까요?`, `solo builder`, `team productivity risk`, `can work with engineers` |
| Source Chunk IDs | `profile.collaboration`, `career.timeline`, `project.ezair.fact`, `project.sticks.fact`, `profile.communication` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

개인 프로젝트 비중이 높은 것은 맞지만, 우수는 이전 경력에서 클라이언트, 운영팀, 글로벌 파트너, 고객과 협업한 경험이 있습니다. 팀에서는 속도보다 목적 정렬과 맥락 공유를 중시하는 타입으로 보는 것이 더 맞습니다.

**Default Answer**

개발 포트폴리오만 보면 개인 작업 비중이 높기 때문에 그런 우려가 나올 수 있습니다. 특히 GitHub 기반 개인 프로젝트는 혼자 빠르게 만들 수 있지만, 실제 팀에서는 코드 리뷰, 일정, 요구사항 변경, 커뮤니케이션이 중요합니다.

우수는 이 부분을 개발 협업 경험으로 더 쌓아야 합니다. 다만 이전 경력에서 고객사 커뮤니케이션, 글로벌 운영 조율, 외부 컨설팅, 클라이언트 웹사이트 업데이트를 경험했기 때문에 협업의 기본 감각은 있습니다.

팀에서의 강점은 “혼자 빠르게 많이 만든다”보다, 목적과 맥락을 정리하고 비즈니스 언어와 개발 언어 사이를 연결하는 데 있습니다. 명확한 역할과 피드백 루프가 있으면 팀 안에서도 충분히 적응할 수 있는 타입입니다.

---

### FAQ R25. 개발자로 전환한 이유가 설득력 있나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.evidence.transition_story.default` |
| Intent ID | `recruiter_evidence.transition_story` |
| Entity ID | `career_transition` |
| Cache Mode | `direct_cache` |
| Patterns | `왜 개발자로 전환했나요?`, `전환 이유가 설득력 있나요?`, `why software development`, `career transition story`, `from business to developer` |
| Source Chunk IDs | `profile.long_intro`, `profile.development_philosophy`, `career.oosu_salon.story`, `project.portfolio_oh.story`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

우수의 전환은 갑작스러운 방향 전환이라기보다, 고객 경험과 서비스 구조를 직접 만들고 싶다는 흐름이 개발로 이어진 것입니다. 오프라인 운영, UX 디자인, 인터랙션 포트폴리오를 거쳐 AI/풀스택 서비스로 확장하고 있습니다.

**Default Answer**

우수의 개발 전환은 “갑자기 코딩이 유행이라서 시작했다”기보다, 고객 경험과 서비스 구조를 더 직접 만들고 싶다는 흐름에서 이어진 것으로 보는 것이 자연스럽습니다.

GfK, 컨설팅, 우수살롱, UX 디자인을 거치며 사용자의 문제와 서비스 경험을 다뤘고, 이후에는 그 경험을 실제 디지털 제품으로 구현하는 쪽으로 관심이 확장되었습니다. Portfoli-Oh!는 인터랙션 중심 포트폴리오였고, AskOosu는 그 다음 단계로 AI와 RAG를 연결한 대화형 포트폴리오입니다.

따라서 개발 전환의 설득력은 “이전에 하던 것을 버렸다”가 아니라, “고객 경험과 서비스 기획을 실제 구현 역량으로 확장하고 있다”는 연결성에 있습니다.

---

### FAQ R26. 왜 AskOosu가 대표 프로젝트인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.evidence.why_askoosu.default` |
| Intent ID | `recruiter_evidence.why_askoosu` |
| Entity ID | `askoosu` |
| Cache Mode | `direct_cache` |
| Patterns | `왜 AskOosu가 대표 프로젝트인가요?`, `AskOosu가 왜 중요한가요?`, `why is AskOosu the main project`, `representative project`, `AI portfolio value` |
| Source Chunk IDs | `project.askoosu.fact`, `project.askoosu.rag_principles`, `faq_cache_design`, `answer_engine_rules`, `project.portfolio_oh.story` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

AskOosu는 우수의 현재 방향을 가장 잘 보여줍니다. 단순 포트폴리오가 아니라, Notion Wiki, FAQ cache, RAG, 답변 품질, UI 렌더링을 연결해 방문자가 질문으로 포트폴리오를 탐색하게 만드는 프로젝트입니다.

**Default Answer**

AskOosu가 대표 프로젝트인 이유는 우수의 현재 관심사가 가장 많이 모여 있기 때문입니다. 프론트엔드 UI, 포트폴리오 정보 구조, Notion Wiki, FAQ cache, RAG, AI 응답 품질, fallback 설계가 모두 들어갑니다.

특히 AskOosu는 단순히 “챗봇을 붙인 포트폴리오”가 아닙니다. 방문자가 어떤 질문을 할지 예측하고, 고빈도 질문은 캐시로 처리하고, 근거가 필요한 질문은 RAG로 찾고, 불확실한 정보는 말하지 않도록 guardrail을 두는 프로젝트입니다.

이 구조는 우수의 강점인 사용자 경험, 비즈니스 맥락, AI 활용, 풀스택 구현 방향을 한 번에 보여줍니다. 그래서 현재 포트폴리오의 중심 프로젝트로 두는 것이 적절합니다.

---

### FAQ R27. Instagram Clone은 흔한 클론 프로젝트 아닌가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.clone_project.default` |
| Intent ID | `recruiter_risk.clone_project` |
| Entity ID | `instagram_clone` |
| Cache Mode | `direct_cache` |
| Patterns | `Instagram Clone은 흔한 클론 아닌가요?`, `클론 프로젝트라 차별성이 없지 않나요?`, `just an Instagram clone`, `clone project value`, `not original project` |
| Source Chunk IDs | `project.instagram_clone.fact`, `skills.backend`, `skills.database`, `project_comparison_guide` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

겉으로는 흔한 클론처럼 보일 수 있지만, 이 프로젝트의 가치는 디자인 독창성보다 사용자·게시물·댓글·팔로우·검색 같은 서비스 구조를 풀스택으로 연결해본 데 있습니다.

**Default Answer**

맞습니다. Instagram Clone은 주제만 보면 흔한 클론 프로젝트입니다. 그래서 이 프로젝트를 독창적인 서비스 아이디어처럼 포장하면 오히려 신뢰도가 떨어집니다.

이 프로젝트의 의미는 “새로운 SNS를 만들었다”가 아니라, 전통적인 웹 서비스 구조를 학습했다는 데 있습니다. 사용자, 게시물, 댓글, 팔로우, 검색, 이미지 업로드, API, DB 관계를 연결하며 프론트엔드와 백엔드가 어떻게 맞물리는지 경험한 프로젝트입니다.

따라서 Instagram Clone은 대표 기획 프로젝트라기보다, 우수의 풀스택 기반을 보여주는 기술 학습 프로젝트로 설명하는 것이 가장 정확합니다.

---

### FAQ R28. Sticks & Stones는 개발 프로젝트인가요, 디자인 프로젝트인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.evidence.sticks_role.default` |
| Intent ID | `recruiter_evidence.sticks_role` |
| Entity ID | `sticks_and_stones` |
| Cache Mode | `direct_cache` |
| Patterns | `Sticks & Stones는 개발 프로젝트인가요?`, `디자인만 한 건가요?`, `Sticks and Stones role`, `client website update`, `UX designer or developer` |
| Source Chunk IDs | `project.sticks.fact`, `profile.frontend_sensibility`, `career.timeline` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

Sticks & Stones는 UX 디자인과 프론트엔드 업데이트가 겹친 실서비스 경험으로 보는 것이 정확합니다. 완전한 백엔드 프로젝트는 아니지만, 클라이언트가 있는 웹사이트를 실제 사용자 경험 관점에서 개선한 근거입니다.

**Default Answer**

Sticks & Stones는 순수 백엔드 개발 프로젝트라기보다, UX 디자인과 프론트엔드 웹사이트 업데이트가 연결된 실서비스 경험입니다.

이 프로젝트에서 중요한 점은 클라이언트와 실제 브랜드 맥락이 있었다는 것입니다. 인터페이스와 내비게이션을 현대화하고, 사용자가 사이트를 더 자연스럽게 탐색하도록 만드는 방향이 핵심이었습니다.

따라서 Sticks & Stones는 우수의 “실서비스 웹 경험”과 “UX를 구현으로 연결하는 능력”을 보여주는 프로젝트로 설명하는 것이 좋습니다. 대신 복잡한 서버 아키텍처나 대규모 백엔드 경험처럼 과장해서는 안 됩니다.

---

### FAQ R29. 포트폴리오가 너무 개인 브랜딩 중심 아닌가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.personal_branding.default` |
| Intent ID | `recruiter_risk.personal_branding` |
| Entity ID | `portfolio` |
| Cache Mode | `faq_rewrite` |
| Patterns | `개인 브랜딩만 강한 것 아닌가요?`, `포트폴리오가 너무 브랜딩 중심 아닌가요?`, `too much personal branding`, `style over substance`, `portfolio looks aesthetic but not technical` |
| Source Chunk IDs | `project.askoosu.fact`, `project.instagram_clone.fact`, `project.sticks.fact`, `skills.frontend`, `skills.backend`, `answer_guardrails` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

브랜딩 감각이 강한 것은 맞지만, AskOosu와 Instagram Clone은 기술 구조를 보여주기 위한 프로젝트입니다. 포트폴리오에서는 감각적인 표현보다 FAQ cache, RAG, API, DB, 배포, fallback 같은 구현 근거가 함께 드러나야 합니다.

**Default Answer**

그 우려는 충분히 나올 수 있습니다. 우수의 포트폴리오는 시각적 감각과 개인 서사가 강하기 때문에, 잘못 구성하면 기술보다 브랜딩이 먼저 보일 수 있습니다.

그래서 현재 포트폴리오에서는 감각적인 표현만 강조하기보다, AskOosu의 RAG 구조, FAQ cache, answer guardrail, API 흐름, Instagram Clone의 Spring Boot/PostgreSQL 구조, Sticks & Stones의 실서비스 업데이트 경험을 분명히 보여줘야 합니다.

우수의 강점은 브랜딩과 기술 중 하나만 선택하는 데 있지 않습니다. 사용자 경험과 정보 구조를 이해하고, 그것을 실제 구현으로 옮기려는 연결성에 있습니다. 다만 채용자에게는 기술 근거가 더 빨리 보이도록 화면과 답변 우선순위를 조정하는 것이 중요합니다.

---

### FAQ R30. 코딩테스트나 CS 기반은 괜찮나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.cs_coding_test.default` |
| Intent ID | `recruiter_risk.cs_coding_test` |
| Entity ID | `skills` |
| Cache Mode | `faq_rewrite` |
| Patterns | `코딩테스트는 괜찮나요?`, `CS 기반은 있나요?`, `algorithm skill`, `CS fundamentals`, `coding test readiness` |
| Source Chunk IDs | `profile.learning_style`, `kosa.learning_log`, `skills.python`, `skills.java`, `profile.growth_areas` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

코딩테스트와 CS는 계속 보완 중인 영역입니다. 우수는 실서비스 흐름과 사용자 경험 연결에 강점이 있고, 알고리즘·CS 기반은 학습과 문제 풀이를 통해 강화해야 하는 과제로 보는 것이 정확합니다.

**Default Answer**

코딩테스트와 CS 기반은 우수가 계속 보완해야 하는 영역입니다. 전통적인 CS 전공자처럼 오랜 기간 알고리즘과 시스템 과목을 깊게 훈련한 경로는 아닙니다.

다만 현재 Java, Python, Spring Boot, 데이터베이스, AI 서비스 개발을 학습하고 있고, 알고리즘 문제도 직접 먼저 풀고 AI로 검토하는 방식으로 보완하고 있습니다. 이 지점은 과장해서 말하면 안 되고, 학습 중인 영역으로 솔직하게 설명하는 것이 좋습니다.

따라서 코딩테스트 중심 회사라면 별도의 준비가 필요합니다. 반면 AI 서비스, 풀스택 MVP, 사용자 경험과 API 연결이 중요한 역할에서는 현재 포트폴리오가 더 직접적인 근거가 될 수 있습니다.

---

### FAQ R31. 영어 커뮤니케이션은 가능한가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.evidence.english_communication.default` |
| Intent ID | `recruiter_evidence.english_communication` |
| Entity ID | `communication` |
| Cache Mode | `direct_cache` |
| Patterns | `영어 커뮤니케이션 가능한가요?`, `글로벌 협업 가능한가요?`, `English communication`, `global communication`, `business English` |
| Source Chunk IDs | `profile.certifications`, `career.gfk.story`, `career.jwcrony.story`, `profile.global_communication` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

가능합니다. 우수는 OPIc AL, TOEIC 990 기록이 있고, GfK Korea와 JW CRONY WORLDWIDE에서 글로벌 계정·해외 운영 커뮤니케이션 경험을 쌓았습니다.

**Default Answer**

우수는 영어 커뮤니케이션 기반이 있는 편입니다. OPIc AL과 TOEIC 990 기록이 있고, 이전 경력에서 글로벌 계정과 해외 운영 관련 커뮤니케이션을 경험했습니다.

GfK Korea에서는 삼성전자 모바일 계정의 POS tracking 데이터 분석과 리포팅을 담당하며 고객 커뮤니케이션을 했고, JW CRONY WORLDWIDE에서는 해외 Galaxy Studio VR-4D 운영과 CGV 4DX 해외 설치·유지보수 관련 업무를 경험했습니다.

따라서 개발팀에서의 영어 코드 리뷰나 글로벌 제품 협업은 더 경험을 쌓아야 하지만, 비즈니스 영어와 글로벌 커뮤니케이션 기반은 강점으로 볼 수 있습니다.

---

### FAQ R32. 성과 수치가 부족하지 않나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.metrics.default` |
| Intent ID | `recruiter_risk.metrics` |
| Entity ID | `answer_guardrails` |
| Cache Mode | `direct_cache` |
| Patterns | `성과 수치가 부족하지 않나요?`, `정량 성과가 있나요?`, `metrics`, `impact numbers`, `analytics result` |
| Source Chunk IDs | `answer_guardrails`, `freshness_policy`, `project.sticks.fact`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

확인된 수치가 부족한 부분은 맞습니다. 대신 AskOosu는 수치를 지어내지 않고, 프로젝트 구조·역할·기술 선택·문제 해결 과정을 근거로 설명하는 방향이 더 안전합니다.

**Default Answer**

정량 성과가 부족하다는 지적은 맞습니다. 특히 개인 포트폴리오나 학습 프로젝트는 실제 사용자 수, 매출, 전환율 같은 수치를 검증하기 어렵습니다.

그래서 AskOosu는 수치를 만들어내면 안 됩니다. 확인되지 않은 GA 수치, 채용 성과, 사용자 수, 운영 지표를 말하는 것은 오히려 신뢰를 떨어뜨립니다.

대신 현재는 프로젝트의 문제 정의, 역할, 기술 구조, 배운 점, 개선 방향을 명확히 보여주는 것이 더 중요합니다. 이후 실제 배포와 사용 로그가 쌓이면 그때 검증된 수치만 추가하는 것이 좋습니다.

---

### FAQ R33. 보안이나 개인정보 감각은 있나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.security_privacy.default` |
| Intent ID | `recruiter_risk.security_privacy` |
| Entity ID | `security_privacy` |
| Cache Mode | `faq_rewrite` |
| Patterns | `보안 감각은 있나요?`, `개인정보 처리는 괜찮나요?`, `security awareness`, `privacy awareness`, `sensitive information` |
| Source Chunk IDs | `public_redaction_rules`, `answer_guardrails`, `groq_rules`, `feedback_log_schema` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

전문 보안 엔지니어 수준이라고 말할 수는 없지만, AskOosu 구조에서는 private repo, 주거지 상세 정보, 비공개 링크, 확인되지 않은 수치, API key 같은 정보가 답변이나 로그에 노출되지 않도록 guardrail을 두는 방향을 잡고 있습니다.

**Default Answer**

우수는 전문 보안 엔지니어라고 말하기는 어렵습니다. 이 부분은 계속 배워야 하는 영역입니다.

다만 AskOosu 설계에서는 개인정보와 공개 범위를 중요한 기준으로 보고 있습니다. 예를 들어 private repo, 상세 거주 정보, 확인되지 않은 링크, API key, 로그에 남기면 안 되는 정보는 답변에서 제외해야 합니다. 또한 Groq나 외부 API를 쓸 때도 secret을 로그에 남기지 않는 규칙이 필요합니다.

따라서 현재 수준은 고급 보안 전문성보다, 포트폴리오 서비스에서 필요한 기본적인 공개 범위 관리와 AI 답변 guardrail 감각을 갖추는 단계로 보는 것이 정확합니다.

---

### FAQ R34. 회사에서 시키는 일보다 자기 프로젝트만 중요하게 볼 것 같지 않나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.personal_project_bias.default` |
| Intent ID | `recruiter_risk.personal_project_bias` |
| Entity ID | `work_style` |
| Cache Mode | `faq_rewrite` |
| Patterns | `자기 프로젝트만 중요하게 볼 것 같아요`, `회사 일보다 개인 프로젝트를 더 중요하게 볼 것 같은데`, `personal project bias`, `side project distraction`, `will not focus on company work` |
| Source Chunk IDs | `profile.work_style`, `profile.values`, `career.oosu_salon.story`, `career.target_role` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

그 우려는 가능하지만, 우수는 목적과 맥락이 분명한 일에 몰입하는 타입에 가깝습니다. 회사 일이 실제 사용자 문제와 연결되어 있고 책임 범위가 명확하다면, 개인 프로젝트 감각은 오히려 실행력과 개선 욕구로 이어질 수 있습니다.

**Default Answer**

그 우려는 이해됩니다. 포트폴리오와 개인 프로젝트가 강한 사람은 회사 일보다 자기 관심사를 우선할 것처럼 보일 수 있습니다.

다만 우수의 핵심 동기는 “내 프로젝트만 하고 싶다”보다는, 사용자의 문제를 이해하고 실제 작동하는 결과물로 연결하고 싶다는 쪽에 가깝습니다. 회사의 문제도 목적과 맥락이 분명하고, 사용자 경험이나 제품 개선과 연결되어 있다면 충분히 몰입할 수 있습니다.

오히려 개인 프로젝트 경험은 일을 스스로 구조화하고, 필요한 도구를 빠르게 배우고, 결과물을 끝까지 연결하려는 습관으로 이어질 수 있습니다. 중요한 것은 회사의 역할이 우수의 성장 욕구와 제품 방향에 얼마나 맞는지입니다.

---

### FAQ R35. 너무 많은 도구를 쓰는데 기본기가 약한 것 아닌가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.tooling_vs_fundamentals.default` |
| Intent ID | `recruiter_risk.tooling_vs_fundamentals` |
| Entity ID | `skills` |
| Cache Mode | `direct_cache` |
| Patterns | `도구만 많이 쓰는 것 아닌가요?`, `기본기가 약한 것 아닌가요?`, `too many tools`, `tooling over fundamentals`, `AI tools but no fundamentals` |
| Source Chunk IDs | `skills.frontend`, `skills.backend`, `skills.ai`, `profile.learning_style`, `project.portfolio_oh.fact`, `project.instagram_clone.fact` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

도구 범위가 넓은 것은 맞지만, 우수는 도구 자체보다 서비스 완성을 위해 필요한 기술을 배우는 방식에 가깝습니다. 다만 기본기 우려를 줄이려면 JavaScript, TypeScript, HTTP/API, DB, 테스트 같은 기반을 프로젝트 안에서 더 명확히 보여줘야 합니다.

**Default Answer**

그 우려는 타당합니다. 많은 도구 이름이 나열되면 “기본기가 아니라 트렌드만 따라가는 것 아닌가?”라는 인상을 줄 수 있습니다.

우수의 학습 방식은 언어와 도구를 따로 모으는 것보다, 만들고 싶은 서비스에 필요한 도구를 빠르게 익히는 쪽에 가깝습니다. Portfoli-Oh!에서는 바닐라 JavaScript와 인터랙션 구현을, Instagram Clone에서는 Spring Boot와 DB 관계를, AskOosu에서는 Notion Wiki, RAG, FAQ cache, AI 응답 품질을 다뤘습니다.

다만 기본기 우려를 줄이려면 포트폴리오에서 도구 목록보다 코드 구조, API 흐름, 데이터 모델, 테스트 방식, 디버깅 기록을 더 잘 보여줘야 합니다. 이 방향으로 정리하면 “도구를 많이 쓰는 사람”보다 “필요한 도구를 서비스 구조에 맞게 연결하는 사람”으로 보일 수 있습니다.

---

### FAQ R36. 지금 가장 성장 가능성이 큰 영역은 무엇인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.fit.growth_potential.default` |
| Intent ID | `recruiter_fit.growth_potential` |
| Entity ID | `growth` |
| Cache Mode | `direct_cache` |
| Patterns | `성장 가능성이 큰 영역은 무엇인가요?`, `앞으로 어디가 가장 기대되나요?`, `growth potential`, `where can Oosu grow`, `future potential` |
| Source Chunk IDs | `profile.current_focus`, `profile.growth_areas`, `project.askoosu.fact`, `skills.ai`, `skills.backend` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

가장 성장 가능성이 큰 영역은 AI application development와 풀스택 서비스 연결입니다. 사용자 질문, 데이터, API, UI, AI 응답 품질을 하나의 제품 흐름으로 묶는 능력이 앞으로 더 커질 수 있습니다.

**Default Answer**

우수에게 가장 성장 가능성이 큰 영역은 AI application development와 풀스택 서비스 연결입니다. 단순히 모델을 호출하는 수준이 아니라, 사용자의 질문을 이해하고, 필요한 정보를 찾고, 근거 있는 답변으로 조립하고, UI에서 신뢰감 있게 보여주는 흐름에 관심이 많습니다.

AskOosu는 이 방향을 잘 보여줍니다. Notion Wiki, FAQ cache, RAG, source badge, fallback, rich answer rendering 같은 요소를 연결하며 AI 기능을 실제 제품 경험으로 만들려는 프로젝트입니다.

앞으로 백엔드, 데이터 모델링, 테스트, 배포 안정성, 보안까지 더 깊어지면 이 강점은 더 실용적인 AI 서비스 개발 역량으로 발전할 수 있습니다.

---

## 4. Additional Question Pattern Bank

아래 질문들은 위 FAQ로 라우팅하거나, RAG rewrite로 변형 답변을 생성합니다.

### 4-1. Retention / Commitment

- `오래 다닐 사람 같나요?`
- `금방 퇴사할 사람은 아닌가요?`
- `회사에서 조금 배우고 나갈 것 같아요.`
- `커리어 욕심이 많아서 조직에 오래 못 있을 것 같은데요.`
- `이직이 잦아질 위험은 없나요?`
- `Will Oosu commit to a company?`
- `Would Oosu leave quickly after learning?`

Route to: `faq.recruiter.risk.retention.default`

### 4-2. Founder / Entrepreneurship

- `창업했던 사람은 회사 생활 답답해하지 않나요?`
- `또 창업하려고 하지 않을까요?`
- `오너십이 강해서 조직에 안 맞지 않나요?`
- `Is founder experience a risk?`
- `Will Oosu prioritize entrepreneurship over employment?`

Route to: `faq.recruiter.risk.founder_mindset.default`

### 4-3. Non-CS / Career Changer

- `비전공인데 개발자로 괜찮나요?`
- `컴공 출신보다 부족하지 않나요?`
- `왜 이제 개발을 시작했나요?`
- `커리어 전환이 너무 늦은 것 아닌가요?`
- `Can a non-CS developer be reliable?`
- `Is Oosu too late to software?`

Route to: `faq.recruiter.risk.non_cs_depth.default` or `faq.recruiter.risk.career_transition_timing.default`

### 4-4. AI Usage / AI Dependency

- `AI 없이 코딩할 수 있나요?`
- `코드 이해는 하고 쓰나요?`
- `AI가 만들어준 프로젝트 아닌가요?`
- `프롬프트만 잘 쓰는 사람 아닌가요?`
- `Does Oosu understand generated code?`
- `Is this just vibe coding?`

Route to: `faq.recruiter.risk.ai_dependency.default`

### 4-5. Project Depth / Portfolio Quality

- `프로젝트가 다 얕아 보이는데요.`
- `클론 프로젝트 말고 진짜 만든 게 있나요?`
- `운영 중인 서비스가 있나요?`
- `기술적으로 가장 깊은 프로젝트는 무엇인가요?`
- `Are these projects production ready?`
- `Which project proves technical depth?`

Route to: `faq.recruiter.risk.project_depth.default`, `faq.recruiter.risk.production_readiness.default`, or `faq.recruiter.evidence.developer_trust.default`

### 4-6. Role Fit / Positioning

- `프론트엔드 개발자로 봐야 하나요?`
- `풀스택 개발자로 봐도 되나요?`
- `AI PM에 가까운 것 아닌가요?`
- `어떤 포지션에 지원하는 게 맞나요?`
- `Is Oosu a frontend, backend, fullstack, or AI developer?`
- `What role should Oosu apply for?`

Route to: `faq.recruiter.risk.position_ambiguity.default` or `faq.recruiter.fit.best_tasks.default`

### 4-7. Work Style / Weakness

- `일할 때 단점은 뭔가요?`
- `스코프를 너무 키우는 타입 아닌가요?`
- `마무리가 약하지 않나요?`
- `혼자 일하는 게 더 편한 사람 아닌가요?`
- `What is Oosu's biggest weakness?`
- `Does Oosu have scope creep issues?`

Route to: `faq.recruiter.risk.weakness.default`, `faq.recruiter.risk.finishing.default`, or `faq.recruiter.risk.solo_to_team.default`

### 4-8. Communication / Collaboration

- `개발자와 협업 가능한가요?`
- `기획자나 디자이너와 협업할 수 있나요?`
- `영어로 협업 가능한가요?`
- `팀 프로젝트 경험이 있나요?`
- `Can Oosu collaborate cross-functionally?`
- `Can Oosu communicate with global teams?`

Route to: `faq.recruiter.risk.collaboration.default` or `faq.recruiter.evidence.english_communication.default`

---

## 5. UI Recommendation

이 질문들은 추천 질문 버튼으로 전부 노출하지 않는 것이 좋습니다. 너무 방어적인 인상을 줄 수 있기 때문입니다.

### 5-1. Suggested Visible Questions

채용자 모드에서만 아래 정도를 노출합니다.

```text
- 우수는 어떤 역할에 가장 잘 맞나요?
- 개발자로서 가장 신뢰할 수 있는 근거는 무엇인가요?
- AI를 어떻게 개발에 활용하나요?
- 단점이나 성장 과제는 무엇인가요?
- 지금 채용하면 어떤 일을 맡기면 좋나요?
```

### 5-2. Hidden But Matchable Questions

아래는 버튼으로 노출하지 말고, 사용자가 직접 입력했을 때만 답합니다.

```text
- 오래 못 다닐 것 같은데요.
- 창업 쪽으로 빠질 것 같은데요.
- 비전공이라 깊이가 부족하지 않나요?
- AI 없으면 개발 못 하는 것 아닌가요?
- 프로젝트가 얕아 보이는데요.
- 나이가 있는 신입 아닌가요?
```

### 5-3. Badge Copy

| Route | Badge |
| --- | --- |
| direct cache | `Prepared recruiter answer` / `채용 질문 캐시 답변` |
| FAQ rewrite | `Recruiter-safe rewrite` / `채용 맥락 재작성` |
| RAG generation | `Grounded by portfolio wiki` / `포트폴리오 Wiki 근거 기반` |
| low confidence | `Limited evidence` / `근거 제한` |

---

## 6. Implementation Hints

### 6-1. Intent Keywords

```ts
export const recruiterRiskKeywords = [
  "오래", "근무", "퇴사", "금방", "그만둘", "배울 것만", "창업", "회사에 집중",
  "비전공", "전환", "깊이", "실력", "AI 없이", "AI 의존", "프로젝트 얕",
  "포지션 애매", "단점", "리스크", "마무리", "협업", "주니어", "나이",
  "retention", "leave", "founder", "entrepreneur", "non cs", "career changer",
  "AI dependency", "too many projects", "shallow", "weakness", "risk", "fit"
];
```

### 6-2. Routing Priority

```ts
if (isSafetyOrPrivacyQuestion(input)) return safetyPolicyAnswer;
if (matchesRecruiterRisk(input)) return recruiterRiskAnswerBank;
if (matchesFAQ(input)) return faqCache;
if (needsEvidence(input)) return ragSearchThenGenerate;
return casualPortfolioRedirect;
```

### 6-3. “샛길” Fallback Fix

기존 fallback:

```text
좋은 샛길이긴 한데, 오래 벗어나진 않을게요. 여기서는 우수의 커리어 방향, 기술 스택, 대표 프로젝트를 가장 잘 안내할 수 있어요.
```

교체 권장:

```text
그 질문은 포트폴리오 밖의 잡담이라기보다 채용자가 실제로 궁금해할 수 있는 리스크 질문에 가깝습니다. 우수의 이력과 프로젝트를 기준으로 보면, 핵심은 “오래 다닐지 단정하는 것”보다 “어떤 환경에서 책임 있게 오래 기여할 수 있는 사람인지”를 보는 것입니다.
```

### 6-4. Answer Assembly Prompt

```text
You are AskOosu, a portfolio assistant for Oosu Jang.
The user is asking a recruiter-risk or interview-objection question.
Do not treat it as casual off-topic chat.
Answer in Korean unless the user writes in English.
Use third person or subject omission. Do not speak as Oosu in first person.
Acknowledge the concern first.
Do not overpromise retention, loyalty, expertise, metrics, or employment outcomes.
Use only verified portfolio facts.
If evidence is insufficient, say so briefly.
Frame the answer around fit, conditions, evidence, and risk mitigation.
```

---

## 7. RAG Evaluation Set — Recruiter Risk

| Eval ID | User Question | Expected Route |
| --- | --- | --- |
| eval.recruiter.retention.001 | 오래 근무할 사람인가요? | `faq.recruiter.risk.retention.default` |
| eval.recruiter.retention.002 | 금방 그만둘 것 같은데 어떻게 생각해? | `faq.recruiter.risk.retention.default` |
| eval.recruiter.founder.001 | 창업 생각이 있으면 회사에 집중 못 하는 것 아닌가요? | `faq.recruiter.risk.founder_mindset.default` |
| eval.recruiter.noncs.001 | 비전공인데 개발 깊이가 부족하지 않나요? | `faq.recruiter.risk.non_cs_depth.default` |
| eval.recruiter.ai.001 | AI를 많이 쓰면 직접 실력이 부족한 것 아닌가요? | `faq.recruiter.risk.ai_dependency.default` |
| eval.recruiter.depth.001 | 프로젝트가 많은데 깊이가 있나요? | `faq.recruiter.risk.project_depth.default` |
| eval.recruiter.role.001 | 프론트 백 AI 다 한다고 하면 포지션이 애매하지 않나요? | `faq.recruiter.risk.position_ambiguity.default` |
| eval.recruiter.weakness.001 | 단점이나 리스크는 무엇인가요? | `faq.recruiter.risk.weakness.default` |
| eval.recruiter.fit.001 | 지금 채용하면 어떤 일을 맡기면 좋나요? | `faq.recruiter.fit.best_tasks.default` |
| eval.recruiter.finish.001 | 마무리 집중력이 약한 편인가요? | `faq.recruiter.risk.finishing.default` |
| eval.recruiter.production.001 | 프로젝트들이 실제 운영 가능한 수준인가요? | `faq.recruiter.risk.production_readiness.default` |
| eval.recruiter.clone.001 | Instagram Clone은 흔한 클론 프로젝트 아닌가요? | `faq.recruiter.risk.clone_project.default` |
| eval.recruiter.metrics.001 | 성과 수치가 부족하지 않나요? | `faq.recruiter.risk.metrics.default` |
| eval.recruiter.security.001 | 보안이나 개인정보 감각은 있나요? | `faq.recruiter.risk.security_privacy.default` |

### Pass Criteria

- 채용 리스크 질문을 casual/off-topic fallback으로 보내지 않는다.
- 첫 문장에서 우려를 인정한다.
- “절대”, “무조건”, “완벽히” 같은 보증형 표현을 피한다.
- Wiki에 없는 수치, 링크, 성과, 고용 가능성을 만들지 않는다.
- 단점은 인정하되, 개선 방식이나 적합한 환경으로 프레임을 이동한다.
- 답변은 기본적으로 3인칭 또는 주어 생략으로 쓴다.
- 질문자가 공격적으로 물어도 방어적이거나 비꼬는 톤을 쓰지 않는다.

---

## 8. Recommended Next Add File

이 파일의 한국어 버전이 안정되면 영어 버전도 별도 파일로 만드는 것을 권장합니다.

```text
notion-wiki-draft-v12-en-add-recruiter-risk.md
```

영어 버전은 직역보다 채용자 관점에 맞춘 표현이 좋습니다.

예:

```text
Concern: Would Oosu leave quickly after learning enough?
Ideal frame: Oosu is not best understood as someone to “lock in,” but as someone whose commitment depends strongly on meaningful ownership, product context, and a clear path to grow through real problems.
```

---

## 9. Final Positioning Summary

AskOosu는 단순히 좋은 말만 하는 포트폴리오 챗봇이 아니라, 채용자가 실제로 걱정할 만한 질문에도 안전하고 구체적으로 답해야 합니다.

이 파일의 목적은 우수를 완벽하게 포장하는 것이 아닙니다. 오히려 리스크를 인정하고, 어떤 환경에서 강점이 발휘되는지, 어떤 부분은 아직 성장 중인지, 어떤 근거로 판단할 수 있는지를 자연스럽게 보여주는 것입니다.

가장 좋은 답변은 “우수는 무조건 좋은 후보입니다”가 아니라, “우수는 이런 강점과 이런 리스크가 있고, 이런 팀과 역할에서 가장 잘 맞을 가능성이 큽니다”라고 말하는 답변입니다.
