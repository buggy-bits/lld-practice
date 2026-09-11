import { NextResponse } from 'next/server';
import { ProblemRepository } from '@/infrastructure/repositories/ProblemRepository';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const problemRepo = new ProblemRepository();
    const problem = await problemRepo.getById(params.id);

    if (!problem) {
      return NextResponse.json({ success: false, error: 'Problem not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, problem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
