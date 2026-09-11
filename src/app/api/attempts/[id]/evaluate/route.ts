import { NextResponse } from 'next/server';
import { EvaluateAttemptUseCase } from '@/application/EvaluateAttempt';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const evaluateUseCase = new EvaluateAttemptUseCase();
    const result = await evaluateUseCase.execute(params.id, { forceRetry: true });

    return NextResponse.json({
      success: true,
      attempt: result.attempt.toJSON(),
      evaluation: result.evaluation,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
