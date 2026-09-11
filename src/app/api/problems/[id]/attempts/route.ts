import { NextResponse } from 'next/server';
import { StartAttemptUseCase } from '@/application/StartAttempt';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
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
