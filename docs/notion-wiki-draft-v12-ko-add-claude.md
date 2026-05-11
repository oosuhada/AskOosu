# AskOosu Notion Wiki — v12 KO (Add)

> v11 KO의 Add-on 파일입니다. FAQ Answer Cache / Model Answer Bank를 채용담당자 대응 "진짜 질문들"로 확장합니다.
> 이 섹션의 답변은 자동 생성이 아닌 curated model answer입니다. 솔직하고 근거 있고, 채용자가 읽었을 때 신뢰할 수 있는 답변을 목표로 합니다.
> `data/faq-answers.ko.ts`에 통합하고, `data/question-surfaces.ko.ts`에 해당 서피스를 등록하세요.

---

## 버전 메모

- `v12-add`: Recruiter Defense FAQ Bank 추가 — 장기 근속 리스크, 커리어 전환 깊이 우려, AI 의존도, 협업, 포지션 모호성, 채용 추천 등 15개 이상의 curated 모범 답안. Question Surface Registry에 `recruiter_defense` 서피스 추가.

---

## 이 섹션의 설계 원칙

이 답변들은 일반 포트폴리오 FAQ와 다른 세 가지 규칙을 따릅니다.

1. **인정 먼저, 방어 나중.** "그 걱정은 틀렸어요"가 아니라 "그렇게 볼 수 있는 지점도 있어요"로 시작합니다. 신뢰는 여기서 생깁니다.
2. **약속이 아닌 조건을 말합니다.** "절대 안 떠납니다" 대신 "이런 환경에서는 오래 기여할 가능성이 높습니다"가 더 진짜 같고 더 설득력 있습니다.
3. **평가 기준을 옮깁니다.** "이 사람이 오래 있을 사람인가?"에서 "이 사람이 어떤 환경에서 오래 기여하는 사람인가?"로 프레임을 바꿉니다.

---

## 14. FAQ Answer Cache — v12 확장 (Recruiter Defense Bank)

---

### FAQ R-01. 오래 근무할 사람인가, 아니면 배울 것만 얻고 떠날 것인가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.retention_risk.default` |
| Intent ID | `recruiter.retention_risk` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `오래 근무할 사람인가`, `금방 그만둘 것 같은데`, `이직 리스크`, `배울 것만 배우고 나갈 것 같은데`, `장기 근속`, `얼마나 오래 다닐 것 같은가` |
| Source Chunk IDs | `profile.work_style`, `profile.strengths`, `career.timeline`, `profile.growth_areas` |
| Visibility | `public` |

**Short Answer**

좋은 우려예요. 좁고 반복적인 역할에는 오래 있기 어려운 타입입니다. 하지만 책임과 성장 방향이 맞는 역할이라면, 오래 기여할 가능성이 훨씬 높아집니다.

**Default Answer**

좋은 우려예요. 그렇게 볼 수 있는 지점도 있다고 생각해요.

우수는 단순 반복 업무에 오래 머무르는 타입이라기보다는, 배운 것을 실제 제품이나 시스템으로 빠르게 연결하고 싶어 하는 사람에 가까워요. 그래서 역할이 너무 좁거나 성장/책임 범위가 막혀 있으면 금방 답답함을 느낄 가능성은 있습니다.

다만 그게 곧 "배울 것만 얻고 떠난다"는 뜻은 아니에요. 포트폴리오에서 보이는 강점은 UI, API, 데이터, AI, 배포를 끝까지 연결해서 실제로 돌아가는 결과물을 만들고 개선하는 쪽입니다. 회사 안에서도 그런 책임과 문제를 맡을 수 있다면 오래 기여할 가능성이 더 높아요.

면접에서는 "오래 묶어둘 수 있는 사람인가"보다 "어떤 문제를 맡기면 책임 있게 끝까지 가져가는 사람인가", "회사의 제품 방향과 개인의 성장 욕구가 맞는가"를 확인하는 게 더 정확할 것 같아요.

**Detailed Answer**

우수의 커리어를 보면 반복되는 패턴이 하나 있어요: 문제에 더 직접적으로 개입할 수 있는 방향으로 계속 이동한다는 것입니다. 마케팅 → 데이터 → 컨설팅 → 직접 서비스 운영 → UX → 풀스택 → AI 서비스 설계. 각 전환은 "이탈"이 아니라 "더 직접적인 소유권을 향한 이동"이었습니다.

장기 근속 여부는 성격보다 환경으로 보는 게 더 정확해요:

오래 기여할 가능성이 높은 환경:
- 문제 도메인이 충분히 깊고 아직 풀리지 않은 것이 많을 때
- 기여도에 따라 책임이 실제로 확장될 때
- 프로덕트, 데이터, AI에 걸친 크로스펑셔널 협업이 있을 때
- 회사의 방향과 우수의 성장 방향이 실질적으로 겹칠 때

리스크가 높아지는 환경:
- 역할이 너무 좁게 정의되어 확장 여지가 없을 때
- 성장이 연차로만 결정될 때
- 실제 유저/프로덕트 임팩트와 단절된 실행만 반복될 때

가장 실용적인 채용 질문은 "이 사람이 어떤 상황에서도 떠나지 않을 사람인가"가 아니라 "이 역할이 이 사람의 성장 욕구와 충분히 맞는가"입니다.

---

### FAQ R-02. 창업 생각이 있으면 회사에 집중 못 하는 것 아닌가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.startup_intent.default` |
| Intent ID | `recruiter.startup_intent` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `창업 생각`, `배울것만 배우고 창업쪽으로 빠질 것 같은데`, `창업 리스크`, `회사에 집중할 수 있는가`, `스타트업으로 나갈 것 같은데` |
| Source Chunk IDs | `career.oosu_salon`, `profile.current_focus`, `career.target_role` |
| Visibility | `public` |

**Short Answer**

창업 관심은 리스크라기보다 방향성에 가까워요. 실제로 뭔가를 만들고 싶다는 욕구가 있는 사람은 회사의 프로덕트 문제에도 더 진지하게 개입합니다.

**Default Answer**

우려는 이해해요. "언젠가 창업하고 싶다면, 지금 이 회사는 그냥 연습 무대 아닌가"라는 논리죠.

그런데 창업 관심과 직장 몰입이 대립하는 게 아닐 수도 있어요. 우수는 이미 한 번 사업을 운영한 경험이 있어요 — 우수살롱을 5년간 직접 운영했습니다. 그 경험은 "내 마음대로 할 수 있는 환경에서만 잘한다"는 타입을 만들지 않았어요. 오히려 서비스가 실제로 돌아가게 하는 것이 얼마나 복잡하고, 얼마나 많은 연결이 필요한지를 체득한 경험이었어요.

창업 관심이 있는 사람은 회사의 프로덕트 문제에 무관심하기보다, 오히려 더 강한 소유 의식을 갖고 참여하는 경향이 있어요. "내가 만드는 것이 실제로 작동하는가", "유저가 실제로 쓰는가" — 이게 동기의 핵심이기 때문입니다. 그 에너지가 회사의 문제에 향할 때, 그것은 리스크가 아니라 강점입니다.

