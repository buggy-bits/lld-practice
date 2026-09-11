import { NextResponse } from 'next/server';
import { ProblemRepository } from '@/infrastructure/repositories/ProblemRepository';
import { AttemptRepository } from '@/infrastructure/repositories/AttemptRepository';

export async function GET() {
  try {
    const problemRepo = new ProblemRepository();
    const attemptRepo = new AttemptRepository();

    const problems = await problemRepo.getAll();
    const history = await attemptRepo.getHistoryByProblemId();

    const result = problems.map((p) => {
      const pHistory = history.filter((h) => h.problemId === p.id);
      const completedScores = pHistory
        .map((h) => h.score)
        .filter((s): s is number => typeof s === 'number');

      return {
        ...p,
        totalAttempts: pHistory.length,
        bestScore: completedScores.length > 0 ? Math.max(...completedScores) : null,
      };
    });

    return NextResponse.json({ success: true, problems: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
