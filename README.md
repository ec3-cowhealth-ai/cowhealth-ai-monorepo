# CowHealth AI

[![Repository](https://img.shields.io/badge/repository-monorepo-2B2C28?style=for-the-badge)](./)
[![Stack](https://img.shields.io/badge/stack-React%2019%20%7C%20TypeScript%20%7C%20Express%20%7C%20Prisma-339989?style=for-the-badge)](./)
[![Frontend](https://img.shields.io/badge/frontend-Vite%20%2B%20React%20Query%20%2B%20Axios-7DE2D1?style=for-the-badge)](./frontend)
[![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Prisma%20%2B%20JWT-131515?style=for-the-badge)](./backend)
[![Database](https://img.shields.io/badge/database-MySQL-E8C66B?style=for-the-badge)](./backend/prisma/schema.prisma)
[![Architecture](https://img.shields.io/badge/architecture-feature--oriented%20monorepo-6BB4E8?style=for-the-badge)](./docs/architecture/frontend-architecture.md)

CowHealth AI is a bovine health monitoring platform organized as a web monorepo. The repository contains a React frontend, an Express + Prisma backend, a MySQL schema, and project documentation that describes the current architecture, design system, and implementation rules.

## What To Read First

1. [START_HERE.md](/START_HERE.md)
2. [MANAGER.md](/MANAGER.md)
3. [docs/README.md](/docs/README.md)
4. [docs/agents/agents.md](/docs/agents/agents.md)
5. [docs/agents/design.md](/docs/agents/design.md)
6. [docs/architecture/frontend-architecture.md](/docs/architecture/frontend-architecture.md)
7. [docs/architecture/backend-architecture.md](/docs/architecture/backend-architecture.md)
8. [backend/prisma/schema.prisma](/backend/prisma/schema.prisma)

## Overview

CowHealth AI is built around two runtime surfaces:

- `frontend/` provides the web application UI.
- `backend/` provides the API, authentication, authorization, and persistence layer.

### Current implemented features

- JWT authentication with permissions embedded in the token.
- Protected routing with an `AppShell` layout (responsive sidebar on desktop, bottom navigation on mobile).
- Farm selector with persistent selection via `FarmContext` and localStorage.
- Dashboard with KPI cards filtered by selected farm.
- Cow list and detail pages with health status indicators.
- Cow photo upload served through an authenticated backend endpoint.
- Interactive GPS tracking map with simulated real-time cow positions.
- Collar management pages.
- Zod-based request validation on all backend endpoints.
- CORS restricted by origin with a global error handler.
- Role-based access control with permissions stored in JWT.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router v7
- TanStack React Query
- Axios
- Lucide React + `@lucide/lab` (CowHead icon)
- Custom CSS design system (no Tailwind in the authenticated app)
- Leaflet (interactive map)

### Backend

- Express 5
- TypeScript
- Prisma ORM
- MySQL
- JSON Web Tokens (permissions embedded)
- bcrypt
- multer (cow photo uploads)
- Zod (request validation)

## Repository Structure

```text
.
├── README.md
├── START_HERE.md
├── MANAGER.md
├── docs/agents/
├── backend/
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
│   │   ├── layout/       # AppShell, Sidebar, BottomNav, AppBar
│   │   └── ui/           # Icon, shared components
│   ├── config/
│   ├── context/          # FarmContext
│   ├── features/         # Domain modules (farms, cows, collars, dashboard…)
│   ├── hooks/
│   ├── lib/              # Axios client, QueryClient
│   ├── pages/
│   │   ├── map/          # GPS tracking map + cow simulation
│   │   └── …
│   ├── routes/           # AppRoutes, ProtectedRoute
│   ├── services/
│   ├── styles/           # App.css — design system tokens and components
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
│   ├── lib/              # Prisma client singleton
│   ├── middlewares/      # auth, validateSchema, errorHandler
│   ├── routes/
│   ├── services/
│   └── types/
├── package.json
└── tsconfig.json
```

## Design System

The authenticated app uses a pure CSS design system defined in `frontend/src/styles/App.css`. There is no Tailwind inside protected routes.

Key tokens and components:

- `--bg-app: #131515` — dark base
- `.app-shell`, `.sidebar`, `.bottom-nav`, `.app-bar`, `.app-page`
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg`
- `.status-badge--success/warning/danger/muted/info`
- `.kpi-card`, `.card`, `.card--clickable`
- `.data-table`, `.tabs`, `.modal-*`
- Breakpoint: 768px (sidebar on desktop, bottom-nav on mobile)

## Database Model

The Prisma schema models:

- Authentication and RBAC: `User`, `Role`, `Permission`, `PermissionGroup`, junction tables
- Core domain: `Farm`, `Cow`, `Collar`
- Telemetry: `HeartRateData`, `TemperatureData`, `AccelerometerData`
- Notifications: `Notification`

## Local Setup

### 1. Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment variables

Frontend — create `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:3001
```

Backend — create `backend/.env`:

```dotenv
PORT=3001
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/cowhealth-db"
JWT_SECRET="a-long-random-string"
JWT_EXPIRES_IN="7d"
```

### 3. Run locally

```bash
# Terminal 1
cd frontend && npm run dev     # http://localhost:5173

# Terminal 2
cd backend && npm run dev      # http://localhost:3001
```

## Verification

```bash
cd frontend && npm run lint && npm run build
cd backend  && npm run lint && npm run build
```

## Documentation Map

| Document | Purpose |
|---|---|
| `START_HERE.md` | Practical entry point |
| `MANAGER.md` | Project management and decisions |
| `docs/agents/agents.md` | Agent roles and responsibilities |
| `docs/agents/design.md` | Design system reference |
| `docs/architecture/frontend-architecture.md` | Frontend structure and conventions |
| `docs/architecture/backend-architecture.md` | Backend route matrix and conventions |
| `docs/change_control/CHANGELOG.md` | Change history |
| `docs/change_control/CHANGE_BUGFIX.md` | Bug fix log |

## Notes

- This is a web repo, not a mobile app repo.
- Treat older plans and audits as historical unless listed in `docs/README.md` as current working docs.
- The source code and Prisma schema are the final truth for runtime behavior.
