# AI Usage & Engineering Decision Log

This document details 4 key architectural and implementation decisions made during the development of the **LLD Practice Platform**, explaining what was proposed by AI, what was accepted vs rejected, and the underlying engineering rationale.

---

## Decision 1: Deterministic Submission Validation vs. Full LLM Delegation

- **AI Proposal**: Use the LLM for all submission checks, including checking whether the user entered assumptions, classes, and explanations.
- **Decision**: **REJECTED**.
- **Rationale**: Basic input validation (field existence, minimum length, valid problem/attempt IDs) is deterministic and fast. Relying on an external LLM API for basic validation introduces latency, cost, and potential unreliability.
- **Final Approach**: Implemented client-side and server-side deterministic validation (`TextSubmission.validate()`). Submissions with empty or trivial inputs are blocked immediately with clear error messages before any LLM API is called.

---

## Decision 2: Asynchronous Monolithic State Machine vs. Distributed Queue (Kafka/BullMQ)

- **AI Proposal**: Introduce Redis with BullMQ or Kafka to handle background evaluation jobs asynchronously.
- **Decision**: **REJECTED**.
- **Rationale**: For an MVP designed to showcase core LLD learning workflows, distributed messaging infrastructure adds unnecessary operational complexity (Redis containers, queue workers, network failure modes).
- **Final Approach**: Maintained a simple monolithic architecture using Prisma state transitions (`DRAFT` ➔ `SUBMITTED` ➔ `EVALUATING` ➔ `COMPLETED` / `FAILED`). The API endpoint triggers background evaluation asynchronously while client polling updates the UI cleanly.

---

## Decision 3: Canonical Reference Diagram Matching vs. Evidence-Based Evaluation

- **AI Proposal**: Grade submissions by comparing the user's class names against a pre-defined canonical class diagram for each problem.
- **Decision**: **REJECTED**.
- **Rationale**: LLD has multiple valid solutions. Demanding specific class names (e.g. requiring `PricingStrategy` over `FeeCalculator`) punishes valid software design choices and misleads learners into thinking design has a single correct answer.
- **Final Approach**: Created a structured evaluation prompt instructing the LLM to evaluate 6 explicit design criteria (Requirement Understanding, Responsibility Allocation, Abstraction & Interfaces, Coupling & Cohesion, Extensibility, Explanation & Trade-offs) based on evidence extracted directly from the learner's text.

---

## Decision 4: Fallback Rule-Based Evaluator for Zero-Setup Offline Execution

- **AI Proposal**: Fail immediately or throw an error if no `OPENAI_API_KEY` or `GEMINI_API_KEY` is present in `.env`.
- **Decision**: **ACCEPTED & EXTENDED**.
- **Rationale**: Automated unit tests, CI pipelines, and local developer evaluations should run out of the box without requiring API keys or failing runtime builds.
- **Final Approach**: Implemented `LlmEvaluator` with an automatic fallback to `RuleBasedEvaluator`. If no API key is set or if an API call fails, the platform seamlessly returns a structured evaluation so the application and tests never crash.
