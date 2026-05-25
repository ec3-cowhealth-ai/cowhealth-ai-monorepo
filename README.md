# CowHealth AI

CowHealth AI is a web monorepo for bovine health monitoring.

- `frontend/` provides the browser UI.
- `backend/` provides the API, authentication, permissions, persistence, and uploads.

## Current Stack

- Frontend: React 19, TypeScript, Vite, React Router, React Query, Axios, React Hook Form, Zod, Recharts, Tailwind CSS v4
- Backend: Express 5, TypeScript, Prisma, MySQL, JWT, bcrypt, multer

## Documentation

Use [docs/README.md](/docs/README.md) as the documentation index.

## What To Read First

1. [START_HERE.md](/START_HERE.md)
2. [MANAGER.md](/MANAGER.md)
3. [docs/README.md](/docs/README.md)
4. [agents/agents.md](/agents/agents.md)
5. [agents/design.md](/agents/design.md)
6. [docs/architecture/frontend-architecture.md](/docs/architecture/frontend-architecture.md)
7. [docs/architecture/backend-architecture.md](/docs/architecture/backend-architecture.md)
8. [backend/prisma/schema.prisma](/backend/prisma/schema.prisma)

## Repository Layout

```text
.
|-- README.md
|-- START_HERE.md
|-- MANAGER.md
|-- agents/
|-- backend/
|-- docs/
|-- frontend/
`-- .claude/
```

## Local Setup

Install dependencies in each workspace.

```bash
cd frontend
npm install

cd ../backend
npm install
```

## Run Locally

```bash
cd frontend
npm run dev
```

```bash
cd backend
npm run dev
```

## Verification

- Frontend: `npm run lint`, `npm run build`
- Backend: `npm run lint`, `npm run build`

## Notes

- This is a web repo, not a mobile app repo.
- Treat older plans and audits as historical unless they are listed in `docs/README.md` as current working docs.

