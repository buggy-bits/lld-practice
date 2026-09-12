# LLD Practice Platform

LLD Practice is a small web application for practising object-oriented design. A learner chooses a problem, writes a structured design, submits it, and receives feedback about responsibilities, abstractions, coupling, extensibility, and trade-offs.

The MVP is deliberately focused. It evaluates design reasoning rather than running learner code or declaring one class diagram to be the only correct answer.

## What is included

The application ships with Parking Lot, Vending Machine, and Elevator Control System problems. The practice workspace collects assumptions, classes and interfaces, responsibilities and relationships, an explanation, and optional notes. Attempts, submissions, evaluations, criterion scores, feedback, and follow-up questions are stored through Prisma.

The evaluator has two paths. `RuleBasedEvaluator` works without external services. `LlmEvaluator` can use OpenRouter, Gemini, or OpenAI and validates the returned structure before it is stored.

## Stack

- Next.js 14 App Router and TypeScript
- React and Tailwind CSS
- Prisma ORM with SQLite for local development
- Vitest and Testing Library
- Zod for submission and evaluator-response validation

## Run locally

Requirements: Node.js 18 or newer and npm 10 or newer.

```powershell
npm install
Copy-Item .env.example .env
npm run prisma:push
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

The local `.env` can use:

```env
DATABASE_URL="file:./dev.db"
```

LLM keys are optional. Without one, the rule-based evaluator is used. Keep provider keys server-side and never give them a `NEXT_PUBLIC_` prefix.

## Verify the project

```powershell
npm test
npm run build
npx prisma validate
```

## Database and deployment

SQLite is suitable for local development or a single server with a persistent disk. It is not suitable for an ephemeral or horizontally scaled serverless deployment because the database file is local to one process or machine.

For a public deployment, use managed PostgreSQL. Change the provider in `prisma/schema.prisma` to `postgresql`, set the production `DATABASE_URL`, and create a migration during development:

```powershell
npx prisma migrate dev --name init
```

Commit the resulting `prisma/migrations` directory. In the deployment environment, run:

```powershell
npm install
npm run prisma:migrate:deploy
npm run prisma:seed
npm run build
npm start
```

For a database already created with `prisma db push`, take a backup and use `prisma migrate resolve --applied <migration-name>` only after confirming that its schema matches the migration. Do not use `prisma db push` as the normal production release step.

A Vercel-style deployment needs managed PostgreSQL and server-side environment variables. A persistent VM can keep SQLite, but it needs disk backups, a restart policy, TLS through a reverse proxy, and a plan for updates.

## Before a public launch

The current MVP has no authentication, so attempts are not associated with user accounts. Add authentication and authorization if attempts contain private learner data.

The rate limiter and LLM daily cap are in-memory and process-local. Replace them with Redis or provider-backed controls before relying on them for abuse prevention or billing protection.

Submission currently starts evaluation in the application process. Use a durable queue and worker for a serverless deployment or any service where requests can be terminated after the response is returned.

Also configure database backups, error tracking, structured logs, uptime checks, provider spending limits, and a health-check or smoke-test step in the deployment pipeline.

## Project documents

- `RESEARCH.txt` explains the learner problem and product direction.
- `DESIGN.txt` explains the MVP architecture, user flow, domain classes, and trade-offs. Mermaid blocks can be rendered when converting it to PDF.
- `AI_USAGE.md` records where AI assistance was used and which engineering decisions were accepted or rejected.

## License

This project is private unless a license is added by the project owner.
