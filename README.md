# LLD Practice Platform

A focused, monolithic web application built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **SQLite** that enables software engineers and students to practice Low-Level Object-Oriented Design (LLD) problems and receive structured, explainable feedback on their design decisions.

---

## 🌟 Core Value Proposition

Unlike traditional coding platforms that evaluate code with unit tests or compare diagrams against rigid canonical reference answers, the **LLD Practice Platform** evaluates design reasoning, responsibility allocation, coupling, cohesion, extensibility, and trade-offs.

```
Choose Problem ➔ Think & Design ➔ Submit ➔ Deterministic Validation ➔ AI Reasoning ➔ Review Structured Feedback ➔ Iterate & Try Again
```

---

## 🚀 Features

- **Practice Problem Catalog**: Pre-populated with classic LLD problems: *Parking Lot System*, *Vending Machine*, and *Elevator Control System*.
- **Structured Design Submission**: Learner provides Assumptions, Classes & Interfaces, Responsibilities & Relationships, Design Explanation, and Additional Notes.
- **Side-by-Side Workspace**: Problem requirements remain visible in a sticky sidebar while the learner designs.
- **Deterministic Validation**: Immediate validation for non-empty fields, character lengths, and required inputs before invoking the AI.
- **Extensible Evaluator Architecture**: Pluggable `Evaluator` abstraction supporting `LlmEvaluator` (Gemini/OpenAI) and `RuleBasedEvaluator` / `MockEvaluator` for offline execution.
- **Structured Explainable Feedback**: Detailed criteria breakdown scores (0-10), evidence-based feedback cards (Good, Suggestion, Concern), and thought-provoking follow-up design questions.
- **Attempt History & Score Progression**: Track iterations, compare past scores, and retry problems to improve design quality.
- **Duplicate Evaluation Protection & Retry**: Idempotent execution preventing duplicate AI calls and allowing one-click evaluation retries if service fails.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma ORM
- **Testing**: Vitest + Testing Library
- **Validation**: Zod (for input & LLM JSON schema validation)
- **Icons**: Lucide React

---

## 💻 Getting Started

### Prerequisites

- Node.js `v18+` or `v20+`
- npm `v10+`

### 1. Clone & Install

```bash
git clone <repository-url>
cd LLD-practice
npm install
```

### 2. Configure Environment Variables

Create `.env` file in the root directory (or copy `.env.example`):

```bash
DATABASE_URL="file:./dev.db"

# Optional: Add Gemini or OpenAI key for live LLM evaluation
# If omitted, the platform uses an intelligent RuleBasedEvaluator out of the box!
# GEMINI_API_KEY="your_gemini_api_key"
# OPENAI_API_KEY="your_openai_api_key"
```

### 3. Setup & Seed Database

```bash
npm run prisma:push
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests & Build

Run the Vitest unit test suite:

```bash
npm test
```

Run TypeScript build verification:

```bash
npm run build
```

---

## 📌 Known Limitations & Scope Scoping

- **No Authentication**: The MVP does not require user accounts or login.
- **No Code Execution**: Practice focuses on object-oriented domain modeling rather than executable code.
- **No Graphical UML Canvas**: Focuses on text-based architectural representation to maximize reasoning speed.
- **Single-Machine Monolith**: Intentionally built without microservices or distributed queues to keep architecture simple and maintainable.
