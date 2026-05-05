export type QuestionSurface =
  | 'home'
  | 'project.askoosu'
  | 'project.instagram'
  | 'project.sticks'
  | 'project.portfoliooh'
  | 'profile'
  | 'skills'
  | 'fun'
  | 'contact'
  | 'recruiter'
  | 'after_answer'
  | 'typed_only';

export type AnswerVariant = 'short' | 'default' | 'detailed';

export type QuestionTrigger = {
  id: string;
  faqId: string;
  surface: QuestionSurface;
  priority: number;
  quickLabel: string;
  displayQuestion: string;
  answerVariant: AnswerVariant;
  renderSpec?: string;
  visibleByDefault: boolean;
};

export function sortQuestionTriggers(triggers: QuestionTrigger[]) {
  return [...triggers].sort((a, b) => a.priority - b.priority);
}
