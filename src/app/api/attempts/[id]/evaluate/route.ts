import { NextResponse } from 'next/server';
import { EvaluateAttemptUseCase } from '@/application/EvaluateAttempt';
import { rateLimiter, getClientIp } from '@/lib/rateLimit';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req);

    // Rate limit check: Max 5 evaluations per IP per 5 minutes
    const rateCheck = rateLimiter.check('evaluate', ip, 5, 5 * 60 * 1000);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many evaluation retries. Please wait ${Math.ceil(rateCheck.resetTimeMs / 1000)} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateCheck.resetTimeMs / 1000)),
          },
        }
      );
    }

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
