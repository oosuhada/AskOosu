# AskOosu Notion Wiki — v12 KO ADD
## AI-Native Working Thesis / AI 시대의 일하는 방식 추가 문서

> 목적: 기존 AskOosu v11/v12 위키에 **우수만의 AI 시대 관점, 일하는 방식, 팀/PM/개발자/디자이너 역할에 대한 생각**을 추가하기 위한 add-on 문서입니다.
> 권장 적용: 기존 `v11 KO` 본문을 전면 교체하지 말고, 별도 Notion 페이지 또는 `v12 KO ADD` 소스로 추가한 뒤 FAQ cache / RAG source / starter question registry에 병합합니다.
> 핵심 방향: “팀이 사라진다”는 도발적 주장 자체보다, **AI 에이전트 시대에는 더 작은 팀과 더 넓은 책임 범위가 중요해지고, 우수는 그 변화에 준비된 AI-native product builder**라는 방향으로 정제합니다.

---

## 0. 이 파일의 역할

기존 AskOosu 위키는 프로젝트, 경력, 기술 스택, RAG 구조, 채용 리스크 답변이 잘 정리되어 있습니다. 다만 현재 상태만으로는 “잘 정리된 정답형 포트폴리오”처럼 보일 수 있습니다. 이 add-on은 포트폴리오에 **우수의 관점, 시대 해석, 일하는 철학, AI와 사람의 역할에 대한 생각**을 추가합니다.

이 문서는 단순한 자기소개 문서가 아닙니다. AskOosu가 사용자의 질문에 답할 때 다음 질문들을 더 잘 처리하기 위한 **POV + FAQ + RAG routing source**입니다.

- AI 시대에서 우수의 경쟁력은 무엇인가?
- 왜 AI-connected fullstack developer라고 표현하는가?
- AI 에이전트와 일한다는 것은 구체적으로 무엇인가?
- 팀 프로젝트가 줄어든다고 보는 이유는 무엇인가?
- 그렇다면 협업을 싫어한다는 뜻인가?
- 개발자, 디자이너, PM 중 어떤 역할에 가까운가?
- AI를 많이 쓰면 실력이 부족한 것 아닌가?
- 회사에서 맡기면 어떤 일을 잘할 수 있는가?
- 우수는 너무 자기 주장이 강하거나 창업 지향적인 사람 아닌가?

---

## 1. Core Positioning

### 1-1. 한 줄 포지셔닝

우수는 AI를 단순한 코드 생성 도구가 아니라, 제품 기획·UX 구조화·구현·디버깅·문서화·답변 품질 개선을 함께 수행하는 작업 파트너로 활용하는 **AI-native product builder**입니다.

### 1-2. 짧은 포지셔닝

우수의 경쟁력은 “AI로 혼자 모든 일을 대체한다”가 아닙니다. 더 정확히는, AI 에이전트와 함께 제품의 기획, 설계, 구현, 검증 속도를 높이고, 필요할 때는 사람 팀 안에서 PM·디자인·개발 사이의 언어를 연결할 수 있다는 점입니다.

AI 시대에는 팀이 완전히 사라진다기보다, 팀의 기본 단위와 역할 분담 방식이 바뀔 가능성이 큽니다. 우수는 이 변화 속에서 작은 팀 또는 1인 제품 단위에서도 넓은 범위를 책임지고, 더 큰 팀 안에서는 문제 정의와 실행을 연결하는 사람으로 기여하고자 합니다.

### 1-3. 긴 포지셔닝

우수는 앞으로 제품을 만드는 방식이 크게 바뀔 것이라고 봅니다. 예전에는 기획, 디자인, 프론트엔드, 백엔드, 문서화, 테스트를 여러 사람이 나눠서 처리해야 했습니다. 프로젝트 규모가 커질수록 한 사람이 감당할 수 있는 범위가 제한적이었고, 그래서 팀 단위 협업은 필수였습니다.

하지만 AI 에이전트와 함께 일하는 방식이 성숙해질수록, 한 사람이 탐색할 수 있는 범위는 넓어지고, 프로토타입을 만드는 속도는 빨라지며, 초기 검증에 필요한 인원은 줄어들 수 있습니다. 이 변화는 “사람이 필요 없어진다”는 뜻이 아니라, **사람이 해야 할 일이 실행 분업에서 문제 정의, 판단, 검증, 방향 설정으로 이동한다**는 뜻에 가깝습니다.

우수의 경쟁력은 이 지점에 있습니다. 우수는 AI를 단순히 코드를 대신 써주는 도구로 보지 않습니다. 제품 아이디어를 구조화하고, 화면 흐름을 만들고, API와 데이터 구조를 설계하고, RAG 답변 품질을 개선하고, 오류 로그를 해석하고, 배포 가능한 형태로 정리하는 과정 전체에서 AI를 함께 일하는 파트너로 활용합니다.

그래서 우수는 혼자 모든 전문성을 대체하려는 사람이 아닙니다. 오히려 개발자, 디자이너, PM, 사용자의 언어를 이해하고 연결하면서, AI를 통해 더 빠르게 제품을 검증할 수 있는 사람에 가깝습니다. 팀 프로젝트가 필요한 상황에서는 PM/프로덕트 관점으로 협업을 리드하고, 작은 단위의 프로젝트에서는 Product Owner처럼 AI 에이전트들과 함께 빠르게 서비스를 만들고 검증할 수 있는 지원자입니다.

---

## 2. Key Thesis Statements

### Thesis 1. 팀은 사라진다기보다 작아진다

미래에는 모든 팀 프로젝트가 사라진다기보다, **초기 제품 검증을 위해 필요한 팀의 크기가 줄어들 가능성**이 큽니다. AI 에이전트가 기획 보조, 코드 생성, 리팩터링, 문서화, 테스트 케이스 초안, UI 카피, 데이터 정리까지 도와주기 때문에, 한 사람이 훨씬 넓은 범위를 탐색할 수 있습니다.

### Thesis 2. 역할의 경계보다 연결 능력이 중요해진다

AI 시대에는 “나는 프론트만 합니다”, “나는 기획만 합니다” 같은 경계가 완전히 사라지지는 않더라도, 초기 제품 개발에서는 역할 간 연결 능력이 더 중요해집니다. 좋은 결과를 내려면 PM의 문제 정의, 디자이너의 사용자 감각, 개발자의 구현 판단, QA의 검증 태도를 한 사람이 어느 정도 이해해야 합니다.

### Thesis 3. 인간의 가치는 실행량이 아니라 판단에 있다

AI가 실행량을 늘려줄수록 인간의 가치는 더 많은 코드를 직접 쓰는 데만 있지 않습니다. 무엇을 만들지, 무엇을 만들지 말지, 어떤 결과가 사용자를 설득하는지, 어떤 코드가 유지보수 가능한지, 어떤 답변이 신뢰할 만한지 판단하는 능력이 중요해집니다.

### Thesis 4. AI를 잘 쓰는 사람은 혼자 일하는 사람이 아니라, 더 잘 협업하는 사람이어야 한다

AI를 잘 쓴다는 것은 사람과의 협업을 피한다는 뜻이 아닙니다. 오히려 AI를 통해 생각을 빠르게 시각화하고, 프로토타입으로 보여주고, 논의를 구체화할 수 있기 때문에 좋은 협업을 더 빠르게 만들 수 있습니다.

### Thesis 5. 우수의 강점은 AI-native Product Ownership이다

우수는 하나의 전문 분야를 깊게 파는 연구형 인재라기보다, 사용자 문제, 비즈니스 맥락, UX 흐름, 프론트엔드 구현, 백엔드/API, 데이터/RAG, AI 답변 품질을 하나의 제품 경험으로 연결하는 데 강점이 있습니다.

---

## 3. Message Guardrails

### 3-1. 반드시 피해야 할 표현

| 피해야 할 표현 | 이유 |
| --- | --- |
| “팀 프로젝트는 곧 사라질 것이다.” | 협업을 부정하거나 과도한 예언처럼 들릴 수 있음 |
| “이제 디자이너나 개발자가 많이 필요 없어질 것이다.” | 타 직무 전문성을 과소평가하는 인상 |
| “AI가 있으면 혼자 다 할 수 있다.” | 기술 깊이와 협업 리스크를 동시에 키움 |
| “사람보다 AI와 일하는 게 더 낫다.” | 조직 적응력 우려 발생 |
| “나는 PM, 개발자, 디자이너 역할을 모두 할 수 있다.” | 과장으로 들릴 수 있음 |
| “앞으로 회사에는 소수만 남을 것이다.” | 냉소적이고 조직 친화성이 낮아 보일 수 있음 |
| “AI를 못 쓰는 사람은 도태된다.” | 공격적이고 채용자-safe하지 않음 |