**Detailed Answer**

창업 지향형 개발자가 조직에 가져오는 것이 두 가지 있어요.

첫 번째는 **강한 프로덕트 소유 의식**입니다. "이 기능이 왜 필요한가", "유저가 실제로 이걸 쓰는가", "이게 서비스 전체에서 어떤 의미인가"를 계속 물어보는 사람입니다. 이것은 실행 속도를 약간 낮출 수 있지만, 방향이 잘못된 걸 조기에 발견하는 능력이기도 해요.

두 번째는 **실제로 작동하는 것에 대한 집착**입니다. 기술적으로 우아한 것보다 유저에게 실제로 가치 있는 것을 만드는 데 집중하는 경향이 있어요. 우수살롱 운영, AskOosu 설계, 컨설팅 업무 모두 "기능 완성"이 아니라 "실제로 돌아가는가"를 기준으로 판단해온 경험들입니다.

가장 정확한 채용 평가 질문은 "이 사람이 언젠가 창업할 것인가"가 아니라 "이 사람이 우리 회사의 문제를 진지하게 소유하고 끝까지 가져가는 사람인가"입니다. 그 답은 창업 관심 유무보다 프로젝트 태도와 결과물에서 더 분명히 보입니다.

---

### FAQ R-03. 비전공/전환형 개발자로서 깊이가 부족하지 않은가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.depth_concern.default` |
| Intent ID | `recruiter.depth_concern` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `비전공 개발자`, `깊이가 부족하지 않은가`, `전환형 개발자 실력`, `CS 전공자 대비`, `career changer depth`, `개발 실력이 충분한가` |
| Source Chunk IDs | `profile.strengths`, `tech_stack.main`, `project.instagram_clone.fact`, `project.askoosu.fact` |
| Visibility | `public` |

**Short Answer**

깊이 우려는 타당합니다. 10년 경력 백엔드 엔지니어 수준은 아니에요. 하지만 레이어를 연결하는 능력 — UI, API, DB, AI를 실제로 작동하는 시스템으로 이어붙이는 것 — 은 실제 프로젝트에서 확인됩니다.

**Default Answer**

정당한 질문이에요. 우수에게는 6년간 프로덕션 백엔드 시스템을 운영하면서 쌓인 깊이나 저수준 인프라 경험이 없어요. 이건 솔직하게 말할 수 있어야 합니다.

우수가 가진 것은 **레이어 간 통합 능력**이에요. Instagram Clone은 Spring Boot, PostgreSQL, JPA, JWT, Meilisearch, Cloudinary, React/Next.js를 1인 풀스택으로 연결한 프로젝트입니다. AskOosu는 Notion API, RAG 청크 저장, Groq 답변 생성, 채팅 UI를 소스 배지/피드백 로그와 함께 연결합니다. 이것들은 단순한 데모 앱이 아니에요 — 데이터가 레이어를 어떻게 흐르는지, 오류가 어디서 어떻게 나타나는지, 신뢰성을 어떻게 설계하는지를 이해해야 만들 수 있는 것들입니다.

전환형 배경이 순수 단점만은 아니에요. 코드 작성 전에 비즈니스 문제를 이해하는 것, 혼란스러운 유저가 실제로 어떤 경험을 하는지 아는 것, 운영 현실이 어떤 것인지 아는 것 — 이것들은 순수 기술 트랙에서는 발달하기 어렵고, 프로덕트 품질에서 실제로 차이를 만들어요.

**Detailed Answer**

비전공 배경이 만드는 격차는 두 종류예요.

첫 번째는 **구조적 지식 격차** — 자료구조, 알고리즘, 운영체제, 네트워크 기초. 우수는 코딩 테스트 연습과 과정 학습으로 이걸 채우고 있지만, CS 전공 후 수년간 엔지니어링을 해온 사람과 비교하면 솔직히 격차가 있습니다.

두 번째는 **단일 기술 도메인의 수직 깊이** — 예를 들면 Kafka 파이프라인 엔지니어링이나 GPU 메모리 최적화. 우수에게는 아직 이런 수직 깊이가 없어요.

우수가 가진 것:
- 문제 설명에서 작동하는 시스템까지 여러 레이어를 가로질러 이동하는 능력
- 어떤 문제를 풀 가치가 있는지에 대한 비즈니스 판단
- 마찰이 어디 있는지에 대한 UX 감각
- 대부분의 전통 트랙 개발자들이 아직 따라잡고 있는 AI/툴링 유창성

채용에서 실용적 질문: 이 역할이 처음부터 특정 도메인에서 매우 깊은 수직 전문성이 필요한가, 아니면 시스템을 연결하고 프로덕트 문제를 end-to-end로 소유하며 빠르게 전문성을 쌓아갈 수 있는 사람이 필요한가? 후자라면 우수는 강한 후보입니다.

---

### FAQ R-04. AI를 많이 쓰면 직접 실력이 부족한 것 아닌가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.ai_dependency.default` |
| Intent ID | `recruiter.ai_dependency` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `AI 의존도`, `AI를 많이 쓰면 실력이 부족한 것 아닌가`, `직접 코딩할 수 있나`, `AI 없이도 개발할 수 있나`, `AI tool dependency` |
| Source Chunk IDs | `ai_usage.methodology`, `project.instagram_clone.fact`, `project.sticks_and_stones.fact`, `profile.strengths` |
| Visibility | `public` |

**Short Answer**

AI를 많이 쓴다는 것과 이해 없이 쓴다는 것은 달라요. 우수의 워크플로는 "AI에게 다 맡기기"가 아니라 더 빠르게 움직이면서도 데이터 흐름을 이해하고, 생성된 코드를 검토하고, 아키텍처 결정을 직접 내리는 방식입니다.

**Default Answer**

이 질문 뒤에 있는 우려는 가치 있어요: AI가 생성한 코드를 많이 쓰면, 실제로 그 코드를 읽고 디버깅하고 확장할 수 있는가? AI 출력이 틀렸을 때 독립적인 판단을 내릴 수 있는가?

우수에게는 프로젝트 근거가 있어요. Instagram Clone은 AI에게 전체 기능 구현을 프롬프트해서 만든 것이 아닙니다. 관계 모델, JWT 인증 흐름, Meilisearch 통합, AI 댓글 기능 — 각 레이어에서 코드가 무엇을 하는지 이해해야 했습니다. AI 툴은 문법, 보일러플레이트, 반복 속도에 도움을 주었지만, 데이터 흐름, 에러 처리, 아키텍처 결정을 대체하지 않았어요.

AskOosu는 한 단계 더 나아가요: 우수가 RAG 아키텍처, FAQ 캐시 라우팅 규칙, 답변 근거 계약, 가드레일 정책을 설계했습니다. 이것들은 AI가 자발적으로 제안하는 것이 아니에요 — 시스템이 무엇이 필요한지, 어떤 실패 모드가 있는지를 알아야 설계할 수 있는 것들입니다.

2026년에 AI 유창성은 단축키가 아니라 하나의 기술입니다. 무엇을 물어야 할지, 출력을 어떻게 평가해야 할지, 언제 오버라이드해야 할지, AI 생성 답변에 어떻게 가드레일을 설계해야 할지를 아는 것 — 이것이 이제 효과적인 개발자의 일부입니다.

