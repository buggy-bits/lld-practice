# System Design & Domain Architecture Document

## 1. Monolithic Architecture Overview

The **LLD Practice Platform** is designed as a clean, single-repository Next.js monolith. 

```
+-------------------------------------------------------------------+
|                        Next.js Web UI                              |
|   (Problems Catalog | Practice Workspace | Feedback | History)    |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                       Application Layer                           |
| (StartAttempt | SubmitAttempt | EvaluateAttempt | GetAttemptHistory)|
+-------------------------------------------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
+-----------------------+                   +-----------------------+
|     Domain Layer      |                   | Infrastructure Layer  |
| - Problem             |                   | - Prisma ORM / SQLite |
| - Attempt (State)     |                   | - LlmEvaluator        |
| - Submission (Abs)    |                   | - RuleBasedEvaluator  |
| - Evaluator (Abs)     |                   +-----------------------+
+-----------------------+
```

---

## 2. Core Domain Abstractions

### Submission Abstraction

```typescript
export interface Submission {
  type: SubmissionType; // 'TEXT' | 'DIAGRAM' | 'CODE'
  validate(): SubmissionValidationResult;
  getSummaryText(): string;
  toJSON(): Record<string, unknown>;
}
```

The domain model (`Attempt`) holds a reference to `Submission` rather than concrete string fields. The current MVP implements `TextSubmission`.

### Evaluator Abstraction

```typescript
export interface Evaluator {
  readonly name: string;
  evaluate(context: EvaluationContext): Promise<EvaluationResult>;
}
```

The practice workflow depends strictly on the `Evaluator` interface rather than directly on an external API client.

---

## 3. Attempt State Machine & Transition Logic

An `Attempt` manages its status through strict state machine transitions:

```
[DRAFT] ──(submit)──> [SUBMITTED] ──(startEvaluating)──> [EVALUATING] ──(complete)──> [COMPLETED]
                                                               │
                                                               └──(fail)─────────> [FAILED]
                                                                                       │
                                                                                       └──(retry)──> [EVALUATING]
```

### Transition Guard Rules:
- Only `DRAFT` attempts can be submitted.
- Only `SUBMITTED` or `FAILED` attempts can enter `EVALUATING`.
- Duplicate evaluation protection: If an attempt is already `EVALUATING` or `COMPLETED`, duplicate evaluation calls exit immediately without re-triggering AI execution.

---

## 4. Deterministic Validation vs. AI Reasoning

| Stage | Responsibility | Examples |
|---|---|---|
| **Deterministic Validation** | Immediate client & server checks (No AI used) | - Non-empty required text fields<br>- Minimum length checks (e.g. >15 chars)<br>- Valid Attempt ID & Problem ID checks<br>- Attempt state transition guards |
| **AI Evaluation** | Subjective object-oriented design reasoning | - Evaluating Single Responsibility Principle<br>- Identifying god classes & high coupling<br>- Assessing abstraction justification<br>- Generating evidence-based suggestions & follow-up questions |

---

## 5. Architectural Verification: Two Change Tests

### Change Test A: Introducing Class Diagram Submissions Tomorrow
*Question*: How much of the existing domain model must change if class diagram submissions (e.g., Mermaid/UML JSON) are introduced?

*Answer*: **Near Zero**.
- Introduce `DiagramSubmission` class implementing `Submission`.
- Create UI component for diagram rendering.
- `Attempt`, `EvaluateAttemptUseCase`, `GetAttemptHistoryUseCase`, and database relations remain completely untouched.

### Change Test B: Swapping LLM Evaluator for Human Reviewers or Rule Engine
*Question*: How much of the practice flow must change if evaluation is switched to human review or deterministic static analysis?

*Answer*: **Near Zero**.
- Introduce `HumanEvaluator` or `StaticAnalysisEvaluator` implementing `Evaluator`.
- Inject the new evaluator implementation into `EvaluateAttemptUseCase`.
- The learner's submission, attempt state flow, feedback UI, and history remain completely untouched.
