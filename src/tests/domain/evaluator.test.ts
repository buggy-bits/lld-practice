import { describe, it, expect } from 'vitest';
import { RuleBasedEvaluator } from '@/domain/evaluation/RuleBasedEvaluator';
import { LlmEvaluator } from '@/domain/evaluation/LlmEvaluator';
import { TextSubmission } from '@/domain/submission/Submission';
import { Problem } from '@/domain/problem/Problem';

describe('Evaluator Abstraction & Evaluation Logic', () => {
  const sampleProblem: Problem = {
    id: 'prob-1',
    slug: 'parking-lot',
    title: 'Parking Lot',
    difficulty: 'Medium',
    description: 'Design a parking lot system.',
    requirements: ['Support multiple floors', 'Calculate parking fees', 'Generate tickets'],
    rubric: { criteria: [] },
  };

  const sampleSubmission = new TextSubmission({
    assumptions: 'Single entrance per floor. Multiple vehicle types supported.',
    classes: 'ParkingLot, ParkingFloor, Spot, PricingStrategy, Ticket',
    responsibilities: 'ParkingLot manages floors. Spot tracks occupancy. PricingStrategy calculates fees.',
    explanation: 'Used PricingStrategy interface to decouple pricing from parking lot management.',
  });

  it('RuleBasedEvaluator produces structured evaluation result with scores and feedback', async () => {
    const evaluator = new RuleBasedEvaluator();
    const result = await evaluator.evaluate({
      problem: sampleProblem,
      submission: sampleSubmission,
      attemptId: 'att-1',
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(10);
    expect(result.criterionScores.length).toBeGreaterThan(0);
    expect(result.feedbackItems.length).toBeGreaterThan(0);
    expect(result.followUpQuestions.length).toBeGreaterThan(0);
    expect(result.evaluatorType).toBe('RULE_BASED');
  });

  it('LlmEvaluator falls back cleanly to RuleBasedEvaluator when no API keys are present', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const llmEvaluator = new LlmEvaluator();
    const result = await llmEvaluator.evaluate({
      problem: sampleProblem,
      submission: sampleSubmission,
      attemptId: 'att-1',
    });

    expect(result).toBeDefined();
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.evaluatorType).toBe('RULE_BASED');
  });
});