**Detailed Answer**

AI 툴 사용에서 가장 유용한 질문은 "이 사람이 AI를 쓰는가"가 아니라 "AI 출력에 대한 이 사람의 판단 품질이 어떤가"입니다.

우수의 워크플로: AI 툴(Claude Code, Gemini CLI, Codex, Groq)은 계획, 초안, 디버깅, 문서화에 사용됩니다. 하지만 모든 생성된 코드는 정확성, 기존 상태와의 통합 방식, 엣지 케이스에 대해 검토됩니다. 타입 체크, 빌드 테스트, 로그 확인, 예상 동작과 비교 — 이것은 선택사항이 아닌 표준 단계입니다.

증거: Sticks & Stones는 Vite + TypeScript로 재구축하기 전에 레거시 PHP/CSS/JS를 이해해야 했어요. 다른 사람의 레거시 코드를 이해하는 데 AI를 사용하려면 그 코드가 무엇을 해야 하는지도 이해해야 합니다. Instagram Clone은 크로스레이어 이슈를 디버깅하는 것을 포함했습니다 — 인증 상태가 올바르게 전파되지 않는 곳, 검색 인덱스가 오래된 곳, 파일 업로드 오류가 조용한 곳 — 이것들은 각 레이어를 이해하는 개발자 없이는 AI 툴이 해결해주지 않아요.

더 넓은 관점: AI를 효과적으로 사용하는 법을 아는 개발자는 기술 부족을 보여주는 것이 아닙니다. AI 보강 판단이라는 추가 기술을 보여주는 것이고, 이것은 소프트웨어 엔지니어링에서 점점 더 실제적인 부분이 되고 있습니다. 중요한 것은 가이드하고 검증하는 인간 판단이 있는가 입니다. 우수의 경우, 프로젝트 증거가 그렇다는 것을 지지합니다.

---

### FAQ R-05. 프로젝트가 많아 보이는데 깊이가 있는가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.project_breadth_vs_depth.default` |
| Intent ID | `recruiter.project_breadth_vs_depth` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `프로젝트가 많은데 깊이가 있나`, `프로젝트 수가 많아서 얕은 것 아닌가`, `breadth vs depth`, `프로젝트가 많아 보이는데`, `shallow portfolio` |
| Source Chunk IDs | `project.askoosu.fact`, `project.instagram_clone.fact`, `project.sticks_and_stones.fact`, `profile.growth_areas` |
| Visibility | `public` |

**Short Answer**

포트폴리오 진행 중 특성상 프로젝트 수가 많아 보이는 면이 있어요. 대표 프로젝트 세 가지 — AskOosu, Instagram Clone, Sticks & Stones — 는 각각 다른 방향에서 의미 있는 깊이가 있습니다.

**Default Answer**

정당한 우려예요. 프로젝트가 많은 포트폴리오는 깊이 없는 넓이를 의미할 수 있고, 이건 처음부터 깊이가 필요한 팀에게 실제 걱정거리가 됩니다.

우수의 포트폴리오는 두 층으로 나뉘어요. 대표 프로젝트 — AskOosu, Instagram Clone, Sticks & Stones — 는 각각 실질적이고 특정 방향에서 깊이가 있습니다. AskOosu는 RAG 지식 아키텍처 설계, FAQ 캐시 라우팅 시스템 구축, 답변 근거/폴백/피드백 로깅 처리를 포함했습니다. Instagram Clone은 1인 풀스택 프로젝트로 진짜 관계형 데이터 모델링, JWT 인증, Meilisearch 통합, 파일 업로드, AI 기능 통합이 있었습니다. Sticks & Stones는 브랜드 경험을 유지하면서 레거시 코드를 재구축하기 위해 레거시 코드를 충분히 이해해야 했습니다.

지원 프로젝트들 — 초기 Flutter 앱, 랩 실험, 학습 로그 — 은 성장 기록으로 보이지만 동등한 깊이로 제시되고 있지 않습니다.

**Detailed Answer**

프로젝트가 많은 포트폴리오를 읽는 방법은 두 가지예요. 비관적 읽기: 이 사람은 시작만 하고 깊이 있게 마무리하지 않는다. 정확한 읽기: 이 사람은 만들면서 배우고, 보이는 진행이 성장의 방향과 속도를 말해준다.

우수의 경우 솔직한 답: 저장소의 일부 프로젝트는 학습 연습입니다. Pylingo, Javalingo, 초기 Flutter 앱 — 이것들은 학습이 시작된 곳을 보여주지, 끝난 곳을 보여주지 않아요. 완성된 제품으로 평가해서는 안 됩니다.

실제 깊이를 대표하는 프로젝트는 AskOosu, Instagram Clone, Sticks & Stones입니다. 각각:

**AskOosu**: 전체 지식 아키텍처를 설계했어요 — canonical 엔티티, chunk ID 관례, 검색 우선순위, 답변 근거 계약, FAQ 라우팅 규칙, 가드레일, UI 서피스 레지스트리. 이것은 단순한 챗봇이 아닙니다. 특정 제품 목적을 위해 구축된 구조화된 정보 검색 및 AI 답변 시스템입니다.

**Instagram Clone**: 사용자, 게시물, 댓글, 팔로우, 스토리, 검색을 위한 관계형 데이터 모델을 구축했습니다. Spring Boot, PostgreSQL, Redis, JWT, Meilisearch, Cloudinary, React/Next.js를 연결했어요. 댓글 요약, 비방 감지, 해시태그 제안 같은 AI 기능을 추가했습니다. 크로스레이어 이슈를 디버깅했어요. 이것은 실질적인 풀스택 깊이입니다.

**Sticks & Stones**: 프로덕션 회사 웹사이트의 레거시 WordPress 사이트를 이해하고, 안전하게 교체할 수 있는 것을 식별하고, Vite + TypeScript로 재구축하면서 브랜드 경험을 유지했습니다. 실서비스 제약과 클라이언트 커뮤니케이션은 개인 포트폴리오 제약과 다릅니다.

세 개의 깊은 프로젝트가 각각 다른 기술 도메인에 있어요 — AI/RAG, 풀스택 SNS, 레거시 현대화. 아직 성장 중인 사람에게는 합리적인 포트폴리오입니다.

---

### FAQ R-06. 협업 경험은 충분한가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.collaboration_experience.default` |
| Intent ID | `recruiter.collaboration_experience` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `협업 경험`, `팀워크 경험이 있나`, `다른 사람들과 일해본 적이 있나`, `collaboration experience`, `팀 프로젝트 경험` |
| Source Chunk IDs | `profile.collaboration`, `project.ez_air.fact`, `career.sticks_and_stones`, `career.gfk`, `career.consulting` |
| Visibility | `public` |

**Short Answer**

협업 경험은 여러 맥락에서 있어요 — 글로벌 계정 조율, 팀 기반 컨설팅, UX 계약 프로젝트, 다인원 웹 개발 프로젝트. 포트폴리오 프로젝트는 1인 작업이 많지만, 커리어 전반에서 크로스펑셔널 협업은 실제 패턴입니다.

