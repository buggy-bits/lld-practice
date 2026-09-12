# AI Usage Report

## Purpose

AI assistance was used as a development aid while building the LLD Practice Platform. The developer remained responsible for the product scope, architecture, implementation choices, review of generated suggestions, and verification through tests and a production build.

## Where AI was used

AI was used for:

- discussing the learner problem and possible MVP boundaries
- comparing text submissions with graphical diagram editors
- reviewing the application layering and evaluator abstraction
- suggesting validation cases and edge cases around attempt state transitions
- drafting and refining implementation code, tests, and deployment documentation
- reviewing deployment risks around SQLite, serverless execution, rate limiting, and LLM cost controls

AI was not used as an authority for the learner's design score. The application evaluates the learner's submission using the explicit rubric and returns evidence that can be inspected by the learner.

## Decisions made with AI input

### Deterministic validation stays outside the LLM

An early suggestion was to ask the LLM whether required fields were present and meaningful. That was rejected. Required-field checks, length checks, identifier checks, and attempt-state checks are predictable application rules. Keeping them in the domain model makes requests faster, cheaper, and testable without a provider key.

### The evaluator is an interface

The evaluator boundary was retained because the product needs both offline feedback and optional provider-backed reasoning. `RuleBasedEvaluator` supports local development and tests. `LlmEvaluator` handles provider calls and validates their JSON response. The use case depends on `Evaluator`, so changing provider does not require rewriting the attempt workflow.

### Feedback is evidence-based

Matching learner class names against a canonical answer was considered and rejected. A Parking Lot design using `FeeCalculator` can be as sound as one using `PricingStrategy`. The evaluator therefore scores requirement understanding, responsibility allocation, abstractions, coupling and cohesion, extensibility, and explanation based on evidence in the submitted text.

### The first version remains a monolith

Introducing Kafka, BullMQ, or several services during the MVP was considered and deferred. The main workflow is small, and a monolith makes it easier to inspect and change. This is a scope decision, not a claim that in-process work is sufficient for every production environment.

### The rule-based fallback is intentional

Failing when no API key is configured was considered and rejected. The fallback lets a developer run the project and its tests without paid external infrastructure. Provider failures also fall back to a structured local result, while production still needs provider monitoring and spending limits.

## Verification

The implementation was checked with the Vitest suite and the Next.js production build. Prisma schema validation and a fresh database migration were also run. The tests cover domain transitions, evaluator behaviour, validation, and security-related input cases.

## Limitations and follow-up work

The current in-memory rate limiter and daily evaluation counter do not coordinate across processes. Evaluation is started from the request process and is not a durable job. The MVP also has no authentication. These limitations are documented rather than hidden; they must be addressed before treating the application as a public multi-instance service.
