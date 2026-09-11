import { prisma } from '../database/db';
import { Attempt, AttemptStatus } from '@/domain/attempt/Attempt';
import { TextSubmission } from '@/domain/submission/Submission';
import { EvaluationResult } from '@/domain/evaluation/Evaluator';

export class AttemptRepository {
  async getById(id: string): Promise<Attempt | null> {
    const raw = await prisma.attempt.findUnique({
      where: { id },
      include: {
        submission: true,
        evaluation: {
          include: {
            criterionScores: true,
            feedbackItems: true,
            followUpQuestions: true,
          },
        },
      },
    });

    if (!raw) return null;
    return this.toDomain(raw);
  }

  async countByProblemId(problemId: string): Promise<number> {
    return await prisma.attempt.count({
      where: { problemId },
    });
  }

  async createAttempt(problemId: string): Promise<Attempt> {
    const nextAttemptNum = (await this.countByProblemId(problemId)) + 1;
    const created = await prisma.attempt.create({
      data: {
        problemId,
        status: 'DRAFT',
        attemptNumber: nextAttemptNum,
      },
    });
    return new Attempt({
      id: created.id,
      problemId: created.problemId,
      status: 'DRAFT',
      attemptNumber: created.attemptNumber,
      createdAt: created.createdAt,
    });
  }

  async saveSubmission(attemptId: string, submission: TextSubmission): Promise<void> {
    await prisma.$transaction([
      prisma.submission.upsert({
        where: { attemptId },
        create: {
          attemptId,
          type: submission.type,
          assumptions: submission.assumptions,
          classes: submission.classes,
          responsibilities: submission.responsibilities,
          explanation: submission.explanation,
          additionalNotes: submission.additionalNotes,
        },
        update: {
          assumptions: submission.assumptions,
          classes: submission.classes,
          responsibilities: submission.responsibilities,
          explanation: submission.explanation,
          additionalNotes: submission.additionalNotes,
        },
      }),
      prisma.attempt.update({
        where: { id: attemptId },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      }),
    ]);
  }

  async updateStatus(attemptId: string, status: AttemptStatus): Promise<void> {
    await prisma.attempt.update({
      where: { id: attemptId },
      data: { status },
    });
  }

  async saveEvaluation(attemptId: string, result: EvaluationResult): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Clear previous evaluations if retrying
      const existingEval = await tx.evaluation.findUnique({ where: { attemptId } });
      if (existingEval) {
        await tx.evaluation.delete({ where: { id: existingEval.id } });
      }

      await tx.evaluation.create({
        data: {
          attemptId,
          status: 'COMPLETED',
          overallScore: result.overallScore,
          evaluatorType: result.evaluatorType,
          completedAt: new Date(),
          criterionScores: {
            create: result.criterionScores.map((c) => ({
              criterion: c.criterion,
              score: c.score,
              evidence: c.evidence,
              concern: c.concern,
              suggestion: c.suggestion,
            })),
          },
          feedbackItems: {
            create: result.feedbackItems.map((f) => ({
              category: f.category,
              severity: f.severity,
              evidence: f.evidence,
              concern: f.concern,
              suggestion: f.suggestion,
              confidence: f.confidence,
            })),
          },
          followUpQuestions: {
            create: result.followUpQuestions.map((q) => ({
              question: q,
            })),
          },
        },
      });

      await tx.attempt.update({
        where: { id: attemptId },
        data: { status: 'COMPLETED' },
      });
    });
  }

  async getHistoryByProblemId(problemId?: string): Promise<any[]> {
    const attempts = await prisma.attempt.findMany({
      where: problemId ? { problemId } : undefined,
      orderBy: [{ problemId: 'asc' }, { attemptNumber: 'asc' }],
      include: {
        problem: {
          select: { title: true, slug: true, difficulty: true },
        },
        submission: true,
        evaluation: {
          include: {
            criterionScores: true,
            feedbackItems: true,
            followUpQuestions: true,
          },
        },
      },
    });

    return attempts.map((a) => ({
      id: a.id,
      problemId: a.problemId,
      problemTitle: a.problem.title,
      problemSlug: a.problem.slug,
      difficulty: a.problem.difficulty,
      attemptNumber: a.attemptNumber,
      status: a.status,
      createdAt: a.createdAt,
      submittedAt: a.submittedAt,
      score: a.evaluation?.overallScore ?? null,
      evaluation: a.evaluation
        ? {
            overallScore: a.evaluation.overallScore,
            evaluatorType: a.evaluation.evaluatorType,
            completedAt: a.evaluation.completedAt,
            criterionScores: a.evaluation.criterionScores,
            feedbackItems: a.evaluation.feedbackItems,
            followUpQuestions: a.evaluation.followUpQuestions.map((q) => q.question),
          }
        : null,
      submission: a.submission
        ? {
            assumptions: a.submission.assumptions,
            classes: a.submission.classes,
            responsibilities: a.submission.responsibilities,
            explanation: a.submission.explanation,
            additionalNotes: a.submission.additionalNotes,
          }
        : null,
    }));
  }

  private toDomain(raw: any): Attempt {
    let sub: TextSubmission | null = null;
    if (raw.submission) {
      sub = new TextSubmission({
        assumptions: raw.submission.assumptions,
        classes: raw.submission.classes,
        responsibilities: raw.submission.responsibilities,
        explanation: raw.submission.explanation,
        additionalNotes: raw.submission.additionalNotes,
      });
    }

    let evalRes: EvaluationResult | null = null;
    if (raw.evaluation) {
      evalRes = {
        overallScore: raw.evaluation.overallScore,
        evaluatorType: raw.evaluation.evaluatorType as any,
        criterionScores: raw.evaluation.criterionScores.map((c: any) => ({
          criterion: c.criterion,
          score: c.score,
          evidence: c.evidence,
          concern: c.concern || undefined,
          suggestion: c.suggestion || undefined,
        })),
        feedbackItems: raw.evaluation.feedbackItems.map((f: any) => ({
          category: f.category,
          severity: f.severity as any,
          evidence: f.evidence,
          concern: f.concern,
          suggestion: f.suggestion,
          confidence: f.confidence as any,
        })),
        followUpQuestions: raw.evaluation.followUpQuestions.map((q: any) => q.question),
      };
    }

    return new Attempt({
      id: raw.id,
      problemId: raw.problemId,
      status: raw.status as AttemptStatus,
      attemptNumber: raw.attemptNumber,
      createdAt: raw.createdAt,
      submittedAt: raw.submittedAt,
      submission: sub,
      evaluation: evalRes,
    });
  }
}
