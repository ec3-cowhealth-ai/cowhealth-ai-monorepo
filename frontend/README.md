# Frontend Workspace

This workspace contains the browser UI for CowHealth AI.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- React Query
- Axios
- React Hook Form
- Zod
- Recharts
- Tailwind CSS v4

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run preview`

## Current Structure

- `src/components/` - shared UI and layout components
- `src/config/` - environment and runtime config
- `src/context/` - cross-cutting React context
- `src/features/` - feature modules
- `src/hooks/` - cross-feature hooks
- `src/lib/` - API client and shared clients
- `src/pages/` - top-level routes and pages
- `src/routes/` - route definitions
- `src/services/` - API wrappers
- `src/styles/` - global styles
- `src/types/` - shared types
- `src/utils/` - utilities

## Documentation

- [Repo documentation map](/docs/README.md)
- [Frontend architecture](/docs/architecture/frontend-architecture.md)

## Notes

- The old Vite template instructions are no longer the right entry point for this repo.
- If you change feature behavior, update the matching feature README under `src/features/`.