**Default Answer**

우수의 포트폴리오 프로젝트가 대부분 1인 작업이라서 협업 증거가 즉시 잘 보이지 않을 수 있어요.

그런데 커리어 기록은 다른 이야기를 해요. GfK Korea에서 삼성전자 글로벌 계정과 함께 일하면서 데이터 전달, 보고, 내부 팀과 클라이언트 이해관계자 사이의 커뮤니케이션을 조율했어요. JW CRONY에서는 다양한 기술팀과 운영팀에 걸친 해외 설치 및 유지보수 조율을 담당했어요. 태영테크와 다빗에서 외부 컨설턴트로서 비즈니스, 운영, 전략 팀과 함께 일했습니다 — 다른 전문성과 우선순위를 가진 사람들에게 유용해야 하는 작업이었죠.

개발에서 가장 직접적인 증거는 EZ Air입니다: 팀 웹 프로젝트에서 AI 연결 방향을 밀어붙이고, Git 워크플로와 머지를 안내하고, UI/애니메이션과 API 통합에 팀원들과 함께 기여했어요. Sticks & Stones는 계약 역할이었습니다 — 클라이언트의 기대, 제약, 브랜드 요건과 함께 일했어요.

**Detailed Answer**

세 가지 협업 경험 영역이 돋보입니다.

첫 번째, **크로스펑셔널 비즈니스 협업**. GfK Korea의 글로벌 POS 데이터 업무는 삼성전자 계정 이해관계자, 내부 분석가, 해외 지사 담당자와 조율이 필요했습니다. 태영테크와 다빗에서의 컨설팅은 전략과 프로세스에 대해 리더십팀과 함께 일하는 것을 포함했습니다 — 잘 듣고, 권고사항을 명확하게 설명하고, 방향에 대한 이견을 헤쳐나가야 하는 일이에요.

두 번째, **UX와 개발에서 클라이언트 및 이해관계자 협업**. Sticks & Stones는 실제 클라이언트가 있는 계약 프로젝트였어요. 우수가 클라이언트의 목표, 제약, 브랜드 기대를 이해하고 — 그것을 기술적·UX적 결정으로 번역하는 책임을 졌습니다. 그 관계는 기술 능력 이상을 요구했어요 — 커뮤니케이션, 판단, 기대 관리가 필요했습니다.

세 번째, **팀 기반 개발 협업**. EZ Air가 가장 개발팀 특화된 예시예요. 우수는 방향 설정에 기여했고(팀이 더 단순한 접근을 선호할 때 AI 연결 기능 쪽으로 밀었고), Git 워크플로와 머지 충돌을 관리하고, UI, 애니메이션, API 통합에 걸쳐 팀원들과 함께 작업했습니다. 이는 팀의 초기 선호와 다른 방향을 지지하는 더 어려운 사회적 역학도 포함했어요.

솔직한 격차: 최근 개발 업무 대부분은 1인 작업이었어요, 부분적으로는 포트폴리오 프로젝트가 개인 역량을 보여주도록 설계되었기 때문이에요. 강한 팀 기반 개발로 성장하는 것 — PR 리뷰 문화, 비동기 커뮤니케이션, 공유 코드베이스 소유 — 은 진행 중인 영역입니다.

---

### FAQ R-07. 프론트/백/AI 다 한다고 하는데 포지션이 애매하지 않은가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.role_ambiguity.default` |
| Intent ID | `recruiter.role_ambiguity` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `포지션이 애매하지 않나`, `프론트 백 AI 다 한다고 하는데`, `역할이 모호하다`, `제너럴리스트 vs 스페셜리스트`, `어떤 포지션인가` |
| Source Chunk IDs | `profile.current_focus`, `career.target_role`, `tech_stack.main`, `profile.strengths` |
| Visibility | `public` |

**Short Answer**

넓이는 현재 단계에서 의도된 것이지, 우유부단함의 신호가 아니에요. 가장 명확한 포지셔닝은: AI 연결 풀스택, 프로덕트/UX 쪽에 방향을 두고 백엔드/데이터 기반을 쌓는 중. "뭐든 할 수 있어요"가 아니라 "레이어를 연결하고 유저 문제에 관심을 갖습니다"입니다.

**Default Answer**

직접적으로 답할 가치 있는 포지셔닝 질문이에요. 우수는 프론트엔드 스페셜리스트, 백엔드 엔지니어, ML 리서처로 제시하고 있지 않아요. 솔직한 포지션은: AI 연결 풀스택 개발자 — 스택 전체에서 개발할 수 있고 사용자 경험, 데이터, AI 생성이 하나의 서비스로 어떻게 연결되는지 이해하는 사람입니다.

이것은 "모든 것을 표면 수준으로 한다"는 것과 다릅니다. 우수가 강한 것은 통합 — 레이어 사이의 연결 조직 — 이고 전문화된 영역에서는 깊이를 아직 쌓고 있습니다.

어떤 역할에는 이게 정확히 맞아요: 아이디어에서 작동하는 시스템까지 기능을 가져갈 수 있거나, 프론트엔드, API, AI 툴링에 걸친 제품 아키텍처를 설계할 수 있는 사람이 필요한 팀. 단일 좁은 영역에서 깊은 스페셜리스트가 필요한 역할에는 우수가 가장 강한 후보가 아닙니다.

**Detailed Answer**

포지셔닝 질문은 역할의 맥락 없이는 더 답하기 어려워요. 그래서 가장 유용한 답은 실제로 강점이 어디에 있는지를 설명하는 것입니다.

우수의 가장 강한 통합 레이어: 유저 대면 경험(프론트엔드, UX, 인터랙션 디자인)이 데이터/API/AI 로직과 연결되는 것. 그것이 AskOosu가 사는 곳이에요 — 제품 사고, 채팅 UI 설계, RAG 아키텍처, 답변 품질 시스템. Instagram Clone도 마찬가지 — 소셜 제품 구조, 검색과 업로드 흐름, AI 보조 콘텐츠 기능들.

백엔드에서: REST API 구축, 관계형 DB 작업, 데이터 스키마 설계, 인증과 검색 연결을 할 수 있어요. 이것은 실제이지만, 깊이를 쌓고 있는 중이지 확립된 전문성이 아닙니다.

AI/툴링 쪽에서는: 대부분의 제너럴리스트보다 앞서 있어요 — 검색 시스템 설계, FAQ 캐싱과 라우팅 구축, 답변 품질을 위한 가드레일 작성, 피드백 루프 구조화가 "API 호출 추가했어요" 수준이 아닙니다.

채용 관점에서: 우수는 프로덕트/UX 사고와 기술 구현 사이의 연결이 가치 있고, AI/데이터가 제품의 일부가 되고 있는 팀에 가장 잘 맞아요. 그것이 가장 명확하고 솔직한 포지션입니다 — "뭐든 다 해요"가 아니라 "것들을 연결하고 제품이 실제로 뭘 하는지에 관심을 가져요".

---

