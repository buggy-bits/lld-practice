import { AttemptRepository } from '@/infrastructure/repositories/AttemptRepository';
import { ProblemRepository } from '@/infrastructure/repositories/ProblemRepository';
import { Evaluator, EvaluationResult } from '@/domain/evaluation/Evaluator';
import { LlmEvaluator } from '@/domain/evaluation/LlmEvaluator';
import { Attempt } from '@/domain/attempt/Attempt';

export class EvaluateAttemptUseCase {
  constructor(
    private attemptRepo = new AttemptRepository(),
    private problemRepo = new ProblemRepository(),
    private evaluator: Evaluator = new LlmEvaluator()
  ) {}

  async execute(attemptId: string, options: { forceRetry?: boolean } = {}): Promise<{ attempt: Attempt; evaluation: EvaluationResult | null }> {
    const attempt = await this.attemptRepo.getById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt with ID "${attemptId}" not found.`);
    }

    // Duplicate evaluation protection
    if (attempt.status === 'COMPLETED' && !options.forceRetry) {
      return { attempt, evaluation: attempt.evaluation };
    }

    if (attempt.status === 'EVALUATING' && !options.forceRetry) {
      return { attempt, evaluation: null };
    }

    if (attempt.status === 'DRAFT') {
      throw new Error('Attempt is still in DRAFT status. Submit the attempt before evaluating.');
    }

    if (!attempt.submission) {
      throw new Error('No submission content found for this attempt.');
    }

    const problem = await this.problemRepo.getById(attempt.problemId);
    if (!problem) {
      throw new Error(`Associated problem "${attempt.problemId}" not found.`);
    }

    // Update status to EVALUATING
    await this.attemptRepo.updateStatus(attemptId, 'EVALUATING');

    try {
      const evaluationResult = await this.evaluator.evaluate({
        problem,
        submission: attempt.submission,
        attemptId: attempt.id,
      });

      // Persist evaluation and transition to COMPLETED
      await this.attemptRepo.saveEvaluation(attemptId, evaluationResult);

      const updatedAttempt = await this.attemptRepo.getById(attemptId);
      return {
        attempt: updatedAttempt!,
        evaluation: evaluationResult,
      };
    } catch (error) {
      console.error(`[EvaluateAttemptUseCase] Evaluation failed for attempt ${attemptId}:`, error);

      // Transition to FAILED status
      await this.attemptRepo.updateStatus(attemptId, 'FAILED');
      const failedAttempt = await this.attemptRepo.getById(attemptId);

      return {
        attempt: failedAttempt!,
        evaluation: null,
      };
    }
  }
}