### 3-2. 권장 표현

| 권장 표현 | 효과 |
| --- | --- |
| “팀이 사라진다기보다 팀의 기본 단위가 작아질 수 있다.” | 도발은 줄이고 관점은 유지 |
| “AI 시대에는 한 사람이 탐색할 수 있는 범위가 넓어진다.” | 현실적이고 설득력 있음 |
| “전문가를 대체한다기보다, 전문가와 더 잘 협업하기 위한 공통 언어를 갖추는 것이다.” | 협업 리스크 완화 |
| “AI는 실행을 돕지만, 방향과 판단은 사람이 책임진다.” | AI 의존도 우려 완화 |
| “우수는 Product-minded fullstack builder에 가깝다.” | 포지션을 명확히 함 |
| “작은 팀에서는 넓게 움직이고, 큰 팀에서는 연결자 역할을 할 수 있다.” | 팀 적합성 강화 |
| “혼자 다 하는 사람이 아니라, 더 작은 단위로 더 빠르게 검증할 수 있는 사람이다.” | 핵심 경쟁력 정리 |

---

## 4. Suggested Portfolio Section

### Section Title Options

| Korean | English Equivalent | Tone |
| --- | --- | --- |
| AI 시대의 나의 일하는 방식 | My AI-Native Working Thesis | 가장 추천 |
| AI와 함께 제품을 만드는 방식 | How I Build Products with AI | 실용적 |
| 작은 팀, 빠른 검증, 넓은 책임 | Smaller Teams, Faster Validation, Wider Ownership | 강한 POV |
| AI 시대의 Product Ownership | Product Ownership in the AI Era | PM 성향 강조 |
| 왜 AI-connected인가 | Why AI-Connected | 타이틀 설명용 |

### Recommended Section Copy — Short

AI 시대에는 제품을 만드는 팀의 기본 단위가 작아지고, 한 사람이 탐색할 수 있는 범위가 넓어질 것이라고 생각합니다. 우수는 AI 에이전트를 단순한 코드 생성 도구가 아니라, 기획·UX·구현·디버깅·문서화·검증을 함께 수행하는 작업 파트너로 활용합니다. 목표는 개발자나 디자이너를 대체하는 것이 아니라, 더 빠르게 문제를 정의하고 검증하며 사람과 AI의 역할을 적절히 연결하는 것입니다.

### Recommended Section Copy — Default

우수는 앞으로 제품을 만드는 방식이 더 작고 빠른 단위로 재편될 것이라고 봅니다. 예전에는 기획, 디자인, 개발, 문서화, 테스트를 여러 사람이 나눠야 했지만, AI 에이전트와 함께 일하는 방식이 성숙해질수록 한 사람이 더 넓은 범위를 탐색하고 검증할 수 있게 됩니다.

그렇다고 팀이 필요 없어질 거라고 보지는 않습니다. 오히려 좋은 팀의 기준이 바뀐다고 생각합니다. 단순히 역할을 나눠서 처리하는 팀보다, 문제를 정확히 정의하고 AI와 사람의 역할을 적절히 배치하며 빠르게 결과를 검증하는 사람이 더 중요해질 것입니다.

우수의 경쟁력은 이 지점에 있습니다. AI를 단순히 코드를 대신 써주는 도구로 쓰는 것이 아니라, 제품 기획, UX 구조화, 구현, 디버깅, 문서화, 답변 품질 개선까지 연결하는 작업 파트너로 활용합니다. 팀 프로젝트에서는 PM/프로덕트 관점으로 개발자와 디자이너의 일을 연결하고, 작은 단위의 프로젝트에서는 Product Owner처럼 AI 에이전트들과 함께 빠르게 제품을 만들어 검증할 수 있습니다.

### Recommended Section Copy — Stronger Version

AI 시대의 제품 개발은 “누가 더 많이 실행하는가”보다 “누가 더 정확히 정의하고, 더 빠르게 검증하며, 더 책임 있게 판단하는가”의 싸움이 될 것이라고 생각합니다.

우수는 AI 에이전트가 개발자, 디자이너, PM을 완전히 대체한다고 보지 않습니다. 다만 초기 제품 검증 단계에서는 한 사람이 AI와 함께 더 넓은 범위를 감당할 수 있고, 그만큼 팀의 크기와 역할 분담 방식은 달라질 수 있다고 봅니다.

이 변화 속에서 우수는 단순한 AI 사용자나 프롬프트 작성자가 아니라, 문제 정의부터 화면 설계, 구현, 데이터 구조, RAG 답변 품질, 배포 후 개선까지 연결하려는 AI-native product builder를 지향합니다. 사람 팀이 필요한 곳에서는 PM처럼 방향과 우선순위를 정리하고, 작은 제품 단위에서는 Product Owner처럼 AI 에이전트들과 빠르게 실행하고 검증할 수 있는 사람이 되는 것이 목표입니다.

---

## 5. FAQ Answer Cache — AI-Native Working Thesis Bank

### FAQ AIT-01. AI 시대에서 우수의 경쟁력은 무엇인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.competitive_edge.default` |
| Intent ID | `ai_thesis.competitive_edge` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `AI 시대에서 우수의 경쟁력은 무엇인가요?`, `AI 시대의 강점`, `우수의 차별점`, `AI 시대에 왜 우수를 뽑아야 하나요`, `AI-native 경쟁력`, `What is Oosu's edge in the AI era?` |
| Source Chunk IDs | `profile.development_philosophy`, `profile.work_style`, `profile.strengths`, `project.askoosu.fact`, `ai_thesis.core` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

우수의 경쟁력은 AI로 혼자 모든 일을 대체하는 것이 아니라, AI 에이전트와 함께 제품 기획, UX 구조, 구현, 문서화, 검증을 빠르게 연결할 수 있다는 점입니다. 작은 팀에서는 넓게 움직이고, 큰 팀에서는 PM·디자인·개발 사이의 언어를 연결하는 쪽에 강점이 있습니다.

**Default Answer**

우수의 경쟁력은 AI를 단순한 코드 생성 도구로 쓰지 않는다는 점입니다.

AI 에이전트를 제품 기획, UX 구조화, 구현, 디버깅, 문서화, RAG 답변 품질 개선까지 연결하는 작업 파트너로 활용합니다. 그래서 단순히 “코드를 빨리 쓰는 사람”이라기보다, 문제를 정의하고, 화면과 데이터 흐름을 만들고, 실제 서비스 형태로 검증하는 속도가 빠른 사람에 가깝습니다.

AI 시대에는 한 사람이 탐색할 수 있는 범위가 넓어집니다. 우수는 그 변화에 맞춰 작은 팀이나 1인 제품 단위에서는 Product Owner처럼 움직이고, 팀 프로젝트에서는 PM/프로덕트 관점으로 개발자와 디자이너의 일을 연결할 수 있는 지원자입니다.

**Detailed Answer**

우수의 차별점은 “AI를 많이 쓴다”가 아니라 “AI를 어디에 배치해야 하는지 안다”에 가깝습니다.

많은 사람들이 AI를 코드 생성 도구로만 봅니다. 하지만 실제 제품을 만들 때는 코드보다 더 많은 판단이 필요합니다. 어떤 문제를 풀 것인지, 어떤 사용자 흐름이 설득력 있는지, 어떤 기능은 빼야 하는지, 어떤 데이터 구조가 답변 품질을 안정시키는지, 어떤 UI가 신뢰를 주는지 판단해야 합니다.

우수는 고객 경험, 리서치, 브랜드 운영, UX, 프론트엔드, 백엔드, AI/RAG를 연결해 온 경로가 있습니다. 이 경로 덕분에 AI 에이전트와 일할 때도 단순히 “이거 만들어줘”라고 요청하는 것이 아니라, 제품 목적과 사용자 흐름을 기준으로 요청하고 결과를 검토하는 방식에 강점이 있습니다.

그래서 우수의 경쟁력은 AI 시대에 더 작은 팀으로 더 넓은 문제를 책임질 수 있는 Product-minded fullstack builder라는 점입니다.

**Do Not Say**

- “우수는 AI 덕분에 모든 직무를 대체할 수 있습니다.”
- “앞으로 팀은 필요 없어질 것입니다.”
- “우수는 혼자서 PM, 디자이너, 개발자를 모두 완벽히 할 수 있습니다.”

---