### FAQ R-08. 단점이나 리스크는 무엇인가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.weaknesses_risks.default` |
| Intent ID | `recruiter.weaknesses_risks` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `단점이 뭔가`, `리스크`, `솔직한 약점`, `우수를 채용하면 어떤 리스크가 있나`, `무엇을 걱정해야 하나` |
| Source Chunk IDs | `profile.growth_areas`, `profile.work_style`, `career.timeline`, `tech_stack.main` |
| Visibility | `public` |

**Short Answer**

세 가지를 솔직하게 말할 수 있어요: 마무리 집중력(구조에 강하고, 완료 기준 설정은 개선 중), 백엔드/데이터 깊이(아직 쌓는 중), 규모 있는 팀 기반 개발 경험 제한.

**Default Answer**

세 가지를 직접 이름 붙이는 게 좋겠어요.

첫 번째, **마무리 범위**. 우수는 초기 계획, 아키텍처, 구조 설계에 강하지만 — 넓은 관심사가 명확한 완료 기준이 정의되기 전에 범위를 확장시킬 수 있어요. 개선 중입니다: AskOosu는 Portfoli-Oh!가 너무 기능이 많아진 후에 의도적으로 더 적은 기능과 더 명확한 완료 기준으로 설계되었어요. 하지만 솔직히 지켜봐야 할 긴장입니다.

두 번째, **백엔드와 데이터 깊이**. Spring Boot와 PostgreSQL은 프로젝트 작업으로 쌓고 있지만, 우수는 5년 프로덕션 시스템 경험을 가진 백엔드 엔지니어가 아닙니다. 그 깊이가 처음부터 필요한 역할에는 실제 격차입니다.

세 번째, **팀 기반 개발 경험**. 최근 개발 업무 대부분이 1인 또는 소규모 계약 맥락이었습니다. 강한 비동기 협업, PR 문화, 코드 리뷰 규율, 코드베이스 공유 소유권으로 성장하는 것은 진행 중입니다.

**Detailed Answer**

솔직한 약점 답변은 "인식하고 있고 개선 중인 것"과 "채용팀을 놀라게 할 수 있는 것"을 구분해야 합니다.

**인식하고 있고 적극적으로 개선 중인 것:**
- 마무리 집중력: 시작 전에 완료 기준 설정하기, "있으면 좋은 것"에서 "나중에"를 분리하기. 개선 증거: Portfoli-Oh! 대비 AskOosu의 더 집중된 범위.
- 백엔드/데이터 깊이: KOSA 과정, Instagram Clone 백엔드 작업, 지속적인 연습. 아직 성장 중, 시니어 수준이 아닙니다.

**채용팀을 놀라게 할 수 있는 것:**
- 팀 규모 개발: PR 리뷰 문화, 공유 코드베이스에서의 비동기 커뮤니케이션, 더 큰 기술팀 내의 소유권이 현재 포트폴리오에서 잘 입증되지 않습니다.
- 코딩 테스트 성과: 알고리즘/자료구조 문제를 연습하고 있지만 경쟁 프로그래밍 배경이 없어요. 선별성 높은 코딩 스크린을 가진 회사에는 실제 리스크입니다.

**리스크이지만 반드시 차단 요소는 아닌 것:**
- 커리어 다양성이 산만해 보일 수 있어요. 비즈니스→데이터→UX→AI 개발 서사는 맥락에서는 의미 있지만, 빠르게 읽는 리크루터에게는 산만한 경험으로 보일 수 있어요.
- 창업 지향은 프로덕트 문제와 소유권에 동기부여 된다는 것을 의미해요 — 맞는 환경에서는 좋고 실행만 있는 역할에서는 미스매치입니다.

이것들을 직접 말하는 목표: 이 리스크들을 아는 채용팀이 이 특정 역할에서 차단 요소인지 판단할 수 있도록 — 입사 후 발견하는 것보다.

---

### FAQ R-09. 지금 채용하면 어떤 일을 맡기는 게 좋은가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.role_recommendation.default` |
| Intent ID | `recruiter.role_recommendation` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `지금 채용하면 어떤 일을 맡기면 좋은가`, `어떤 역할이 적합한가`, `What role should Oosu have`, `best position`, `어떤 포지션이 맞나` |
| Source Chunk IDs | `career.target_role`, `profile.strengths`, `profile.current_focus`, `project.askoosu.fact` |
| Visibility | `public` |

**Short Answer**

가장 잘 맞는 역할: AI 애플리케이션 개발, 풀스택 웹 서비스 개발, 또는 유저 문제를 구현과 연결하는 것이 핵심 업무인 프로덕트/AI 엔지니어링 역할. 아직 이른 역할: 깊은 인프라 엔지니어링이나 고도로 전문화된 ML 리서치.

**Default Answer**

우수가 초기부터 잘 기여할 가능성이 높은 역할은 유저 대면 제품 경험을 데이터, API, AI 로직과 연결하는 것이 핵심인 역할들이에요 — 단일 기술 레이어에 깊이 전문화하는 것이 아니라.

구체적으로: AI 기반 기능 개발, 내부 도구 구축, 대화형 제품 설계, RAG/검색 시스템 개발, 또는 UI에서 데이터까지 범위가 걸쳐 있는 풀스택 웹 애플리케이션 작업. 비즈니스 맥락, UX 사고, 구현이 모두 직업의 일부인 역할들이에요.

우수가 아직 가장 강하지 않은 역할: 프로덕션 인프라 엔지니어링, 딥 ML 모델 개발, 특정 도메인 전문 지식이 필요한 역할(예: 임베디드 시스템, 저수준 네트워킹).

**Detailed Answer**

역할 적합성의 구조화된 뷰입니다.

**높은 적합성 (초기 기여자):**
- AI 애플리케이션 개발자 — LLM/RAG 능력을 실제 제품 표면에 연결하는
- 제품 팀의 풀스택 웹 개발자 — UI에서 API, 데이터베이스까지 기능 소유
- AI-PM 하이브리드 또는 제품 대면 엔지니어 — 문제 정의 + 구현
- 내부 도구/지식 관리 개발자 — 검색, 검색, 구조화된 정보 제품
- AI 툴링 범위가 있는 주니어 풀스택 — 우수의 실제 수준, 기대와 역량이 잘 맞는

**중간 적합성 (빠르게 성장할):**
- Spring Boot와 PostgreSQL을 사용하는 백엔드 중심 역할
- 데이터 엔지니어링 인접 작업 (파이프라인, 처리, 제품 분석)
- 개발자 대면 문서화와 DX 도구

**낮은 적합성 (솔직한 미스매치):**
- 깊은 인프라/DevOps/SRE — 시스템 운영 배경이 충분하지 않음
- ML 리서치/모델 학습 — 현재 방향이 아님
- 제품 맥락 없는 좁은 스페셜리스트 실행 역할 — 우수는 집중을 유지하기 위해 "왜"를 이해해야 함

실용적인 채용 권고: 실제 유저와 제품 맥락이 있는 문제를 우수에게 주고, 접근 방식을 평가하세요 — 코드만이 아니라 프레이밍과 판단을. 이것이 표준 알고리즘 스크린보다 협업과 제품 사고 가치를 더 명확하게 보여줄 거예요.

