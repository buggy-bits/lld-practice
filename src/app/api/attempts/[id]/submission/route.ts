import { NextResponse } from 'next/server';
import { SubmitAttemptUseCase } from '@/application/SubmitAttempt';
import { EvaluateAttemptUseCase } from '@/application/EvaluateAttempt';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const submitUseCase = new SubmitAttemptUseCase();

    const attempt = await submitUseCase.execute(params.id, {
      assumptions: body.assumptions,
      classes: body.classes,
      responsibilities: body.responsibilities,
      explanation: body.explanation,
      additionalNotes: body.additionalNotes,
    });

    // Start background evaluation asynchronously
    const evaluateUseCase = new EvaluateAttemptUseCase();
    evaluateUseCase.execute(params.id).catch((err) => {
      console.error(`Async evaluation failed for attempt ${params.id}:`, err);
    });

    return NextResponse.json({
      success: true,
      message: 'Submission received. Evaluation started.',
      attempt: attempt.toJSON(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
