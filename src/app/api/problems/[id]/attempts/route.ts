import { NextResponse } from 'next/server';
import { StartAttemptUseCase } from '@/application/StartAttempt';
import { rateLimiter, getClientIp } from '@/lib/rateLimit';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req);

    // Rate limit check: Max 10 attempt creations per IP per 5 minutes
    const rateCheck = rateLimiter.check('startAttempt', ip, 10, 5 * 60 * 1000);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many attempt creation requests. Please wait ${Math.ceil(rateCheck.resetTimeMs / 1000)} seconds before starting a new attempt.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateCheck.resetTimeMs / 1000)),
          },
        }
      );
    }

    const startAttempt = new StartAttemptUseCase();
    const attempt = await startAttempt.execute(params.id);

    return NextResponse.json({
      success: true,
      attempt: attempt.toJSON(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
