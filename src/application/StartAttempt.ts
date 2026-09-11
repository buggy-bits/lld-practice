import { ProblemRepository } from '@/infrastructure/repositories/ProblemRepository';
import { AttemptRepository } from '@/infrastructure/repositories/AttemptRepository';
import { Attempt } from '@/domain/attempt/Attempt';

export class StartAttemptUseCase {
  constructor(
    private problemRepo = new ProblemRepository(),
    private attemptRepo = new AttemptRepository()
  ) {}

  async execute(problemIdOrSlug: string): Promise<Attempt> {
    const problem = await this.problemRepo.getById(problemIdOrSlug);
    if (!problem) {
      throw new Error(`Problem with ID/slug "${problemIdOrSlug}" not found.`);
    }

    return await this.attemptRepo.createAttempt(problem.id);
  }
}
