import { describe, it, expect } from 'vitest';
import { Attempt } from '@/domain/attempt/Attempt';
import { TextSubmission } from '@/domain/submission/Submission';

describe('Attempt Domain Entity & State Machine', () => {
  it('should initialize attempt in DRAFT status', () => {
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      status: 'DRAFT',
      attemptNumber: 1,
      createdAt: new Date(),
    });

    expect(attempt.status).toBe('DRAFT');
    expect(attempt.submission).toBeNull();
    expect(attempt.evaluation).toBeNull();
  });

  it('should validate and submit valid text submission', () => {
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      status: 'DRAFT',
      attemptNumber: 1,
      createdAt: new Date(),
    });

    const submission = new TextSubmission({
      assumptions: 'Assuming single entry gate per parking floor',
      classes: 'Vehicle, ParkingLot, ParkingFloor, Spot, PricingStrategy',
      responsibilities: 'ParkingLot manages floors. Spot tracks occupancy.',
      explanation: 'Using PricingStrategy interface for flexible pricing rules.',
    });

    attempt.submit(submission);

    expect(attempt.status).toBe('SUBMITTED');
    expect(attempt.submittedAt).toBeInstanceOf(Date);
    expect(attempt.submission).toBeDefined();
  });

  it('should reject invalid or empty submission', () => {
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      status: 'DRAFT',
      attemptNumber: 1,
      createdAt: new Date(),
    });

    const emptySubmission = new TextSubmission({
      assumptions: '',
      classes: '',
      responsibilities: '',
      explanation: '',
    });

    expect(() => attempt.submit(emptySubmission)).toThrowError(/validation failed/i);
  });

  it('should handle evaluation state transitions: SUBMITTED -> EVALUATING -> COMPLETED', () => {
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      status: 'SUBMITTED',
      attemptNumber: 1,
      createdAt: new Date(),
    });

    attempt.startEvaluating();
    expect(attempt.status).toBe('EVALUATING');

    attempt.completeEvaluation({
      overallScore: 8.5,
      criterionScores: [],
      feedbackItems: [],
      followUpQuestions: ['How to support EV charging?'],
      evaluatorType: 'RULE_BASED',
    });

    expect(attempt.status).toBe('COMPLETED');
    expect(attempt.evaluation?.overallScore).toBe(8.5);
  });

  it('should allow retrying evaluation when status is FAILED', () => {
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      status: 'EVALUATING',
      attemptNumber: 1,
      createdAt: new Date(),
    });

    attempt.failEvaluation('AI API timeout');
    expect(attempt.status).toBe('FAILED');
    expect(attempt.canRetry()).toBe(true);

    attempt.retryEvaluation();
    expect(attempt.status).toBe('EVALUATING');
  });
});
