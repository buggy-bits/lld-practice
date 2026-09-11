export type SubmissionType = 'TEXT' | 'DIAGRAM' | 'CODE';

export interface SubmissionValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface Submission {
  type: SubmissionType;
  validate(): SubmissionValidationResult;
  getSummaryText(): string;
  toJSON(): Record<string, unknown>;
}

export interface TextSubmissionData {
  assumptions: string;
  classes: string;
  responsibilities: string;
  explanation: string;
  additionalNotes?: string;
}

export class TextSubmission implements Submission {
  readonly type: SubmissionType = 'TEXT';
  readonly assumptions: string;
  readonly classes: string;
  readonly responsibilities: string;
  readonly explanation: string;
  readonly additionalNotes?: string;

  constructor(data: TextSubmissionData) {
    this.assumptions = data.assumptions?.trim() || '';
    this.classes = data.classes?.trim() || '';
    this.responsibilities = data.responsibilities?.trim() || '';
    this.explanation = data.explanation?.trim() || '';
    this.additionalNotes = data.additionalNotes?.trim();
  }

  validate(): SubmissionValidationResult {
    const errors: string[] = [];

    // Minimum Length Checks
    if (!this.assumptions) {
      errors.push('Assumptions are required.');
    } else if (this.assumptions.length < 10) {
      errors.push('Assumptions section must be at least 10 characters long.');
    } else if (this.assumptions.length > 2000) {
      errors.push('Assumptions section exceeds maximum limit of 2,000 characters.');
    }

    if (!this.classes) {
      errors.push('Classes and interfaces section is required.');
    } else if (this.classes.length < 10) {
      errors.push('Classes/interfaces section must contain meaningful detail (at least 10 characters).');
    } else if (this.classes.length > 3000) {
      errors.push('Classes/interfaces section exceeds maximum limit of 3,000 characters.');
    }

    if (!this.responsibilities) {
      errors.push('Responsibilities and relationships section is required.');
    } else if (this.responsibilities.length < 15) {
      errors.push('Responsibilities section must be at least 15 characters long.');
    } else if (this.responsibilities.length > 4000) {
      errors.push('Responsibilities section exceeds maximum limit of 4,000 characters.');
    }

    if (!this.explanation) {
      errors.push('Design explanation section is required.');
    } else if (this.explanation.length < 15) {
      errors.push('Design explanation section must be at least 15 characters long.');
    } else if (this.explanation.length > 5000) {
      errors.push('Design explanation section exceeds maximum limit of 5,000 characters.');
    }

    if (this.additionalNotes && this.additionalNotes.length > 2000) {
      errors.push('Additional notes section exceeds maximum limit of 2,000 characters.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getSummaryText(): string {
    return `
--- ASSUMPTIONS ---
${this.assumptions}

--- CLASSES & INTERFACES ---
${this.classes}

--- RESPONSIBILITIES & RELATIONSHIPS ---
${this.responsibilities}

--- DESIGN EXPLANATION ---
${this.explanation}
${this.additionalNotes ? `\n--- ADDITIONAL NOTES ---\n${this.additionalNotes}` : ''}
`.trim();
  }

  toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      assumptions: this.assumptions,
      classes: this.classes,
      responsibilities: this.responsibilities,
      explanation: this.explanation,
      additionalNotes: this.additionalNotes,
    };
  }
}