---

### FAQ R-10. 전환형 개발자라는 리스크를 감수할 가치가 있는가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.career_switcher_value.default` |
| Intent ID | `recruiter.career_switcher_value` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `비전공 전환 개발자 리스크`, `커리어 전환 개발자 채용`, `전환형 개발자 가치`, `career switcher hiring risk`, `worth hiring a career changer` |
| Source Chunk IDs | `profile.long_intro`, `career.transition`, `profile.strengths`, `project.askoosu.fact` |
| Visibility | `public` |

**Short Answer**

전환형 개발자는 소프트웨어가 무엇을 위한 것인지에 대한 더 많은 맥락을 가지고 옵니다. 일부 영역의 순수 기술 깊이에서 리스크는 실제이지만, 제품 판단, 유저 공감, 크로스펑셔널 커뮤니케이션에서 업사이드도 마찬가지로 실제입니다.

**Default Answer**

전환형 개발자는 기술 깊이에서 의미 있는 리스크가 있어요 — CS 학생들이 수업과 인턴십에서 얻는 초기 반복들이 없습니다. 그 격차는 실제입니다.

하지만 포트폴리오는 그 대신 실제로 쌓인 것을 보여줘요: 고객 행동 조사, 시장 분석, POS 데이터 처리, 브랜드 전략, 서비스 운영, UX 설계. 이것들은 기술 이력서에 덧붙여진 소프트 스킬이 아닙니다 — 좋은 제품 사고의 입력들이에요.

실제로는 이렇게 나타나요: "이게 어떤 문제를 누구를 위해 해결하는가?"를 "가장 기술적으로 우아한 방법은 무엇인가?"보다 먼저 묻는 것. 항상 강점은 아니에요 — 가끔은 빠르게 깔끔한 코드를 짜는 사람이 필요합니다. 하지만 유저 니즈와 구현 사이의 연결이 중요한 제품 환경에서는 진짜 차별화 요소입니다.

솔직한 채용 계산: 역할이 처음부터 깊은 기술 시니어리티가 필요하면 더 강한 후보들이 있어요. 역할이 제품 판단, 학습 속도, 크로스펑셔널 커뮤니케이션, AI 보강 개발을 성장하는 기술 능력과 함께 가치 있게 여긴다면, 우수는 경쟁력 있는 후보입니다.

---

### FAQ R-11. 압박이나 불확실한 요구사항을 어떻게 처리하는가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.ambiguity_handling.default` |
| Intent ID | `recruiter.ambiguity_handling` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `압박이나 불확실한 요구사항 처리`, `모호한 상황에서 어떻게 하나`, `불명확한 방향에서 일하기`, `ambiguity handling`, `unclear requirements` |
| Source Chunk IDs | `profile.work_style`, `career.consulting`, `career.oosu_salon`, `profile.collaboration` |
| Visibility | `public` |

**Short Answer**

우수의 모호함에 대한 기본 반응은 구조화예요: 알려진 것을 정의하고, 알려지지 않은 것을 드러내고, 실행 가능한 시작점을 찾는 것. 이것은 요구사항이 위에서 주어지지 않고 고객 행동, 시장 데이터, 운영 현실에서 구축해야 했던 수년의 업무에서 나왔습니다.

**Default Answer**

모호함은 익숙한 영역이에요. 태영테크와 다빗에서의 컨설팅 업무는 불완전한 정보로 권고사항을 만드는 것을 요구했어요 — 클라이언트의 실제 문제가 처음 설명과 종종 달랐을 때. 우수살롱은 5년간 프로덕트 매니저나 엔지니어링팀 없이 운영하는 것이었습니다. 이 경험들은 "스펙을 기다리기"가 아닌 "알아내기"에 대한 내성을 훈련시켰어요.

개발에서 우수의 불명확한 요구사항에 대한 반응은 유저 문제에서 시작하는 것이에요: 누가 혼란스럽고, 마찰이 어디 있고, 성공은 어떤 모습일까? 그런 다음 구현에 커밋하기 전에 트레이드오프와 함께 옵션으로 구조화합니다. 바로 무언가를 만드는 것보다 느리지만, 나중에 재작업 비용을 줄이는 경향이 있어요.

**Detailed Answer**

모호함을 잘 처리하는 것은 세 가지 다른 종류의 불명확함을 구분하는 것에 달려 있어요.

1. **문제 자체가 잘 정의되지 않은 경우.** 우수의 접근: 구축 전에 문제를 정의하기 위해 비즈니스/UX 프레이밍을 사용. 업스트림으로 가기 — 유저가 누구인지, 무엇을 하려고 하는지, 성공한 결과가 무엇인지 물어보기. 이것은 컨설팅과 고객 조사 업무에서 나왔어요.

2. **기술적 경로가 불확실한 경우.** 우수의 접근: 알려진 것에서 시작하고, 빠르게 프로토타입하고, 과도하게 계획하는 대신 평가하기. AskOosu의 RAG 아키텍처는 여러 설계 결정을 거쳤어요 — 청크 형식, FAQ 캐시와 RAG 사이의 라우팅 방법, 폴백 처리 방법 — 이것들은 구축, 테스트, 수정으로 해결되었어요.

3. **조직적 모호함 — 불명확한 소유권, 변하는 우선순위, 상충하는 방향.** 우수의 접근: 모호함을 명시적으로 드러내고, 작업 가정을 제안하고, 확인. EZ Air에서 팀이 제품 방향에 대해 다른 아이디어를 가졌을 때, 우수는 순응하거나 압도하지 않고 추론과 함께 AI 연결 접근 방식을 명확하게 지지했어요.

마감 압박 하에서 리스크는 범위 확장이에요 — 너무 넓게 시작하고 충분히 빠르게 좁히지 않는 것. 우수는 이것을 확인했고 "범위를 먼저 잠그고, 가장 어려운 것을 먼저 구축하는" 것을 적극적으로 연습하고 있어요.

---

### FAQ R-12. 시니어나 리더십 역할로 성장할 수 있는가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.growth_potential.default` |
| Intent ID | `recruiter.growth_potential` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `성장 가능성`, `시니어가 될 수 있나`, `리더십 가능성`, `can Oosu grow`, `장기적 성장 가능성` |
| Source Chunk IDs | `profile.strengths`, `career.timeline`, `profile.values`, `profile.current_focus` |
| Visibility | `public` |

**Short Answer**

지표들은 긍정적이에요: 우수는 빠르게 배우고, 주도성이 있고, 제품 소유권을 진지하게 받아들이고, 여러 맥락에서 매니저 없이 복잡한 작업을 이끌었어요. 기술 리더십으로 이어질지는 백엔드/시스템 깊이가 얼마나 빠르게 성장하느냐에 달려 있어요.

**Default Answer**

전환형 개발자는 가끔 전통 트랙 개발자보다 빠르게 성장해요 — 소프트웨어가 무엇을 위한 것인지에 대한 더 많은 맥락을 가지고 오기 때문이에요. 문제를 정의하고, 기능을 우선순위 매기고, 기능 간 커뮤니케이션하고, 제약 하에서 품질을 높게 유지하는 능력 — 이것들은 다른 사람이 처리하지 않을 엔지니어링이 아닌 환경에서 운영해야 했던 경험에서 나와요.