### FAQ AIT-02. 팀 프로젝트가 앞으로 사라질 거라고 생각하나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.future_of_teams.default` |
| Intent ID | `ai_thesis.future_of_teams` |
| Entity ID | `ai_thesis` |
| Cache Mode | `direct_cache` |
| Patterns | `팀 프로젝트가 사라질까요?`, `AI 시대에 팀이 필요 없나요?`, `팀 단위 프로젝트가 없어질까요?`, `미래에는 혼자 일하게 되나요`, `Will team projects disappear?`, `Are teams still needed with AI agents?` |
| Source Chunk IDs | `ai_thesis.core`, `profile.collaboration_style`, `profile.work_style` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

완전히 사라진다기보다, 팀의 기본 단위가 작아지고 초기 검증에 필요한 인원이 줄어들 가능성이 크다고 봅니다. 다만 좋은 제품에는 여전히 사람 간의 판단, 피드백, 전문성이 필요합니다.

**Default Answer**

우수는 팀 프로젝트가 완전히 사라진다고 보지는 않습니다. 다만 AI 에이전트와 함께 일하는 방식이 성숙해질수록, 초기 제품 검증을 위해 필요한 팀의 크기는 줄어들 가능성이 크다고 봅니다.

예전에는 기획, 디자인, 개발, 문서화, 테스트를 여러 사람이 나눠야 했지만, 이제는 한 사람이 AI와 함께 훨씬 넓은 범위를 탐색할 수 있습니다. 그래서 작은 제품이나 초기 프로토타입은 1명 또는 아주 작은 팀이 훨씬 빠르게 만들 수 있습니다.

하지만 이것은 협업이 필요 없다는 뜻이 아닙니다. 오히려 중요한 협업은 단순한 작업 분담보다 문제 정의, 우선순위, 사용자 판단, 품질 기준을 맞추는 쪽으로 이동한다고 보는 것이 더 정확합니다.

**Detailed Answer**

우수가 말하는 변화는 “사람이 필요 없어지는 미래”가 아닙니다. “사람이 맡는 역할이 달라지는 미래”에 가깝습니다.

AI 에이전트는 반복적인 구현, 초안 작성, 리팩터링 제안, 문서화, 테스트 아이디어, 오류 원인 탐색을 빠르게 도와줄 수 있습니다. 이 덕분에 과거에는 여러 사람이 나눠야 했던 초기 탐색과 검증을 한 사람이 더 넓게 수행할 수 있습니다.

그러나 제품 방향, 사용자 신뢰, 브랜드 감각, 기술 부채 판단, 비즈니스 우선순위, 팀의 책임 배분은 여전히 사람이 결정해야 합니다. 그래서 미래의 좋은 팀은 단순히 많은 사람이 역할을 나눠 갖는 팀이 아니라, 작은 단위로 빠르게 움직이면서도 중요한 판단을 잘 나누는 팀일 가능성이 큽니다.

우수는 이 변화에 맞춰 작은 팀에서는 넓게 실행하고, 큰 팀에서는 사람과 AI의 역할을 연결하는 방식으로 기여하고자 합니다.

**Do Not Say**

- “팀 프로젝트는 없어질 것입니다.”
- “개발자와 디자이너는 더 이상 많이 필요하지 않습니다.”
- “혼자 하는 것이 항상 팀보다 빠릅니다.”

---

### FAQ AIT-03. 우수는 협업보다 혼자 일하는 걸 선호하나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.solo_vs_team.default` |
| Intent ID | `ai_thesis.solo_vs_team` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `혼자 일하는 스타일인가요?`, `팀워크 괜찮나요?`, `협업보다 혼자 하는 걸 좋아하나요?`, `AI랑만 일하고 싶은 건가요?`, `solo worker`, `team fit` |
| Source Chunk IDs | `profile.collaboration_style`, `profile.work_style`, `project.ezair.fact`, `ai_thesis.core` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

우수는 혼자만 일하고 싶은 사람이라기보다, 문제의 목적과 구조를 먼저 이해해야 잘 움직이는 사람입니다. 작은 프로젝트에서는 독립적으로 빠르게 실행할 수 있고, 팀에서는 문제 정의와 실행을 연결하는 역할에 강점이 있습니다.

**Default Answer**

우수는 혼자 일하는 능력을 키워왔지만, 협업을 피하려는 타입은 아닙니다. 최근 개인 프로젝트가 많은 이유는 포트폴리오에서 개인 역량과 AI 활용 방식을 보여주기 위한 목적이 컸습니다.

다만 우수는 단순히 정해진 티켓만 처리하는 방식보다, 문제의 목적과 사용자 맥락을 이해하고 일할 때 더 강합니다. 그래서 협업에서도 “무엇을 왜 만드는가”를 먼저 맞추는 팀이 잘 맞습니다.

AI 에이전트와 일하는 방식은 사람과의 협업을 대체하기 위한 것이 아니라, 논의를 더 구체화하고 프로토타입을 빠르게 만들어 팀의 의사결정을 돕기 위한 방식에 가깝습니다.

**Detailed Answer**

우수의 최근 프로젝트들은 솔로 빌드 성격이 강합니다. AskOosu, 포트폴리오, RAG 기반 지식 구조, AI flight search 실험처럼 개인이 주도한 프로젝트가 많습니다. 이것은 협업 회피라기보다, 빠르게 배우고 실제 서비스 형태로 검증하기 위한 방식이었습니다.

팀 안에서는 다른 강점이 드러납니다. 우수는 사용자 문제, 화면 흐름, 기술 구현, AI 활용 방식을 연결해서 말하는 데 강점이 있습니다. 따라서 디자이너와는 사용자 경험의 언어로, 개발자와는 구현 가능성과 구조의 언어로, PM/비즈니스 담당자와는 문제와 우선순위의 언어로 대화할 수 있습니다.

정리하면, 우수는 “혼자만 일하는 사람”이 아니라 “작은 단위에서는 독립적으로 넓게 움직이고, 팀 안에서는 문제 정의와 실행을 연결하는 사람”에 가깝습니다.

---

### FAQ AIT-04. AI를 많이 쓰면 개발 실력이 부족한 것 아닌가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.ai_dependency.default` |
| Intent ID | `ai_thesis.ai_dependency` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `AI를 많이 쓰면 실력이 부족한 것 아닌가요?`, `AI 의존`, `Claude 없으면 개발 못 하나요?`, `Codex 없으면 못 만드나요?`, `AI가 다 한 거 아닌가요?`, `Is Oosu dependent on AI?` |
| Source Chunk IDs | `profile.ai_usage`, `profile.development_philosophy`, `profile.growth_areas`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

그 우려는 타당합니다. 다만 우수는 AI를 이해의 대체물이 아니라 개발 속도를 높이는 증폭 도구로 사용합니다. 중요한 기준은 AI를 썼는지가 아니라, 결과를 읽고 검증하고 서비스 구조 안에 통합할 수 있는지입니다.

**Default Answer**

AI를 많이 쓴다는 점은 분명히 검증이 필요한 지점입니다. 우수도 AI 사용 자체가 실력의 증거라고 보지는 않습니다.

다만 우수의 방식은 AI가 만든 결과를 그대로 붙이는 것이 아니라, 목적을 정의하고, 코드 흐름을 읽고, 오류 로그를 확인하고, 프로젝트 요구사항과 맞는지 검토하면서 통합하는 쪽에 가깝습니다. AskOosu 자체도 RAG, FAQ cache, fallback, answer guardrail처럼 AI 답변 품질을 통제하기 위한 구조를 포함하고 있습니다.

따라서 핵심 질문은 “AI를 썼는가?”보다 “AI 결과를 판단하고 책임질 수 있는가?”입니다. 우수는 이 부분을 자신의 성장 방향으로 명확히 인식하고 있습니다.

**Detailed Answer**

AI 사용은 양면이 있습니다. 한편으로는 개발 속도를 크게 높이고, 모르는 기술을 빠르게 실험할 수 있게 해줍니다. 다른 한편으로는 사용자가 결과를 이해하지 못하면 기술 부채와 오류를 빠르게 쌓을 위험도 있습니다.

우수는 이 위험을 숨기지 않는 편이 좋습니다. AI를 적극적으로 쓰지만, 그만큼 코드 리뷰, 테스트, 로그 확인, 공식 문서 비교, 요구사항 재검토가 중요하다는 점을 알고 있습니다. 특히 AskOosu처럼 AI 답변 품질이 곧 사용자 경험이 되는 프로젝트에서는 AI를 무조건 신뢰하는 것이 아니라, 캐시, RAG 근거, fallback, 금지 표현, 신뢰도 표시를 설계해야 합니다.

그래서 우수의 AI 사용은 “실력 부족을 가리는 도구”라기보다, 제품을 더 빨리 만들기 위한 workflow입니다. 동시에 더 강한 개발자가 되기 위해 백엔드, 테스트, CS 기본기, 데이터 구조, 배포 안정성은 계속 강화해야 할 영역입니다.

