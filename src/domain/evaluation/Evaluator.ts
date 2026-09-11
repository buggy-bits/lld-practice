import { Problem } from '../problem/Problem';
import { Submission } from '../submission/Submission';

export type FeedbackSeverity = 'good' | 'suggestion' | 'concern';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CriterionScoreResult {
  criterion: string;
  score: number; // 0 - 10
  evidence: string;
  concern?: string;
  suggestion?: string;
}

export interface FeedbackItemResult {
  category: string;
  severity: FeedbackSeverity;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: ConfidenceLevel;
}

export interface EvaluationResult {
  overallScore: number; // 0 - 10
  criterionScores: CriterionScoreResult[];
  feedbackItems: FeedbackItemResult[];
  followUpQuestions: string[];
  evaluatorType: 'LLM' | 'MOCK' | 'RULE_BASED';
}

export interface EvaluationContext {
  problem: Problem;
  submission: Submission;
  attemptId: string;
  previousAttemptsCount?: number;
}

export interface Evaluator {
  readonly name: string;
  evaluate(context: EvaluationContext): Promise<EvaluationResult>;
}