우수는 여러 환경에서 이것을 보여줬어요: 실제 서비스의 1인 운영자로서 우수살롱; 모호함 하에서 전략이 결과물이었던 컨설팅 업무; 외부 방향 없이 전체 아키텍처를 설계하고 구축한 AskOosu.

솔직한 경고: 기술 리더십은 시간이 지남에 따라 시스템, 아키텍처, 신뢰성 엔지니어링에서 검증된 깊이를 요구해요. 그것은 아직 쌓이고 있어요. 성장 잠재력은 실제이고; 시니어 기술 리더십까지의 타임라인은 CS 전공 후 7년간 코딩해온 사람보다 길어요.

---

### FAQ R-13. 비즈니스 배경이 실제로 코드에서 어떻게 나타나는가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.business_in_code.default` |
| Intent ID | `recruiter.business_in_code` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `비즈니스 경험이 코드에서 어떻게 나타나나`, `UX 경험이 개발에 어떻게 도움이 되나`, `business background in development`, `비즈니스 배경이 실제로 개발에 도움이 되나` |
| Source Chunk IDs | `profile.long_intro`, `career.oosu_salon`, `project.sticks_and_stones.fact`, `project.askoosu.fact` |
| Visibility | `public` |

**Short Answer**

기능 정의 방식, 사용자 흐름 구조화 방식, 품질 기준 설정 — 코드가 컴파일되는지만이 아니라 이런 것들에서 나타납니다.

**Default Answer**

가장 명확한 예시는 AskOosu의 가드레일 시스템이에요. 답변 생성 코드 한 줄을 쓰기 전에, 우수는 시스템이 절대 말하지 말아야 할 것을 정의했어요 — 만들어낸 수치, 개인 저장소 링크, 완성되지 않은 정보를 완성된 것처럼, 1인칭 사칭. 이것은 기술적 패턴이 아니에요. 포트폴리오를 방문하는 유저(이 경우 리크루터나 엔지니어)가 무엇을 신뢰할 만하다고 느끼는지 대 오도적으로 느끼는지에 대한 제품 판단이에요.

Sticks & Stones에서 클라이언트의 제약은: 기술적 기반을 현대화하면서 브랜드를 알아볼 수 있게 유지하는 것이었어요. 비즈니스 판단 — 어떤 요소가 브랜드에 중요한지 대 기술적으로 편리한지 — 이 구현 결정을 형성했습니다. 이것은 서비스를 운영하는 사람들에게 브랜드 경험이 무엇을 의미하는지 이해하는 것에서 나왔지, CSS를 읽는 것에서가 아니에요.

Instagram Clone에서 AI 기능 선택(댓글 요약, 비방 감지, 해시태그 제안)은 소셜 콘텐츠의 실제 마찰 지점을 해결하기 때문에 선택되었어요 — 기술적으로 가장 흥미로운 AI 기능이어서가 아니라.

---

### FAQ R-14. 어떤 팀과 회사 환경에서 최고의 성과를 내는가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.ideal_environment.default` |
| Intent ID | `recruiter.ideal_environment` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `어떤 환경에서 잘 하는가`, `이상적인 팀 환경`, `회사 문화 적합성`, `어떤 팀이 맞는가`, `ideal environment` |
| Source Chunk IDs | `profile.work_style`, `profile.values`, `career.target_role`, `profile.current_focus` |
| Visibility | `public` |

**Short Answer**

제품 문제가 실제이고, 크로스펑셔널 입력이 가치 있고, 성장과 책임이 기여와 연결된 환경. 반대: "왜"에 접근할 수 없는 좁게 정의된 실행 역할.

**Default Answer**

우수는 실제 유저 문제가 있고 엔지니어링 팀이 그 문제에 가깝게 있어 결정이 왜 중요한지 이해할 수 있는 환경에서 가장 잘 일해요. 이것은 단순히 프로덕트-엔지니어링 협업 철학에 대한 것이 아니에요 — 동기부여에 대한 것입니다. 우수는 일의 목적을 이해해야 잘 할 수 있어요.

자율성이 중요해요: 우수는 고정된 스펙을 실행하는 것이 아니라 문제에 어떻게 접근할지 정의하는 것을 신뢰받을 때 가장 강합니다. 이것은 컨설팅, 창업, 1인 프로젝트 개발에서 수년간 자기주도적으로 일한 것에서 나왔어요.

중소 규모 팀이 현재 커리어 단계에서는 크고 고도로 전문화된 역할을 가진 대형 팀보다 더 잘 맞는 경향이 있어요. 우수의 가치는 크로스레이어 통합이에요 — 한 사람이 여러 레이어를 다루는 게 예상되는 환경에서 더 보이고 더 유용합니다.

**Detailed Answer**

우수의 최고 성과와 상관관계가 있는 네 가지 환경 요소:

1. **제품의 실제 유저 문제.** "이 내부 도구 유지하기"나 "이 스펙 구현하기"가 아니라 — "우리 유저가 이 문제를 가지고 있어, 해결 방법을 알아내라". 우수의 제품 사고와 UX 본능은 설계 공간이 충분히 열려 있을 때 가장 유용해요.

2. **AI와 데이터가 1급 제품 관심사.** AI 툴링은 진짜 강점 영역이고 진짜 관심사에요. AI를 부가 기능으로 취급하는 환경은 이걸 과소활용할 거예요. AI/데이터가 제품 가치의 중심인 환경이 우수가 가장 빠르게 성장하는 곳입니다.

3. **기여도에 따라 성장하는 책임.** 단순히 연차에 의한 시니어리티가 아니라, 업무 품질이 그것을 입증할 때 실제로 확장되는 책임. 우수는 소유권에 동기부여 됩니다. 고정 범위에 낮은 천장이 있는 역할은 참여를 지속시키지 않아요.

4. **가치 있는 기술로서의 크로스펑셔널 커뮤니케이션.** 엔지니어링/제품/비즈니스 경계가 낮은 팀 — 개발자가 유저 니즈를 이해해야 하고 이해관계자가 기술적 트레이드오프를 이해해야 하는 곳 — 이 우수의 커뮤니케이션 스타일과 잘 맞아요.

안티패턴: 개인 기여가 보이지 않는 매우 큰 팀, 구현 시작 전에 스펙이 완전히 잠긴 역할, AI 툴이 적극적으로 권장되지 않는 조직.

---

### FAQ R-15. 입사하면 우수가 처음 할 질문은 무엇인가?

| 필드 | 내용 |
| --- | --- |
| FAQ ID | `faq.recruiter.onboarding_questions.default` |
| Intent ID | `recruiter.onboarding_questions` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `입사 첫 날 어떤 질문을 할까`, `온보딩 스타일`, `입사하면 무엇을 먼저 알고 싶나`, `onboarding questions`, `first questions after joining` |
| Source Chunk IDs | `profile.work_style`, `profile.collaboration`, `profile.process` |
| Visibility | `public` |