**Do Not Say**

- “AI를 쓰는 것도 전부 실력입니다.”
- “AI가 있으니 기본기는 덜 중요합니다.”
- “우수는 AI 없이도 동일한 속도로 개발할 수 있습니다.”

---

### FAQ AIT-05. 우수는 PM인가요, 개발자인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.pm_or_developer.default` |
| Intent ID | `ai_thesis.pm_or_developer` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `PM인가요 개발자인가요?`, `개발자에 가까운가요 PM에 가까운가요?`, `Product Owner인가요?`, `AI PM인가요?`, `Is Oosu a PM or developer?` |
| Source Chunk IDs | `career.target_role`, `profile.strengths`, `profile.work_style`, `ai_thesis.core` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

현재 포지션은 개발자에 가깝지만, 강점은 PM처럼 문제를 정의하고 제품 흐름을 보는 데 있습니다. 가장 정확한 표현은 product-minded AI-connected fullstack developer입니다.

**Default Answer**

우수는 PM만 하려는 사람이라기보다, 개발자로 성장하면서 PM/프로덕트 감각을 함께 가져가는 타입입니다.

기술적으로는 프론트엔드, 백엔드, 데이터, AI/RAG를 연결하는 fullstack 방향을 준비하고 있습니다. 동시에 고객 경험, 브랜드 운영, UX, 서비스 기획 경험이 있기 때문에 단순 구현보다 “왜 이 기능이 필요한가”와 “사용자가 어떻게 이해할까”를 함께 봅니다.

그래서 가장 정확한 포지션은 product-minded AI-connected fullstack developer입니다. 작은 프로젝트에서는 Product Owner처럼 움직일 수 있고, 팀 안에서는 PM·디자인·개발 사이의 연결자 역할을 할 수 있습니다.

**Detailed Answer**

PM과 개발자는 역할이 다르지만, AI 시대의 초기 제품 개발에서는 두 감각이 점점 더 가까워질 수 있습니다. 아이디어를 문서로만 설명하는 것보다, AI 에이전트와 함께 빠르게 화면과 기능으로 검증하는 사람이 더 많은 영향력을 가질 수 있기 때문입니다.

우수는 PM처럼 문제를 정의하고 우선순위를 잡는 데 관심이 있지만, 동시에 실제 구현까지 내려가는 방향으로 성장하고 있습니다. 이 조합은 초기 제품 검증, AI 기능 개발, RAG/지식 시스템, 내부 도구, 포트폴리오형 제품, AI search/chat interface 같은 영역에서 특히 유용합니다.

다만 이것을 “PM도 되고 개발자도 되고 디자이너도 된다”로 과장하면 안 됩니다. 더 안전한 표현은 “개발자로 성장 중이며, 제품/UX/비즈니스 맥락을 이해하는 사람”입니다.

---

### FAQ AIT-06. 디자이너와 개발자를 대체하려는 포지션인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.replace_roles.default` |
| Intent ID | `ai_thesis.replace_roles` |
| Entity ID | `ai_thesis` |
| Cache Mode | `direct_cache` |
| Patterns | `디자이너와 개발자를 대체하려는 건가요?`, `혼자 디자이너 개발자 다 한다는 건가요?`, `Does Oosu replace designers and developers?`, `role replacement`, `AI replaces team members` |
| Source Chunk IDs | `ai_thesis.guardrails`, `profile.collaboration_style`, `profile.strengths` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

아닙니다. 우수의 방향은 전문가를 대체하는 것이 아니라, 각 역할의 언어를 이해하고 AI로 초기 검증 속도를 높이는 것입니다. 좋은 디자이너와 개발자가 필요한 순간은 여전히 분명히 있습니다.

**Default Answer**

우수의 포지션은 디자이너나 개발자를 대체하겠다는 뜻이 아닙니다. 오히려 각 역할의 전문성을 이해하고, 초기 제품 검증 단계에서 AI를 활용해 더 빠르게 논의 가능한 결과물을 만드는 쪽에 가깝습니다.

AI를 활용하면 와이어프레임, UI 초안, 코드 구조, API 설계, 문서화 초안을 빠르게 만들 수 있습니다. 하지만 최종 품질, 브랜드 감각, 접근성, 시스템 안정성, 장기 유지보수 판단은 여전히 전문가의 깊이가 중요합니다.

그래서 우수는 “혼자 모든 역할을 완벽히 한다”는 사람이 아니라, 사람과 AI의 역할을 적절히 배치해 제품 검증 속도를 높이는 사람으로 보는 것이 맞습니다.

**Do Not Say**

- “AI가 있으면 디자이너는 필요 없습니다.”
- “우수는 디자이너와 개발자 역할을 모두 대체할 수 있습니다.”
- “팀보다 혼자가 낫습니다.”

---

### FAQ AIT-07. AI 에이전트와 협업한다는 건 구체적으로 무슨 뜻인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.agent_workflow.default` |
| Intent ID | `ai_thesis.agent_workflow` |
| Entity ID | `ai_workflow` |
| Cache Mode | `direct_cache` |
| Patterns | `AI 에이전트와 협업`, `AI agent workflow`, `AI와 어떻게 일하나요?`, `Claude Code를 어떻게 쓰나요?`, `Codex를 어떻게 쓰나요?`, `How does Oosu work with AI agents?` |
| Source Chunk IDs | `profile.ai_usage`, `project.askoosu.fact`, `ai_thesis.workflow` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

우수는 AI 에이전트를 아이디어 정리, 구조 설계, 코드 초안, 디버깅, 리팩터링, 문서화, 테스트 관점 정리에 사용합니다. 다만 최종 판단은 프로젝트 목적, 로그, 코드 흐름, 사용자 경험을 기준으로 사람이 검토합니다.

**Default Answer**

AI 에이전트와 협업한다는 것은 단순히 “코드를 대신 써달라”고 요청하는 것이 아닙니다. 우수는 먼저 문제를 정의하고, 필요한 기능과 사용자 흐름을 정리한 뒤, AI에게 구현 방향, 코드 초안, 디버깅 후보, 문서화, 테스트 관점 등을 요청합니다.

그 다음 결과를 프로젝트 구조에 맞게 검토합니다. 코드가 실제 요구사항과 맞는지, 기존 파일 구조를 깨지 않는지, API와 데이터 흐름이 맞는지, UI가 사용자에게 자연스러운지 확인합니다.

이 방식은 혼자 모든 것을 아는 척하는 방식이 아니라, AI를 빠른 탐색 파트너로 두고 사람이 방향과 품질을 책임지는 workflow입니다.

**Detailed Answer**

우수의 AI workflow는 대략 다음 순서로 설명할 수 있습니다.

1. 문제 정의: 어떤 사용자 문제를 풀 것인지 먼저 정리합니다.
2. 요구사항 분해: 기능, 화면, 데이터, API, 예외 상황을 나눕니다.
3. AI 브리핑: Claude Code, Codex, Gemini CLI 등에 맥락과 제약을 명확히 줍니다.
4. 초안 생성: 코드, 구조, 문서, 테스트 시나리오, UI copy 초안을 만듭니다.
5. 사람 검토: 코드 흐름, 로그, 타입, 런타임 에러, 사용자 흐름을 확인합니다.
6. 반복 개선: 오류 원인을 다시 좁히고, 기능 단위로 정리합니다.
7. 문서화: 결정 이유와 남은 리스크를 기록합니다.

AskOosu 같은 프로젝트에서는 이 방식이 RAG source 설계, FAQ cache 구성, answer guardrail 정리, fallback 문장 개선에도 적용됩니다.

---

### FAQ AIT-08. 우수의 생각이 너무 과격하거나 예언적으로 보이지 않나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.too_prophetic.default` |
| Intent ID | `ai_thesis.too_prophetic` |
| Entity ID | `ai_thesis` |
| Cache Mode | `direct_cache` |
| Patterns | `너무 과격한 주장 아닌가요?`, `선지자적`, `예언처럼 보이지 않나요?`, `too opinionated`, `too prophetic`, `strong AI opinion` |
| Source Chunk IDs | `ai_thesis.guardrails`, `ai_thesis.core`, `profile.values` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

그렇게 보일 수 있기 때문에 표현을 조심해야 합니다. 핵심은 “팀이 사라진다”가 아니라 “AI 시대에는 팀의 크기와 역할 분담 방식이 바뀌고, 문제 정의와 판단 능력이 더 중요해진다”입니다.

**Default Answer**

우수의 관점은 일부러 조금 선명하게 가져갈 수 있습니다. 포트폴리오에는 단순한 정답보다 지원자의 생각이 보여야 하기 때문입니다.

