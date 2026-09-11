import { NextResponse } from 'next/server';
import { AttemptRepository } from '@/infrastructure/repositories/AttemptRepository';
import { ProblemRepository } from '@/infrastructure/repositories/ProblemRepository';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attemptRepo = new AttemptRepository();
    const problemRepo = new ProblemRepository();

    const attempt = await attemptRepo.getById(params.id);
    if (!attempt) {
      return NextResponse.json({ success: false, error: 'Attempt not found' }, { status: 404 });
    }

    const problem = await problemRepo.getById(attempt.problemId);

    return NextResponse.json({
      success: true,
      attempt: attempt.toJSON(),
      problem,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
