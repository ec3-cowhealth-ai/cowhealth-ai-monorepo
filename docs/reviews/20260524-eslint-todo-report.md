# ESLint + TODO Report

| Field | Value                                                |
| ----- | ---------------------------------------------------- |
| Date  | 2026-05-24                                           |
| Scope | `frontend` ESLint run + `backend/frontend` TODO scan |
| Note  | `backend` now has an ESLint config and lint script   |

---

## Summary

I ran ESLint on both frontend and backend and scanned the repository for `TODO`, `FIXME`, and `HACK` markers.

Current status:

- Frontend ESLint fails with 3 errors.
- Backend ESLint now runs and fails with 14 errors.
- The repository already contains several explicit TODOs that can be turned into team work items.

---

## ESLint Findings

### 1. `frontend/src/components/ui/Icon.tsx`

- Rule: `react-refresh/only-export-components`
- Problem: the file exports something other than a component, which breaks Fast Refresh expectations.
- Action: move shared constants/helpers out of the component file or split them into a separate module.

### 2. `frontend/src/context/FarmContext.tsx`

- Rule: `react-refresh/only-export-components`
- Problem: the file exports both React context helpers and component-related logic.
- Action: separate exported helpers/constants from the provider module if Fast Refresh should remain stable.

### 3. `frontend/src/context/FarmContext.tsx`

- Rule: `react-hooks/set-state-in-effect`
- Problem: `setSelectedFarmState(...)` is called synchronously inside an effect.
- Action: derive the initial selection outside the effect or move the update behind a safer synchronization pattern.

---

## Backend ESLint Findings

### 1. `backend/src/controllers/cowsController.ts`

- `cowUpload` is imported but never used.
- `any` is used in the sensor pagination request handlers.

### 2. `backend/src/helpers/controllerHelpers.ts`

- Two `any` usages remain in the controller helper layer.

### 3. `backend/src/helpers/serviceHelpers.ts`

- Multiple `any` usages remain in helper utilities.
- This file is also a structural hotspot because it mixes unrelated responsibilities.

### 4. `backend/src/services/usersService.ts`

- One `any` usage remains in user service logic.

### 5. `backend/src/types/auth.ts`

- Namespace syntax is still used; ESLint prefers standard ES module shape.

---

## TODO Inventory

### Backend

- `backend/prisma/seed.ts`
  - Seed notes for the next merge.

- `backend/prisma/schema.prisma`
  - Prisma datasource migration note.

- `backend/src/controllers/farmsController.ts`
  - `request.body` reaches Prisma without validation.

- `backend/src/server.ts`
  - Open CORS.
  - Public `/uploads` access.
  - No global error handler.

- `backend/src/middlewares/requirePermission.ts`
  - Permission check still hits the database on every authenticated request.

- `backend/src/services/dashboardService.ts`
  - `unreadNotifications` is still system-wide, not user-scoped.

### Frontend

- `frontend/src/types/farms.ts`
  - `Farm.id` is still typed as `string` while the backend returns `number`.

- `frontend/src/hooks/usePermission.ts`
  - Permission names are still plain strings, so typos are not type-checked.

- `frontend/src/features/auth/types/index.ts`
  - Expansion note for auth types.

- `frontend/src/features/dashboard/types/index.ts`
  - Expansion note for dashboard types.

- `frontend/src/features/landing/pages/LandingPage.tsx`
  - Demo and navigation TODOs still remain in the landing page.

- `frontend/src/features/README.md`
  - Team assignment notes and dependency guidance are still documented as TODOs.

---

## Handoff TODOs

These items are already documented in [20260524-handoff-team.md](D:/Projects/cowhealthai/docs/reviews/20260524-handoff-team.md) and are appended here so the team has one combined backlog.

### Angelo

- Protect UI actions by role on all pages.
- Review and fix Farm -> Cows access by role.
- Fix `Farm.id` from `string` to `number`.
- Create a typed permission name map and use it in `useHasPermission`.

### Ian

- Fix bottom navigation spacing for iOS and Android safe areas.
- Change herd cards from list layout to 2-column tiles.
- Fix `unreadNotifications` in the dashboard so it is user-scoped.
- Reintroduce the dashboard time-series chart by adding the missing backend endpoint.

### Renato

- Restrict CORS in `backend/src/server.ts`.
- Remove public static access to `/uploads` and serve photos through an authenticated endpoint.
- Add a global Express error handler.
- Add input validation to controllers with Zod.
- Remove the database query from `requirePermission`.

### Shared / Team

- Decide the final permission naming contract for frontend and backend.
- Decide whether the Farm -> Cows access model should be global or farm-scoped.
- Keep `npm run build` green after each page or backend change.
- Update `docs/change_control/CHANGELOG.md` when the team lands changes.

---

## Team-Facing Priorities

### Renato

- Restrict CORS in `backend/src/server.ts`.
- Remove public static access to `/uploads`.
- Add a global Express error handler.
- Add input validation for controllers.
- Remove the DB query from `requirePermission`.
- Scope dashboard unread notifications to the authenticated user.

### Angelo

- Fix `Farm.id` to `number`.
- Replace free-form permission strings with a typed permission map.
- Apply role-based visibility in the frontend UI.

### Ian

- Fix the `react-hooks/set-state-in-effect` issue in `FarmContext`.
- Review `Icon.tsx` for Fast Refresh compatibility.
- Keep working on dashboard and map UX items already documented in the handoff.

### Shared / Team

- Review the backend ESLint findings and decide whether to fix them now or batch them by area.
- Keep the TODO report updated as more markers are removed from the codebase.

---

## Recommended Next Command Set

```bash
cd frontend
npm run lint
```

```bash
rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/build/**' "TODO|FIXME|HACK" backend frontend
```

---

## Notes

- The current lint signal is already useful, but it only covers the frontend.
- The repository has many architecture TODOs that are already written in the codebase, so this report can be used as a live backlog starter.