**Short Answer**

우수는 이것들을 먼저 이해하려 할 거예요: 유저가 누구이고 어떤 문제를 가지고 있는지, 팀이 현재 제품이 작동하는지를 어떻게 측정하는지, 지금 제품의 가장 어려운 미해결 문제가 무엇인지.

**Default Answer**

첫날, 우수의 본능은 기여하기 전에 맥락을 이해하는 것이에요. 구체적인 질문들:

- 실제 유저는 누구이고, 오늘 이 제품과의 경험은 어떤가요?
- 팀이 최근에 가장 자랑스러운 것은 무엇이고, 계획대로 되지 않은 것은 무엇인가요?
- 현재 제품의 마찰이 어디 있나요 — 유저들이 뭘 불평하고, 팀이 고쳐야 한다고 아는 것은 무엇인가요?
- 첫 90일에서 "좋은 기여"는 여기서 어떤 모습인가요?
- 엔지니어링이 제품 및 디자인과 어떻게 상호작용하나요 — 스펙이 있나요, 아니면 해결해야 할 문제가 있나요?

이것들은 말랑한 질문이 아니에요. 이것들은 패턴을 반영합니다: 우수는 공식 온보딩 버전이 아닌 실제 상황을 이해하고 싶어 합니다.

---

## 15. Question Surface Registry — v12 확장

### 새 서피스: `recruiter_defense`

> 이 서피스는 유저가 채용담당자/채용 매니저로 확인될 때 또는 평가 의도를 시사하는 질문을 할 때 표시됩니다.

| 우선순위 | Quick label | Display question | FAQ ID | Answer variant | RenderSpec |
| --- | --- | --- | --- | --- | --- |
| 1 | `장기 근속` | `오래 근무할 사람인가, 아니면 배울 것만 얻고 떠날 것인가?` | `faq.recruiter.retention_risk.default` | `default` | `recruiter_honest_card` |
| 2 | `창업 우려` | `창업 생각이 있으면 회사에 집중 못 하는 것 아닌가?` | `faq.recruiter.startup_intent.default` | `default` | `recruiter_honest_card` |
| 3 | `개발 깊이` | `비전공/전환형으로서 개발 깊이가 충분한가?` | `faq.recruiter.depth_concern.default` | `default` | `recruiter_honest_card` |
| 4 | `AI 의존도` | `AI를 많이 쓰면 직접 실력이 부족한 것 아닌가?` | `faq.recruiter.ai_dependency.default` | `default` | `recruiter_honest_card` |
| 5 | `프로젝트 깊이` | `프로젝트가 많아 보이는데 진짜 깊이가 있는가?` | `faq.recruiter.project_breadth_vs_depth.default` | `default` | `recruiter_honest_card` |
| 6 | `협업 경험` | `실제 협업 경험이 있는가?` | `faq.recruiter.collaboration_experience.default` | `default` | `recruiter_honest_card` |
| 7 | `포지션 명확성` | `프론트/백/AI 다 한다고 하는데 포지션이 애매하지 않은가?` | `faq.recruiter.role_ambiguity.default` | `default` | `recruiter_honest_card` |
| 8 | `단점과 리스크` | `솔직한 단점과 리스크는 무엇인가?` | `faq.recruiter.weaknesses_risks.default` | `default` | `recruiter_honest_card` |
| 9 | `역할 추천` | `지금 채용하면 어떤 일을 맡기는 게 좋은가?` | `faq.recruiter.role_recommendation.default` | `default` | `thirty_day_plan_timeline` |
| 10 | `전환형 가치` | `비전공 전환형 개발자라는 리스크를 감수할 가치가 있는가?` | `faq.recruiter.career_switcher_value.default` | `default` | `recruiter_honest_card` |
| 11 | `모호함 처리` | `압박이나 불확실한 요구사항을 어떻게 처리하는가?` | `faq.recruiter.ambiguity_handling.default` | `default` | `recruiter_honest_card` |
| 12 | `성장 가능성` | `시니어나 리더십 역할로 성장할 수 있는가?` | `faq.recruiter.growth_potential.default` | `default` | `recruiter_honest_card` |
| 13 | `이상적 환경` | `어떤 팀과 회사 환경에서 최고의 성과를 내는가?` | `faq.recruiter.ideal_environment.default` | `default` | `collaboration_fit_card` |
| 14 | `첫 30일` | `첫 30일 안에 어떻게 기여할 수 있는가?` | `faq.recruiter.first_30_days.default` | `default` | `thirty_day_plan_timeline` |
| 15 | `첫 질문들` | `입사하면 제일 먼저 어떤 질문을 할 것 같은가?` | `faq.recruiter.onboarding_questions.default` | `default` | `recruiter_honest_card` |

### `recruiter_defense` 서피스 표시 로직

```text
recruiter_defense 서피스 트리거 조건:
- 유저가 채용담당자, 채용 매니저, 또는 면접관으로 자기 소개할 때
- 유저가 recruiter defense FAQ 패턴 중 하나라도 물어볼 때
- 질문에 다음을 포함할 때: "채용", "근무", "리스크", "깊이", "그만두다", "약점", "포지션"

recruiter_defense 활성화 시:
- 대화 맥락에 따라 가장 관련 있는 리크루터 질문 5개 표시
- 다른 서피스의 캐주얼/재미 질문 억제
- 모든 답변은 `default` 또는 `detailed` 변형으로 반환 (`short` 아님)
- 지원되는 경우 UI에 미묘한 "채용담당자 뷰" 모드 표시기 추가
```

---

## 16. Rich Answer Rendering — v12 확장

### 새 RenderSpec: `recruiter_honest_card`

| 구성요소 | 내용 |
| --- | --- |
| 헤더 | 질문 레이블 + "솔직한 평가" 배지 |
| 본문 | 3부 구조: 우려 인정 → 증거가 보여주는 것 → 솔직한 조건 또는 주의사항 |
| 푸터 | 선택사항: "특정 프로젝트에 대해 물어보기" 또는 "협업 스타일 보기" 후속 칩 |
| 톤 배지 | `honest_assessment` (`faq_cache` 또는 `rag_generation`과 구별) |

이 컴포넌트는 답변이 PR처럼 느껴지지 않도록 특별히 설계되었습니다. 시각적 디자인은 이것이 마케팅 카피가 아닌 조정되고 솔직한 평가임을 강화해야 합니다.

---

## Open TODO — v12 추가 항목

| 우선순위 | TODO |
| --- | --- |
| 0 | `data/faq-answers.ko.ts`에 recruiter defense FAQ ID 통합 |
| 0 | `data/question-surfaces.ko.ts`에 `recruiter_defense` 서피스 등록 |
| 1 | `components/chat/rich/`에 `RecruiterHonestCard.tsx` 컴포넌트 구축 |
| 1 | `/api/chat` 라우팅에 recruiter 서피스 트리거 감지 로직 추가 |
| 2 | `notion-wiki-draft-v12-en-add.md`에 영어 동등 항목 추가 (완료됨) |
| 3 | mock 리크루터 질문으로 recruiter FAQ 답변 품질 평가 |
