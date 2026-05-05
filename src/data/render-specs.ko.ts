import type { RenderSpecDefinition } from './render-specs.shared';

export const renderSpecsKo = [
  {
    key: 'profile_hero_card',
    component: 'ProfileHeroCard',
    priority: 'A',
    title: 'Profile hero',
    description:
      '프로필 이미지, 이름, 타이틀, 위치, 핵심 칩을 먼저 보여줍니다.',
  },
  {
    key: 'project_showcase_carousel',
    component: 'ProjectShowcaseCarousel',
    priority: 'A',
    title: 'Project showcase',
    description:
      '대표 프로젝트와 확장 프로젝트 레일을 함께 보여 성장 흐름을 설명합니다.',
  },
  {
    key: 'skills_cloud_card',
    component: 'SkillsCloudCard',
    priority: 'A',
    title: 'Skills cloud',
    description: '기술 카테고리별 pill chip과 프로젝트 근거를 묶습니다.',
  },
  {
    key: 'contact_opportunity_card',
    component: 'ContactOpportunityCard',
    priority: 'A',
    title: 'Contact opportunity',
    description:
      '연락 채널, 관심 역할, 협업 포인트를 정보 블록으로 보여줍니다.',
  },
  {
    key: 'tooling_workflow_steps',
    component: 'ToolingWorkflowSteps',
    priority: 'A',
    title: 'AI tooling workflow',
    description:
      'Plan, build, review, test, ship 흐름을 단계 카드로 보여줍니다.',
  },
  {
    key: 'product_spotlight_card',
    component: 'ProductSpotlightCard',
    priority: 'A',
    title: 'Product spotlight',
    description: 'AskOosu의 문제의식과 핵심 구조를 프로젝트 카드로 강조합니다.',
  },
  {
    key: 'architecture_steps_diagram',
    component: 'ArchitectureStepsDiagram',
    priority: 'B',
    title: 'Architecture steps',
    description:
      'Notion, sync, DB, search, model, UI 흐름을 단계로 보여줍니다.',
  },
  {
    key: 'deployment_stack_flow',
    component: 'DeploymentStackFlow',
    priority: 'A',
    title: 'Deployment stack',
    description: '콘텐츠, 앱, 데이터, 인프라/도메인 층을 카드로 분리합니다.',
  },
  {
    key: 'comparison_grid',
    component: 'ComparisonGrid',
    priority: 'A',
    title: 'Comparison grid',
    description: '두 개념 또는 두 프로젝트를 2열 비교표로 설명합니다.',
  },
  {
    key: 'project_tech_usage_cards',
    component: 'ProjectTechUsageCards',
    priority: 'A',
    title: 'Project tech usage',
    description:
      '프로젝트별 백엔드/DB 사용 맥락과 배운 점을 카드로 보여줍니다.',
  },
  {
    key: 'thirty_day_plan_timeline',
    component: 'ThirtyDayPlanTimeline',
    priority: 'A',
    title: '30-day plan',
    description:
      '0-10일, 10-20일, 20-30일 기여 계획을 타임라인으로 보여줍니다.',
  },
  {
    key: 'collaboration_fit_card',
    component: 'CollaborationFitCard',
    priority: 'A',
    title: 'Collaboration fit',
    description: '관심 프로젝트 유형과 잘 맞는 이유를 카드로 보여줍니다.',
  },
  {
    key: 'ui_principles_cards',
    component: 'UiPrinciplesCards',
    priority: 'A',
    title: 'UI principles',
    description: 'AskOosu UI/UX 원칙을 3-4개 카드로 보여줍니다.',
  },
] satisfies RenderSpecDefinition[];