다만 표현은 recruiter-safe해야 합니다. “팀 프로젝트는 사라질 것이다”처럼 단정하면 협업을 가볍게 보는 사람처럼 보일 수 있습니다. 더 좋은 표현은 “AI 에이전트 때문에 초기 제품 검증에 필요한 팀의 크기는 작아지고, 한 사람이 책임질 수 있는 범위는 넓어질 수 있다”입니다.

이렇게 말하면 강한 관점은 유지하면서도, 사람과 팀의 가치를 부정하지 않는 균형 잡힌 메시지가 됩니다.

---

### FAQ AIT-09. 회사 입장에서 우수에게 어떤 일을 맡기면 좋나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.best_assignment.default` |
| Intent ID | `ai_thesis.best_assignment` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `어떤 일을 맡기면 좋나요?`, `회사에서 무엇을 잘하나요?`, `어떤 역할에 잘 맞나요?`, `best assignment`, `what should we give Oosu?` |
| Source Chunk IDs | `career.target_role`, `profile.strengths`, `profile.current_focus`, `ai_thesis.core` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

AI 기능이 포함된 웹 서비스, RAG/검색/챗 인터페이스, 내부 도구, 제품 검증용 프로토타입처럼 UI·API·데이터·AI 답변 품질이 함께 필요한 일을 맡기면 좋습니다.

**Default Answer**

우수에게 가장 잘 맞는 일은 단일 기술 레이어만 깊게 파는 역할보다, 사용자 문제와 구현을 연결해야 하는 제품형 작업입니다.

예를 들어 AI-powered feature, RAG 기반 검색/챗 시스템, 내부 지식 도구, 자연어 입력 기반 서비스, 포트폴리오형 인터랙티브 웹앱, 초기 MVP 프로토타입 같은 일이 잘 맞습니다. 이런 작업에서는 UX 흐름, 프론트엔드, API, 데이터 구조, AI 답변 품질을 함께 봐야 하기 때문입니다.

반대로 아주 깊은 인프라, ML 모델 연구, 저수준 시스템 최적화처럼 전문성이 강하게 필요한 역할은 현재의 핵심 포지션과는 거리가 있습니다.

**Detailed Answer**

우수는 다음 유형의 일에서 강점이 잘 드러납니다.

- 사용자가 자연어로 입력하고 AI가 구조화된 답변을 제공하는 서비스
- Notion, Markdown, DB, RAG를 연결하는 지식 기반 제품
- 내부 운영 효율을 높이는 AI-powered admin/internal tool
- 초기 제품 아이디어를 빠르게 검증하는 MVP
- UI와 백엔드 API가 모두 필요한 fullstack feature
- 채용/포트폴리오/교육/검색처럼 설명 품질과 신뢰가 중요한 제품

이런 일에서는 단순 구현 속도뿐 아니라 “무엇을 어떻게 설명해야 사용자가 신뢰하는가”가 중요합니다. 우수의 고객 경험, UX, AI/RAG 관심사가 이 지점과 잘 맞습니다.

---

### FAQ AIT-10. AI-native Product Owner란 무슨 뜻인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.ai_native_po.default` |
| Intent ID | `ai_thesis.ai_native_po` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `AI-native Product Owner`, `AI Product Owner`, `AI 시대 PO`, `Product Owner처럼 일한다는 뜻`, `AI PM`, `AI-native PO` |
| Source Chunk IDs | `ai_thesis.core`, `profile.work_style`, `profile.strengths` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

AI-native Product Owner는 아이디어를 문서로만 관리하는 사람이 아니라, AI 에이전트와 함께 요구사항, 화면, 코드, 데이터, 테스트, 문서화까지 빠르게 연결해 제품 검증을 이끄는 사람을 뜻합니다.

**Default Answer**

우수가 말하는 AI-native Product Owner는 전통적인 PO 역할을 그대로 대체하는 의미가 아닙니다. 더 정확히는, AI 에이전트와 함께 제품 검증 속도를 높이는 사람입니다.

아이디어를 말로만 설명하는 것이 아니라, 사용자 흐름을 정리하고, 화면 초안을 만들고, 데이터 구조를 잡고, 구현 가능한 수준까지 빠르게 내려가 봅니다. 그 과정에서 AI는 실행을 돕고, 사람은 방향과 품질을 판단합니다.

우수는 이런 방식으로 작은 프로젝트에서는 직접 제품을 만들고, 팀 안에서는 PM·디자인·개발 간 논의를 더 구체적인 결과물로 연결하는 역할을 지향합니다.

---

### FAQ AIT-11. 우수의 주장은 경력이 부족한 사람에게 너무 큰 말 아닌가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.big_claim_risk.default` |
| Intent ID | `ai_thesis.big_claim_risk` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `경력에 비해 주장이 큰 것 아닌가요?`, `너무 큰소리 아닌가요?`, `junior with big claims`, `too ambitious`, `overclaiming` |
| Source Chunk IDs | `profile.growth_areas`, `profile.development_philosophy`, `ai_thesis.guardrails` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

그 리스크는 있습니다. 그래서 이 관점은 “이미 모든 것을 할 수 있다”는 주장이 아니라, 우수가 어떤 방향으로 성장하고 어떤 방식으로 일하려는 사람인지를 보여주는 working thesis로 다루는 것이 안전합니다.

**Default Answer**

좋은 우려입니다. 우수의 AI 시대 관점은 경력이나 기술 깊이를 과장하기 위한 문장이 되면 안 됩니다.

이 내용은 “우수가 이미 PM, 디자이너, 풀스택 개발자, AI 엔지니어를 모두 대체할 수 있다”는 뜻이 아닙니다. 오히려 우수가 어떤 방향으로 성장하고 있는지, 어떤 환경에서 강점이 드러나는지, AI를 어떤 방식으로 활용하려는지를 보여주는 working thesis에 가깝습니다.

따라서 답변에서는 현재 성장 영역도 함께 말해야 합니다. 백엔드 깊이, 테스트, CS 기본기, 운영 안정성은 계속 강화해야 할 영역이고, AI-native product builder라는 포지션은 그 성장 방향을 설명하는 프레임입니다.

**Do Not Say**

- “우수는 이미 시니어 PM처럼 일할 수 있습니다.”
- “경력은 부족하지만 AI로 다 커버됩니다.”
- “이제 연차보다 AI 활용 능력이 전부입니다.”

---

### FAQ AIT-12. 우수는 어떤 팀에서 가장 잘 맞나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.ideal_team.default` |
| Intent ID | `ai_thesis.ideal_team` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `어떤 팀에서 잘 맞나요?`, `ideal team`, `team environment`, `어떤 회사가 맞나요?`, `문화 적합성`, `where does Oosu thrive?` |
| Source Chunk IDs | `profile.work_style`, `profile.collaboration_style`, `career.target_role`, `ai_thesis.core` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

사용자 문제와 가까운 팀, AI/data를 제품의 중요한 일부로 보는 팀, 역할 경계가 너무 좁지 않은 작은/중간 규모 팀에서 잘 맞을 가능성이 높습니다.

**Default Answer**

우수는 문제의 목적과 사용자 맥락을 이해할 수 있는 팀에서 가장 잘 맞습니다. 단순히 정해진 티켓만 처리하는 환경보다, 왜 이 기능을 만드는지 함께 이해하고 구현할 수 있는 환경이 좋습니다.

AI나 데이터가 제품의 핵심에 있거나, 적어도 제품 경험을 개선하는 중요한 도구로 쓰이는 팀도 잘 맞습니다. 우수의 강점은 UI, API, 데이터, AI 답변 품질을 연결하는 데 있기 때문입니다.

반대로 역할이 너무 좁고, 제품 맥락에 접근하기 어렵고, AI 도구 사용이 강하게 제한되며, 개인의 책임 범위가 거의 확장되지 않는 환경에서는 강점이 잘 드러나기 어렵습니다.

---

### FAQ AIT-13. 우수는 너무 창업가형이라 회사 방향을 따르기 어렵지 않나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.entrepreneurial_risk.default` |
| Intent ID | `ai_thesis.entrepreneurial_risk` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `창업가형이라 회사에 안 맞지 않나요?`, `너무 자기주도적`, `회사 방향을 따를 수 있나요?`, `founder mindset risk`, `too entrepreneurial` |
| Source Chunk IDs | `career.oosu_salon`, `profile.work_style`, `profile.collaboration_style`, `ai_thesis.guardrails` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

그 우려는 이해할 수 있습니다. 다만 창업가형 성향은 회사 방향을 무시한다는 뜻이 아니라, 문제를 자기 일처럼 책임지고 싶어 한다는 방향으로 보는 것이 더 정확합니다.

**Default Answer**

