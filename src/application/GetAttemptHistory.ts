import { AttemptRepository } from '@/infrastructure/repositories/AttemptRepository';

export class GetAttemptHistoryUseCase {
  constructor(private attemptRepo = new AttemptRepository()) {}

  async execute(problemId?: string) {
    return await this.attemptRepo.getHistoryByProblemId(problemId);
  }
}
