import { AttemptRepository } from '@/infrastructure/repositories/AttemptRepository';
import { TextSubmission, TextSubmissionData } from '@/domain/submission/Submission';
import { Attempt } from '@/domain/attempt/Attempt';

export class SubmitAttemptUseCase {
  constructor(private attemptRepo = new AttemptRepository()) {}

  async execute(attemptId: string, submissionData: TextSubmissionData): Promise<Attempt> {
    const attempt = await this.attemptRepo.getById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt with ID "${attemptId}" not found.`);
    }

    if (attempt.status !== 'DRAFT') {
      throw new Error(`Cannot submit attempt in status: ${attempt.status}. Only DRAFT attempts can be submitted.`);
    }

    const submission = new TextSubmission(submissionData);
    const validation = submission.validate();

    if (!validation.isValid) {
      throw new Error(`Submission validation failed: ${validation.errors.join(' ')}`);
    }

    attempt.submit(submission);
    await this.attemptRepo.saveSubmission(attemptId, submission);

    return attempt;
  }
}
