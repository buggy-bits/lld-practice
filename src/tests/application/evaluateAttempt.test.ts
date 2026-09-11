import { describe, it, expect, vi } from 'vitest';
import { EvaluateAttemptUseCase } from '@/application/EvaluateAttempt';
import { Attempt } from '@/domain/attempt/Attempt';
import { TextSubmission } from '@/domain/submission/Submission';
import { RuleBasedEvaluator } from '@/domain/evaluation/RuleBasedEvaluator';

describe('EvaluateAttemptUseCase Application Service', () => {
  it('prevents duplicate evaluation if attempt is already COMPLETED', async () => {
    const mockAttempt = new Attempt({
      id: 'att-completed',
      problemId: 'prob-1',
      status: 'COMPLETED',
      attemptNumber: 1,
      createdAt: new Date(),
      submission: new TextSubmission({
        assumptions: 'Assumptions here',
        classes: 'Classes here',
        responsibilities: 'Responsibilities here',
        explanation: 'Explanation here',
      }),
      evaluation: {
        overallScore: 8.5,
        criterionScores: [],
        feedbackItems: [],
        followUpQuestions: [],
        evaluatorType: 'RULE_BASED',
      },
    });

    const mockAttemptRepo: any = {
      getById: vi.fn().mockResolvedValue(mockAttempt),
      updateStatus: vi.fn(),
      saveEvaluation: vi.fn(),
    };

    const mockProblemRepo: any = {
      getById: vi.fn(),
    };

    const evaluator = new RuleBasedEvaluator();
    const useCase = new EvaluateAttemptUseCase(mockAttemptRepo, mockProblemRepo, evaluator);

    const result = await useCase.execute('att-completed');

    expect(result.attempt.status).toBe('COMPLETED');
    expect(result.evaluation?.overallScore).toBe(8.5);
    // Should NOT trigger database update or evaluator calls
    expect(mockAttemptRepo.updateStatus).not.toHaveBeenCalled();
    expect(mockAttemptRepo.saveEvaluation).not.toHaveBeenCalled();
  });
});
