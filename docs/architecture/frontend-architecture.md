# Frontend Architecture

Reference guide for the current frontend codebase.

## Stack

- Vite
- React 19
- TypeScript
- React Router
- React Query
- Axios
- React Hook Form
- Zod
- Recharts
- Tailwind CSS v4

## Current Folder Shape

```text
frontend/src/
|-- components/   shared UI and layout components
|-- config/       runtime and environment config
|-- context/      cross-cutting React context
|-- features/     feature modules
|-- hooks/        cross-feature hooks
|-- lib/          API client and shared clients
|-- pages/        top-level pages
|-- routes/       route definitions
|-- services/     API wrappers
|-- styles/       global styles
|-- types/        shared TypeScript types
`-- utils/        utilities
```

## Core Data Flow

- `src/lib/api.ts` creates the Axios client and injects the JWT token from `localStorage`.
- `src/services/*` contains thin HTTP wrappers.
- `src/hooks/*` wraps React Query and provides app-level behavior.
- `src/features/*` keeps feature-specific UI, hooks, and services close together.
- `src/context/FarmContext.tsx` coordinates the selected farm state across the app.

## Current App Surfaces

- Public landing page
- Login and register pages
- Protected home/dashboard area
- Farms, cows, collars, notifications, access, map, and profile pages

## Notes

- React Compiler is not enabled in this repo.
- The frontend currently persists the auth token in `localStorage`.
- If a feature changes, update the matching feature README under `src/features/`.

