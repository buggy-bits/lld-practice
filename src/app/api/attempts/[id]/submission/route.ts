import { NextResponse } from 'next/server';
import { SubmitAttemptUseCase } from '@/application/SubmitAttempt';
import { EvaluateAttemptUseCase } from '@/application/EvaluateAttempt';
import { rateLimiter, getClientIp } from '@/lib/rateLimit';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req);

    // Rate limit check: Max 5 submissions per IP per 5 minutes
    const rateCheck = rateLimiter.check('submission', ip, 5, 5 * 60 * 1000);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many submissions. Please wait ${Math.ceil(rateCheck.resetTimeMs / 1000)} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateCheck.resetTimeMs / 1000)),
          },
        }
      );
    }

    const bodyText = await req.text();
    if (bodyText.length > 15 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Request payload exceeds maximum allowed size of 15KB.' },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);
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
