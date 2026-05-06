export type RenderSpecKey =
  | 'profile_hero_card'
  | 'project_showcase_carousel'
  | 'skills_cloud_card'
  | 'fun_story_card'
  | 'contact_opportunity_card'
  | 'product_spotlight_card'
  | 'architecture_steps_diagram'
  | 'deployment_stack_flow'
  | 'comparison_grid'
  | 'project_tech_usage_cards'
  | 'thirty_day_plan_timeline'
  | 'collaboration_fit_card'
  | 'tooling_workflow_steps'
  | 'ui_principles_cards'
  | 'project_learning_card'
  | 'before_after_case_card'
  | 'stack_summary_card'
  | 'strength_cards'
  | 'career_timeline_card'
  | 'bridge_story_card'
  | 'value_summary_card';

export type RenderSpecDefinition = {
  key: RenderSpecKey;
  component:
    | 'ProfileHeroCard'
    | 'ProjectShowcaseCarousel'
    | 'SkillsCloudCard'
    | 'FunStoryCard'
    | 'ContactOpportunityCard'
    | 'ArchitectureStepsDiagram'
    | 'DeploymentStackFlow'
    | 'ComparisonGrid'
    | 'ProjectTechUsageCards'
    | 'ThirtyDayPlanTimeline'
    | 'CollaborationFitCard'
    | 'ToolingWorkflowSteps'
    | 'UiPrinciplesCards'
    | 'ProductSpotlightCard';
  priority: 'A' | 'B' | 'C';
  title: string;
  description: string;
};
