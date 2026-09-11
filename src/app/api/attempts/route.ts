import { NextResponse } from 'next/server';
import { GetAttemptHistoryUseCase } from '@/application/GetAttemptHistory';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId') || undefined;

    const historyUseCase = new GetAttemptHistoryUseCase();
    const history = await historyUseCase.execute(problemId);

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
