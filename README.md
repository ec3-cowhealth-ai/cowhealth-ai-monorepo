# CowHealth AI

[![Repository](https://img.shields.io/badge/repository-monorepo-2B2C28?style=for-the-badge)](./)
[![Stack](https://img.shields.io/badge/stack-React%2019%20%7C%20TypeScript%20%7C%20Express%20%7C%20Prisma-339989?style=for-the-badge)](./)
[![Frontend](https://img.shields.io/badge/frontend-Vite%20%2B%20React%20Query%20%2B%20Axios-7DE2D1?style=for-the-badge)](./frontend)
[![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Prisma%20%2B%20JWT-131515?style=for-the-badge)](./backend)
[![Database](https://img.shields.io/badge/database-MySQL-E8C66B?style=for-the-badge)](./backend/prisma/schema.prisma)
[![Architecture](https://img.shields.io/badge/architecture-feature--oriented%20monorepo-6BB4E8?style=for-the-badge)](./docs/frontend-architecture.md)

CowHealth AI is a bovine health monitoring platform organized as a web monorepo. The repository contains a React frontend, an Express + Prisma backend, a MySQL schema, and project documentation that describes the current architecture, design system, and implementation rules.

This README is the root entry point for humans and agents working in this repository.

## Overview

CowHealth AI is built around two runtime surfaces:

- `frontend/` provides the web application UI.
- `backend/` provides the API, authentication, authorization, and persistence layer.

The current codebase focuses on:

- Authentication and protected routing.
- A landing page and login flow in the frontend.
- A backend API with users, roles, permissions, farms, collars, cows, dashboard, and notifications.
- Prisma-based persistence with a MySQL schema.
- Cow photo uploads served by the backend.

The repository is not a mobile-only application. It is a web monorepo with a browser frontend and a server backend.

## Current Status

- Frontend: active development.
- Backend: active development.
- Database schema: defined in Prisma and aligned with the backend architecture docs.
- Design system: documented in `agents/design.md` and supporting files under `docs/design_system/`.

## First Files to Read

Read these files in this order to understand the repository quickly:

1. `START_HERE.md`
2. `MANAGER.md`
3. `agents/agents.md`
4. `agents/design.md`
5. `docs/frontend-architecture.md`
6. `docs/backend-architecture.md`
7. `backend/prisma/schema.prisma`

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack React Query
- Axios
- Tailwind CSS v4

### Backend

- Express 5
- TypeScript
- Prisma ORM
- MySQL
- JSON Web Tokens for authentication
- bcrypt for password hashing
- multer for file uploads

## Repository Structure

```text
.
├── START_HERE.md
├── MANAGER.md
├── agents/
├── backend/
├── database/
├── docs/
├── frontend/
└── .claude/
```

### Frontend

```text
frontend/
├── public/
├── src/
│   ├── components/
│   ├── config/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── styles/
│   ├── types/
│   └── utils/
├── package.json
├── vite.config.ts
└── tsconfig*.json
```

### Backend

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── controllers/
│   ├── helpers/
│   ├── lib/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   └── types/
├── package.json
└── tsconfig.json
```

## Main Functional Areas

### Frontend

- Public landing page.
- Login page.
- Register placeholder.
- Protected placeholder routes for home and dashboard.
- React Query provider and route bootstrap.

### Backend

- Authentication routes.
- User management.
- Role and permission management.
- Permission groups.
- Farms, collars, cows, dashboard, and notifications.
- Health check endpoint.
- Static file serving for uploaded cow photos.

## Routes and Entry Points

### Frontend entry points

- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/routes/AppRoutes.tsx`

### Backend entry point

- `backend/src/server.ts`

### Database entry point

- `backend/prisma/schema.prisma`

## Local Setup

The frontend and backend are separate workspaces. Install dependencies in each one.

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Install backend dependencies

```bash
cd ../backend
npm install
```

## Environment Variables

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

```dotenv
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=CowHealth AI
VITE_ENV=development
```

### Backend

Create `backend/.env` from `backend/.env.example`.

```dotenv
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=segredo
DB_NAME=cowhealth-db
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/DB_NAME"
JWT_SECRET="uma-string-longa-e-aleatoria"
JWT_EXPIRES_IN="7d"
```

Do not commit real secrets.

## Run Locally

Open two terminals, one for each workspace.

### Frontend

```bash
cd frontend
npm run dev
```

Default Vite dev server:

- `http://localhost:5173`

### Backend

```bash
cd backend
npm run dev
```

Default backend port:

- `http://localhost:3001`

## Verification Commands

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Backend

```bash
cd backend
npm run build
```

If you need database or schema verification, use Prisma CLI commands from the `backend/` workspace as appropriate for the task.

## Production Preview

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

### Backend

```bash
cd backend
npm run build
npm start
```

## How the Frontend Is Structured

The frontend follows a feature-oriented structure.

- `components/` contains reusable UI components.
- `features/` contains domain-specific modules.
- `pages/` contains page composition.
- `hooks/` encapsulates React Query usage and client logic.
- `services/` contains Axios-based API calls.
- `routes/` centralizes navigation.
- `lib/` contains shared infrastructure such as the Axios client and QueryClient.
- `types/` contains shared TypeScript contracts.
- `styles/` contains global styling.

The current routing setup lives in `frontend/src/routes/AppRoutes.tsx` and currently exposes:

- `/` for the landing page.
- `/login` for authentication.
- `/register` as a placeholder.
- `/home` and `/dashboard` behind `ProtectedRoute`.

## How the Backend Is Structured

The backend follows a conventional Express layering model.

- `routes/` defines HTTP endpoints and middleware composition.
- `controllers/` receives requests and responses.
- `services/` contains business rules and data access logic.
- `middlewares/` handles authentication and authorization.
- `helpers/` contains reusable service/controller helpers.
- `lib/` contains infrastructure, including the Prisma client singleton.

The backend currently exposes domains for:

- Auth
- Users
- Roles
- Permissions
- Permission groups
- Farms
- Collars
- Cows
- Dashboard
- Notifications

## Database Model

The Prisma schema models:

- Authentication and RBAC:
  - `User`
  - `Role`
  - `Permission`
  - `PermissionGroup`
  - junction tables for assignments
- Core domain:
  - `Farm`
  - `Cow`
  - `Collar`
- Telemetry:
  - `HeartRateData`
  - `TemperatureData`
  - `AccelerometerData`
- Notifications:
  - `Notification`

The schema is the best place to verify naming, relations, enums, and current persistence behavior.

## API Highlights

The backend architecture docs describe the implemented route families.

Notable examples:

- Authentication:
  - `POST /auth/login`
  - `GET /auth/me`
- Dashboard:
  - `GET /dashboard/overview`
  - `GET /dashboard/cows-per-status`
  - `GET /dashboard/cows-per-farm`
- Cows:
  - CRUD endpoints
  - photo upload and deletion endpoints
  - sensor history endpoints
- Notifications:
  - list notifications
  - mark one read
  - mark all read

Refer to `docs/backend-architecture.md` for the authoritative route matrix.

## Documentation Map

### Project control and onboarding

- `START_HERE.md`
- `MANAGER.md`

### Architecture docs

- `agents/agents.md`
- `agents/design.md`
- `docs/frontend-architecture.md`
- `docs/backend-architecture.md`

### Supporting references

- `docs/prisma.md`
- `docs/insomnia-backend.yaml`
- `docs/design_system/`
- `docs/change_control/CHANGELOG.md`
- `docs/policies/`

## Development Workflow

1. Read the onboarding and architecture docs.
2. Confirm the relevant code paths in `frontend/src/` or `backend/src/`.
3. Update the implementation in the smallest coherent change.
4. Run the relevant verification commands.
5. Update documentation if architecture or behavior changes.

## Working Conventions

- Keep code changes minimal and reviewable.
- Preserve unrelated user changes.
- Respect existing naming and folder conventions.
- Keep React components presentational where possible.
- Keep API calls in services, not directly in components.
- Keep backend controllers thin and business logic in services.
- Avoid adding dependencies unless they are clearly justified.

## Useful References

- [Frontend architecture](docs/frontend-architecture.md)
- [Backend architecture](docs/backend-architecture.md)
- [Prisma notes](docs/prisma.md)
- [Design system references](agents/design.md)

## Notes for New Contributors

- The root repository does not contain the primary runtime commands. Use `frontend/` and `backend/` directly.
- The backend uses MySQL through Prisma. Make sure `DATABASE_URL` is valid before running schema-dependent work.
- The frontend expects `VITE_API_URL` to point at the backend API.
- The repo contains documentation artifacts and design references that are useful for implementation work, but the source code and Prisma schema remain the final truth for runtime behavior.