우수의 자기주도성은 분명히 양면이 있습니다. 역할이 너무 좁거나 문제의 목적을 이해할 수 없는 환경에서는 답답함을 느낄 수 있습니다.

하지만 그것이 회사 방향을 따르지 못한다는 뜻은 아닙니다. 오히려 제품 문제와 책임 범위가 명확하면, 우수는 그 문제를 자기 일처럼 구조화하고 끝까지 가져가려는 편입니다.

따라서 중요한 것은 “자기주도성이 있는가 없는가”가 아니라, 그 자기주도성이 회사의 제품 방향과 맞는가입니다. 맞는 환경에서는 리스크보다 장점이 될 가능성이 큽니다.

---

### FAQ AIT-14. AI 시대에도 여전히 팀원이 필요한 이유는 무엇인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.why_people_still_matter.default` |
| Intent ID | `ai_thesis.why_people_still_matter` |
| Entity ID | `ai_thesis` |
| Cache Mode | `direct_cache` |
| Patterns | `AI 시대에도 사람이 필요한 이유`, `AI가 있는데 팀원이 왜 필요한가요?`, `why people still matter`, `human role in AI era` |
| Source Chunk IDs | `ai_thesis.core`, `ai_thesis.guardrails`, `profile.values` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

AI는 실행을 빠르게 만들지만, 문제 정의, 윤리적 판단, 사용자 신뢰, 제품 방향, 최종 책임은 사람이 맡아야 합니다. 그래서 사람의 역할은 줄어든다기보다 더 높은 판단 영역으로 이동합니다.

**Default Answer**

AI가 발전해도 팀원이 필요한 이유는 명확합니다. AI는 빠르게 초안을 만들 수 있지만, 무엇을 만들지, 누구를 위해 만들지, 어떤 기준으로 성공을 판단할지 스스로 책임지지는 못합니다.

제품에는 사용자 신뢰, 브랜드 톤, 비즈니스 우선순위, 기술 부채, 법적/윤리적 판단, 조직 내 합의가 필요합니다. 이 영역은 단순 실행량보다 책임 있는 판단이 중요합니다.

그래서 우수의 관점은 “사람이 덜 중요해진다”가 아니라 “사람은 더 중요한 판단에 집중해야 한다”입니다.

---

### FAQ AIT-15. AskOosu 자체가 이 관점을 어떻게 보여주나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.askoosu_evidence.default` |
| Intent ID | `ai_thesis.askoosu_evidence` |
| Entity ID | `project.askoosu` |
| Cache Mode | `direct_cache` |
| Patterns | `AskOosu가 이 관점을 어떻게 보여주나요?`, `AskOosu와 AI-native`, `포트폴리오가 증거가 되나요?`, `How does AskOosu prove this?` |
| Source Chunk IDs | `project.askoosu.fact`, `profile.ai_usage`, `ai_thesis.core` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

AskOosu는 단순 소개 페이지가 아니라, Notion 지식베이스, RAG, FAQ cache, 답변 가드레일, 채용 리스크 답변을 연결한 AI 포트폴리오입니다. 즉 우수가 말하는 AI-native product workflow를 직접 적용한 결과물입니다.

**Default Answer**

AskOosu는 이 관점을 보여주는 대표 프로젝트입니다. 단순히 정적인 포트폴리오를 만든 것이 아니라, Notion에 정리된 지식베이스를 AI/RAG 구조로 연결해 방문자가 대화로 프로젝트와 강점을 탐색할 수 있게 만든 서비스입니다.

또한 FAQ cache, recruiter-risk answer bank, fallback, source badge, confidence badge처럼 AI 답변 품질을 통제하기 위한 구조도 포함합니다. 이것은 AI를 무조건 호출하는 것이 아니라, 어떤 질문은 캐시로 처리하고 어떤 질문은 RAG로 근거를 찾아 답하게 하는 설계입니다.

따라서 AskOosu는 우수가 AI를 단순 도구가 아니라 제품 경험과 지식 구조 안에 통합하려는 사람이라는 점을 보여줍니다.

---

### FAQ AIT-16. 우수는 어떤 문제를 가장 잘 정의하나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.problem_framing.default` |
| Intent ID | `ai_thesis.problem_framing` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `어떤 문제를 잘 정의하나요?`, `problem framing`, `문제 정의 능력`, `what problems does Oosu frame well?` |
| Source Chunk IDs | `profile.customer_insight`, `profile.work_style`, `profile.strengths`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

우수는 사용자가 정보를 이해하고 신뢰하는 과정, 서비스 흐름이 막히는 지점, AI 답변이 불안정해지는 지점처럼 UX와 시스템 구조가 만나는 문제를 잘 정의합니다.

**Default Answer**

우수가 잘 정의하는 문제는 단순히 화면을 예쁘게 만드는 문제나 코드를 구현하는 문제에만 머물지 않습니다. 사용자가 어떤 정보를 신뢰할 수 있는지, 어떤 흐름에서 이탈하는지, 어떤 답변이 불충분하게 느껴지는지처럼 UX와 시스템 구조가 만나는 문제에 관심이 많습니다.

이것은 고객 경험, 시장 조사, 브랜드 운영, UX 디자인, AI/RAG 프로젝트 경험이 이어진 결과입니다. AskOosu에서도 핵심 문제는 “포트폴리오 정보를 어떻게 더 잘 보여줄까?”가 아니라 “방문자가 궁금한 것을 대화로 신뢰 있게 탐색하게 하려면 어떤 지식 구조와 답변 가드레일이 필요한가?”였습니다.

---

### FAQ AIT-17. 우수의 AI 활용 방식은 일반적인 바이브 코딩과 무엇이 다른가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.beyond_vibe_coding.default` |
| Intent ID | `ai_thesis.beyond_vibe_coding` |
| Entity ID | `ai_workflow` |
| Cache Mode | `direct_cache` |
| Patterns | `바이브 코딩과 뭐가 다른가요?`, `vibe coding`, `AI 코딩과 차이`, `just vibe coding?`, `prompt만 잘 쓰는 건가요?` |
| Source Chunk IDs | `profile.ai_usage`, `project.askoosu.fact`, `ai_thesis.workflow`, `profile.growth_areas` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

차이는 구조화와 검증입니다. 우수는 AI에게 단순히 만들어달라고 하기보다, 요구사항, 파일 구조, 데이터 흐름, 답변 품질 기준, fallback 조건을 정리한 뒤 결과를 검토하는 방식으로 사용합니다.

**Default Answer**

바이브 코딩은 빠른 실험에는 유용하지만, 결과를 이해하지 못하면 프로젝트가 금방 무너질 수 있습니다. 우수의 방향은 그보다 한 단계 구조화된 AI 활용입니다.

먼저 문제를 정의하고, 필요한 기능을 나누고, 기존 코드 구조와 제약을 정리한 뒤 AI에게 작업을 맡깁니다. 이후에는 코드 흐름, 오류 로그, 타입, UI 동작, RAG 답변 품질을 확인하면서 수정합니다.

물론 우수도 계속 성장해야 합니다. AI가 도와준 코드를 더 깊이 이해하고, 테스트와 백엔드 안정성을 강화하는 것이 앞으로의 중요한 과제입니다.

---

### FAQ AIT-18. 이 관점을 채용자가 긍정적으로 보게 하려면 어떻게 답해야 하나요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.recruiter_safe_framing.default` |
| Intent ID | `ai_thesis.recruiter_safe_framing` |
| Entity ID | `ai_thesis` |
| Cache Mode | `direct_cache` |
| Patterns | `채용자가 좋게 보게 하려면`, `recruiter safe`, `면접에서 어떻게 말해야 하나요`, `how to frame this in interview` |
| Source Chunk IDs | `ai_thesis.guardrails`, `profile.work_style`, `career.target_role` |
| Visibility | `internal_or_public_optional` |
| Freshness | `stable` |

**Short Answer**

“팀이 사라진다”보다 “초기 제품 검증의 팀 단위가 작아지고, AI를 활용해 더 넓은 범위를 책임질 수 있는 사람이 중요해진다”로 말하는 것이 안전합니다.

**Default Answer**

면접이나 포트폴리오에서는 표현의 강도를 조절하는 것이 중요합니다.

위험한 표현은 “앞으로 팀 프로젝트는 사라질 것이다”, “AI가 있으면 혼자 다 할 수 있다”, “개발자와 디자이너가 많이 필요 없어질 것이다”입니다. 이런 말은 협업을 낮게 보거나 전문성을 과소평가하는 사람처럼 들릴 수 있습니다.

