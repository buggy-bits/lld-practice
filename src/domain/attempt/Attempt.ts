import { Submission } from '../submission/Submission';
import { EvaluationResult } from '../evaluation/Evaluator';

export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export interface AttemptData {
  id: string;
  problemId: string;
  status: AttemptStatus;
  attemptNumber: number;
  createdAt: Date;
  submittedAt?: Date | null;
  submission?: Submission | null;
  evaluation?: EvaluationResult | null;
}

export class Attempt {
  readonly id: string;
  readonly problemId: string;
  private _status: AttemptStatus;
  readonly attemptNumber: number;
  readonly createdAt: Date;
  private _submittedAt: Date | null;
  private _submission: Submission | null;
  private _evaluation: EvaluationResult | null;

  constructor(data: AttemptData) {
    this.id = data.id;
    this.problemId = data.problemId;
    this._status = data.status;
    this.attemptNumber = data.attemptNumber;
    this.createdAt = data.createdAt;
    this._submittedAt = data.submittedAt || null;
    this._submission = data.submission || null;
    this._evaluation = data.evaluation || null;
  }

  get status(): AttemptStatus {
    return this._status;
  }

  get submittedAt(): Date | null {
    return this._submittedAt;
  }

  get submission(): Submission | null {
    return this._submission;
  }

  get evaluation(): EvaluationResult | null {
    return this._evaluation;
  }

  submit(submission: Submission): void {
    if (this._status !== 'DRAFT') {
      throw new Error(`Cannot submit attempt in status: ${this._status}. Only DRAFT attempts can be submitted.`);
    }

    const validation = submission.validate();
    if (!validation.isValid) {
      throw new Error(`Submission validation failed: ${validation.errors.join(' ')}`);
    }

    this._submission = submission;
    this._status = 'SUBMITTED';
    this._submittedAt = new Date();
  }

  startEvaluating(): void {
    if (this._status !== 'SUBMITTED' && this._status !== 'FAILED') {
      throw new Error(`Cannot start evaluation for attempt in status: ${this._status}. Must be SUBMITTED or FAILED.`);
    }
    this._status = 'EVALUATING';
  }

  completeEvaluation(result: EvaluationResult): void {
    if (this._status !== 'EVALUATING') {
      throw new Error(`Cannot complete evaluation for attempt in status: ${this._status}. Must be EVALUATING.`);
    }
    this._evaluation = result;
    this._status = 'COMPLETED';
  }

  failEvaluation(reason?: string): void {
    if (this._status !== 'EVALUATING') {
      throw new Error(`Cannot fail evaluation for attempt in status: ${this._status}. Must be EVALUATING.`);
    }
    this._status = 'FAILED';
  }

  canRetry(): boolean {
    return this._status === 'FAILED';
  }

  retryEvaluation(): void {
    if (!this.canRetry()) {
      throw new Error(`Cannot retry evaluation for attempt in status: ${this._status}. Only FAILED attempts can be retried.`);
    }
    this._status = 'EVALUATING';
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      problemId: this.problemId,
      status: this._status,
      attemptNumber: this.attemptNumber,
      createdAt: this.createdAt,
      submittedAt: this._submittedAt,
      submission: this._submission ? this._submission.toJSON() : null,
      evaluation: this._evaluation,
    };
  }
}
