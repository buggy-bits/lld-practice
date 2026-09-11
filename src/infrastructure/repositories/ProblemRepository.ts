import { prisma } from '../database/db';
import { Problem } from '@/domain/problem/Problem';

export class ProblemRepository {
  async getAll(): Promise<Problem[]> {
    const raw = await prisma.problem.findMany({
      orderBy: { title: 'asc' },
    });

    return raw.map(p => this.toDomain(p));
  }

  async getById(id: string): Promise<Problem | null> {
    const raw = await prisma.problem.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!raw) return null;
    return this.toDomain(raw);
  }

  private toDomain(raw: any): Problem {
    return {
      id: raw.id,
      slug: raw.slug,
      title: raw.title,
      description: raw.description,
      difficulty: raw.difficulty as 'Easy' | 'Medium' | 'Hard',
      requirements: JSON.parse(raw.requirements),
      constraints: raw.constraints ? JSON.parse(raw.constraints) : undefined,
      rubric: JSON.parse(raw.rubric),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