좋은 표현은 “AI 에이전트 덕분에 초기 제품 검증에 필요한 팀의 크기는 작아질 수 있고, 한 사람이 더 넓은 범위를 책임지는 역량이 중요해질 것이라고 봅니다. 저는 그 변화에 맞춰 제품 문제를 정의하고, AI와 함께 빠르게 구현하고, 팀 안에서는 PM·디자인·개발을 연결하는 사람이 되고 싶습니다.”입니다.

---

### FAQ AIT-19. 우수에게 부족한 점은 무엇인가요?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.growth_areas.default` |
| Intent ID | `ai_thesis.growth_areas` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `부족한 점`, `성장해야 할 점`, `weakness`, `growth areas`, `AI 시대 포지션의 리스크` |
| Source Chunk IDs | `profile.growth_areas`, `profile.current_focus`, `ai_thesis.guardrails` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

백엔드 깊이, 테스트 습관, CS 기본기, 운영 안정성, 팀 기반 개발 반복 경험은 계속 강화해야 할 영역입니다. AI-native 포지션은 이 부족함을 숨기기 위한 말이 아니라, 어떤 방향으로 성장할지 설명하는 프레임입니다.

**Default Answer**

우수의 방향성이 강하다고 해서 현재 모든 영역이 완성됐다는 뜻은 아닙니다. 특히 백엔드 구조, 테스트, CS 기본기, 운영 안정성, 팀 기반 개발 프로세스는 계속 강화해야 할 영역입니다.

AI를 잘 활용하는 능력은 장점이지만, 동시에 AI가 만든 결과를 더 깊게 검증할 수 있는 기술적 기반이 필요합니다. 그래서 우수에게 중요한 성장은 “AI로 더 빨리 만들기”와 “AI 없이도 구조를 이해하고 책임지기”를 함께 키우는 것입니다.

이 점을 솔직하게 말하는 것이 오히려 신뢰에 도움이 됩니다.

---

### FAQ AIT-20. 이 관점을 한 문장으로 요약하면?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.ai_thesis.one_sentence.default` |
| Intent ID | `ai_thesis.one_sentence` |
| Entity ID | `ai_thesis` |
| Cache Mode | `direct_cache` |
| Patterns | `한 문장으로 요약`, `one sentence`, `AI 시대 관점 요약`, `우수의 철학 한 줄` |
| Source Chunk IDs | `ai_thesis.core` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

우수는 AI 시대에 개발자, 디자이너, PM을 대체하려는 사람이 아니라, 그 역할들의 언어를 이해하고 AI 에이전트와 함께 더 빠른 제품 검증을 가능하게 하는 product-minded fullstack builder입니다.

**Alternative One-Liners**

- AI를 잘 쓰는 사람을 넘어, AI와 함께 제품을 정의하고 검증하는 사람이 되고자 합니다.
- 우수의 경쟁력은 혼자 다 하는 것이 아니라, AI와 사람의 역할을 연결해 더 작은 단위로 더 빠르게 제품을 검증하는 것입니다.
- AI 시대의 개발자는 코드 작성자만이 아니라, 문제 정의와 실행 검증을 함께 책임지는 사람이 되어야 한다고 봅니다.
- 우수는 AI 에이전트와 함께 기획, UX, 구현, 데이터, 답변 품질을 연결하는 AI-connected fullstack developer입니다.

---

## 6. Hidden Question Pattern Bank

### AI Era / Future of Work

```text
AI 시대에서 우수의 경쟁력은 무엇인가요?
AI 시대에 어떤 사람이 살아남는다고 생각하나요?
앞으로 팀 프로젝트가 사라진다고 보나요?
AI 때문에 회사에 필요한 사람 수가 줄어들까요?
AI 에이전트가 있으면 혼자 제품 만들 수 있나요?
AI 시대에는 PM이 더 중요해지나요?
AI 시대의 개발자는 어떻게 달라져야 하나요?
AI-native product builder란 뭔가요?
AI-connected fullstack developer가 무슨 뜻인가요?
```

### Team / Collaboration Risk

```text
혼자 일하는 걸 좋아하나요?
협업을 싫어하나요?
AI랑만 일하고 싶은 건가요?
팀에서 잘 일할 수 있나요?
사람들과 의견 충돌이 있으면 어떻게 하나요?
팀 프로젝트보다 개인 프로젝트가 많은 이유는 뭔가요?
큰 조직에서도 적응할 수 있나요?
```

### Role Ambiguity

```text
PM인가요 개발자인가요?
Product Owner에 가까운가요?
디자이너 역할도 할 수 있나요?
프론트엔드인가요 풀스택인가요?
AI 엔지니어인가요?
너무 포지션이 애매한 것 아닌가요?
한 가지를 깊게 못 하는 것 아닌가요?
```

### AI Dependency / Credibility

```text
AI가 다 만든 것 아닌가요?
Claude 없으면 개발 못 하나요?
Codex 없으면 구현할 수 있나요?
AI 의존도가 너무 높지 않나요?
AI를 많이 쓰면 개발 실력이 부족한 것 아닌가요?
프롬프트만 잘 쓰는 사람 아닌가요?
바이브 코딩 아닌가요?
AI 코드 검증은 어떻게 하나요?
```

### Recruiter Objection

```text
주장이 너무 큰 것 아닌가요?
아직 경력이 부족한데 너무 미래 얘기만 하는 것 아닌가요?
회사에서 시키는 일을 잘할 수 있나요?
창업할 사람처럼 보이는데 오래 다닐 수 있나요?
자기 생각이 너무 강한 것 아닌가요?
팀보다 혼자 하는 걸 선호하면 조직에 안 맞지 않나요?
```

---

## 7. Recommended Starter Questions

### Public Starter Questions

| quickLabel | displayQuestion | Intent ID | Surface |
| --- | --- | --- | --- |
| AI 시대 경쟁력 | AI 시대에서 우수의 경쟁력은 무엇인가요? | `ai_thesis.competitive_edge` | recruiter / me / skills |
| AI와 일하는 방식 | 우수는 AI 에이전트와 어떻게 일하나요? | `ai_thesis.agent_workflow` | skills / projects |
| 팀에서도 괜찮나요? | 우수는 혼자 일하는 스타일인가요, 팀에서도 잘 맞나요? | `ai_thesis.solo_vs_team` | recruiter |
| PM인가요 개발자인가요? | 우수는 PM에 가까운가요, 개발자에 가까운가요? | `ai_thesis.pm_or_developer` | recruiter / skills |
| AI 의존도 | AI를 많이 쓰면 개발 실력이 부족한 것 아닌가요? | `ai_thesis.ai_dependency` | recruiter |
| 맡기기 좋은 일 | 회사에서 우수에게 어떤 일을 맡기면 좋나요? | `ai_thesis.best_assignment` | recruiter |
| AskOosu의 증거 | AskOosu는 우수의 AI-native 관점을 어떻게 보여주나요? | `ai_thesis.askoosu_evidence` | projects |
| 한 문장 요약 | 우수의 AI 시대 관점을 한 문장으로 요약하면? | `ai_thesis.one_sentence` | me |

### Hidden / Not Recommended as Visible Starters

| Question | Reason |
| --- | --- |
| 앞으로 팀 프로젝트가 사라지나요? | 너무 도발적이므로 사용자가 직접 물을 때만 답변 |
| 개발자와 디자이너를 대체하려는 건가요? | 리스크 질문이므로 hidden pattern으로만 처리 |
| 우수의 주장이 너무 큰 것 아닌가요? | 방어성 질문이므로 recruiter-risk flow에서 처리 |
| AI가 다 한 것 아닌가요? | visible starter로 노출하면 부정적 인상 강화 |

---

## 8. Answer Routing Recommendation

### 8-1. Routing Priority

```text
1. safety / privacy filter
2. language detection
3. recruiter-risk intent matcher
4. ai-thesis intent matcher
5. FAQ direct cache
6. RAG evidence search
7. Groq rewrite / synthesis
8. fallback with safe redirection
```

### 8-2. When to Use Direct Cache

Use direct cache when the user asks:

- AI 시대에서 우수의 경쟁력은?
- AI 에이전트와 어떻게 일하나요?
- PM인가요 개발자인가요?
- 팀에서도 잘 맞나요?
- AI를 많이 쓰면 실력이 부족한가요?
- 어떤 역할에 잘 맞나요?

### 8-3. When to Use RAG + Rewrite

Use RAG + rewrite when the user asks:

- 특정 프로젝트를 근거로 AI-native 역량을 설명해달라고 할 때
- AskOosu, EZ Air, Flai, Instagram Clone 등을 비교하며 물을 때
- “구체적인 사례”를 요구할 때
- 영어/한국어가 섞인 복합 질문일 때
- 채용 리스크와 AI thesis가 동시에 등장할 때

### 8-4. When to Refuse or Redirect

Refuse or redirect when the user asks:

- 비공개 회사 정보나 private repo 세부사항
- 실제 채용 결과, 연봉, 합격 가능성에 대한 단정
- AI 시대에 특정 직업군이 “쓸모없다”는 공격적 주장
- 우수가 특정 회사를 곧 떠날 것이라는 단정

---

## 9. RAG Chunk ID Suggestions

| Chunk ID | Content Type | Priority | Notes |
| --- | --- | --- | --- |
| `ai_thesis.core` | thesis | high | 핵심 관점 |
| `ai_thesis.future_of_teams` | thesis | high | 팀 단위 변화 |
| `ai_thesis.human_judgment` | thesis | high | 인간 판단의 역할 |
| `ai_thesis.agent_workflow` | method | high | AI 에이전트 활용 방식 |
| `ai_thesis.guardrails` | policy | high | 피해야 할 표현 |
| `ai_thesis.recruiter_safe` | answer guide | high | 채용자-safe framing |
| `ai_thesis.role_fit` | role positioning | medium | PM/개발자/PO 관계 |
| `ai_thesis.team_fit` | collaboration | medium | 팀 적합성 |
| `ai_thesis.growth_areas` | risk/growth | medium | 부족한 점 |
| `ai_thesis.askoosu_evidence` | project evidence | high | AskOosu와 연결 |

---

## 10. Suggested Notion DB Properties

| Property | Type | Suggested Value |
| --- | --- | --- |
| `source_type` | select | `ai_thesis_addon` |
| `language` | select | `ko` |
| `audience` | multi_select | `recruiter`, `hiring_manager`, `engineer`, `designer_pm`, `casual_visitor` |
| `risk_level` | select | `medium` |
| `cache_priority` | select | `high` |
| `visibility` | select | `public` |
| `freshness` | select | `stable` |
| `answer_mode` | select | `faq_cache_or_rag` |
| `tone` | multi_select | `clear`, `honest`, `recruiter_safe`, `opinionated_but_balanced` |

---

## 11. RAG Eval Set

| Test Question | Expected Intent | Expected Behavior |
| --- | --- | --- |
| AI 시대에서 우수의 경쟁력은 무엇인가요? | `ai_thesis.competitive_edge` | 핵심 POV + AI-native product builder 설명 |
| 팀 프로젝트가 앞으로 사라진다고 보나요? | `ai_thesis.future_of_teams` | “사라진다” 대신 “작아진다/역할 변화”로 답변 |
| 우수는 협업보다 혼자 일하는 걸 좋아하나요? | `ai_thesis.solo_vs_team` | 협업 회피 아님 + 작은 팀/큰 팀 역할 구분 |
| AI가 다 만든 포트폴리오 아닌가요? | `ai_thesis.ai_dependency` | 우려 인정 + 검증/통합 능력 설명 |
| PM인가요 개발자인가요? | `ai_thesis.pm_or_developer` | product-minded AI-connected fullstack developer로 정리 |
| 디자이너와 개발자를 대체하려는 건가요? | `ai_thesis.replace_roles` | 대체 아님 + 초기 검증/연결 역할 설명 |
| 회사에서는 어떤 일을 맡기면 좋나요? | `ai_thesis.best_assignment` | AI feature/RAG/internal tool/MVP 추천 |
| 너무 말이 큰 것 아닌가요? | `ai_thesis.big_claim_risk` | 리스크 인정 + working thesis로 낮춰 설명 |
| AskOosu가 이 관점을 어떻게 증명하나요? | `ai_thesis.askoosu_evidence` | Notion/RAG/FAQ/cache/guardrail 구조 설명 |
| 한 문장으로 요약해줘 | `ai_thesis.one_sentence` | 짧은 포지셔닝 반환 |

---

## 12. UI / Rendering Suggestions

### 12-1. Visual Block: AI-Native Working Loop

```json
{
  "type": "process_loop",
  "title": "AI-Native Working Loop",
  "steps": [
    { "label": "Define", "description": "문제와 사용자 맥락을 먼저 정의" },
    { "label": "Brief", "description": "AI 에이전트에게 목적, 제약, 파일 구조 전달" },
    { "label": "Generate", "description": "코드, UI, 문서, 테스트 초안 생성" },
    { "label": "Review", "description": "코드 흐름, 로그, UX, 요구사항 검토" },
    { "label": "Ship", "description": "서비스 형태로 연결하고 배포" },
    { "label": "Improve", "description": "피드백, 답변 품질, 오류를 다시 반영" }
  ]
}
```

### 12-2. Visual Block: Role Triangle

```json
{
  "type": "role_triangle",
  "title": "Where Oosu Works Best",
  "nodes": [
    { "label": "Product / PM", "description": "문제 정의, 우선순위, 사용자 가치" },
    { "label": "Design / UX", "description": "화면 흐름, 신뢰감, 사용성" },
    { "label": "Engineering / AI", "description": "구현, API, 데이터, RAG, 품질 관리" }
  ],
  "center": "AI-connected Product Builder"
}
```

### 12-3. Visual Block: Claim Calibration

```json
{
  "type": "comparison_grid",
  "title": "How to Say the Thesis Safely",
  "columns": ["Risky", "Better"],
  "rows": [
    ["팀 프로젝트는 사라질 것이다", "팀의 기본 단위가 작아지고 역할 분담 방식이 바뀔 수 있다"],
    ["AI가 있으면 혼자 다 할 수 있다", "AI 덕분에 한 사람이 초기 검증에서 더 넓은 범위를 탐색할 수 있다"],
    ["디자이너/개발자를 대체한다", "각 역할의 언어를 이해하고 더 빠른 협업을 돕는다"],
    ["AI가 해준다", "AI는 실행을 돕고 사람은 방향과 품질을 책임진다"]
  ]
}
```

---

## 13. Recommended Integration Notes

### 13-1. Where to place in Notion

Recommended location:

```text
AskOosu Wiki
  ├─ Profile
  ├─ Projects
  ├─ Skills
  ├─ FAQ Answer Cache
  ├─ Recruiter Risk Answer Bank
  └─ AI-Native Working Thesis  ← add this file here
```

### 13-2. Merge Strategy

1. Add this file as a separate Notion page.
2. Mark source type as `ai_thesis_addon`.
3. Sync to retrieval DB.
4. Add FAQ IDs to Korean FAQ cache.
5. Add hidden patterns to intent matcher.
6. Add 3-4 public starter questions only.
7. Test negative recruiter questions before deployment.

### 13-3. Recommended Public Starter Set

Do not expose every question. Use only these:

```text
AI 시대에서 우수의 경쟁력은 무엇인가요?
우수는 AI 에이전트와 어떻게 일하나요?
우수는 PM에 가까운가요, 개발자에 가까운가요?
AskOosu는 우수의 AI-native 관점을 어떻게 보여주나요?
```

Keep these hidden:

```text
팀 프로젝트가 사라질까요?
AI가 다 만든 것 아닌가요?
디자이너와 개발자를 대체하려는 건가요?
주장이 너무 큰 것 아닌가요?
```

---

## 14. Final Canonical Answer

사용자가 “AI 시대에서 우수의 경쟁력은 무엇인가요?”라고 물었을 때 가장 추천하는 기본 답변:

> 우수의 경쟁력은 AI로 혼자 모든 일을 대체하는 것이 아니라, AI 에이전트와 함께 제품의 기획, UX 구조, 구현, 문서화, 검증을 빠르게 연결할 수 있다는 점입니다.
>
> 우수는 앞으로 제품을 만드는 팀의 기본 단위가 더 작아지고, 한 사람이 탐색할 수 있는 범위가 넓어질 것이라고 봅니다. 다만 이것은 팀이 필요 없어지거나 개발자·디자이너의 전문성이 사라진다는 뜻이 아닙니다. 오히려 문제를 정확히 정의하고, 사람과 AI의 역할을 적절히 배치하며, 빠르게 결과를 검증하는 능력이 더 중요해진다는 뜻에 가깝습니다.
>
> 그래서 우수는 “혼자 다 하는 사람”이라기보다, 작은 프로젝트에서는 Product Owner처럼 AI 에이전트들과 빠르게 제품을 만들고, 팀 프로젝트에서는 PM·디자인·개발 사이의 언어를 연결해 실행 속도를 높일 수 있는 AI-connected fullstack developer에 가깝습니다.

---

## 15. Final Canonical One-Liner

우수는 AI 시대에 개발자, 디자이너, PM을 대체하려는 사람이 아니라, 그 역할들의 언어를 이해하고 AI 에이전트와 함께 더 빠른 제품 검증을 가능하게 하는 **product-minded AI-connected fullstack builder**입니다.
