# CHANGELOG

# Changes and Progress by JCFS

---

## 2026-05-24 - Farm geolocation, cow position simulation, authentication loop fix, and team task documentation (JCFS)

Scope: Utility for simulating geographic coordinates for cows by farm; fix for infinite reload loop caused by FarmProvider outside the protected route; update of the Farm type with optional latitude/longitude fields; generation of triage cards for the team (Angelo, Ian, Renato); PR task documenting farm geolocation for integration with the MQTT simulator; adjustment of .gitignore to track .claude/SKILL.md.

### Added

- `frontend/src/pages/map/simulateCowPositions.ts` — utility that distributes cows in deterministic geographic positions (seeded by `cow.id`) within a 600m radius around farm coordinates; uses hardcoded fallback for the 5 farms until the geolocation migration (PR #15) is applied.
- `docs/tasks/farm-geolocation.md` — task document for Renato: Prisma schema, migration, seed with coordinates, and acceptance criteria.
- `docs/tasks/triagen-cards.yaml` — 13 triage cards (v2 format) covering all pending tasks for Angelo, Ian, and Renato, with checklists and priorities.
- `backend/src/helpers/fileStorage.ts` — helper for storing cow photo files.
- `backend/src/helpers/multerUpload.ts` — multer configuration for image uploads.
- `backend/src/services/cowHealthAnalyzer.ts` — heuristic service for bovine health analysis.
- `frontend/src/pages/map/CowDetailCard.tsx`, `CowPin.tsx`, `MapBackground.tsx`, `MapLegend.tsx` — components extracted from MapPage for better separation of responsibilities.

### Changed

- `frontend/src/types/farms.ts` — added `latitude?: number` and `longitude?: number` to the `Farm` type.
- `frontend/src/components/layout/AppShell.tsx` — `FarmProvider` moved inside AppShell (it was in App.tsx), fixing the infinite reload loop when the user was not authenticated.
- `frontend/src/App.tsx` — removed `FarmProvider` (now in AppShell).
- `frontend/src/pages/map/MapPage.tsx` — refactored with extracted components.
- `frontend/src/hooks/usePermission.ts` — improvements in the permission check hook.
- `frontend/src/features/farms/components/FarmForm.tsx` — updated farm form.
- `backend/src/server.ts` — configuration adjustments.
- `backend/src/services/dashboardService.ts` — `farmId` filter integrated into the merge with main.
- `backend/src/services/mqttIngestService.ts` — improvements in the MQTT ingestion service.
- `backend/src/controllers/cowsController.ts`, `farmsController.ts` — controller updates.
- `backend/src/middlewares/requirePermission.ts` — adjustments in the permission middleware.
- `.gitignore` — added exception `!.claude/SKILL.md`.

### Removed

- `frontend/src/store/README.md`, `context/index.ts`, `reducers/index.ts` — Redux store removed (replaced by FarmContext).

### Open PRs

- PR #15 — `feat/farm-geolocation` → farm geolocation task (Renato).

### Build Status

- Frontend TypeScript: zero errors.

---

## 2026-05-23 - Colored bovine icons by status + logout redirect to Landing Page (JCFS)

Scope: `CowHead` icon (lucide-lab) dynamically colored according to the cow's health status; complete migration of the custom `Icon` component and `CowMark` to `lucide-react` on all post-login screens; logout and expired session redirect pointing to the Landing Page.

### Added

- `frontend/src/components/ui/CowHeadIcon.tsx` — shared React component that wraps the `@lucide/lab` `cowHead` node via `createLucideIcon`; eliminates repetition of `createLucideIcon` in each file.

**Frontend — Dependencies**

- `frontend/package.json` — installed `@lucide/lab` for `CowHead` usage.

### Changed

**Frontend — Cow icons by status**

The `CowHead` icon now receives `color` dynamically based on the cow's status, making the health state visually immediate in the list and detail.

- `frontend/src/features/cows/pages/CowsPage.tsx` — each `CowHead` in the list receives `color={statusColor(cow.status)}`.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — `CowHead` in the hero card receives `color={statusColor(cow.status)}`.

Color mapping:

| Status | Color |
|---|---|
| Healthy | `var(--success)` — green |
| Alert | `var(--danger)` — red |
| Heat Stress | `var(--warning)` — orange |
| Calving | `var(--info)` — blue |

**Frontend — Migration custom Icon → lucide-react**

All uses of the custom `Icon` component (`@components/ui/Icon`) and `CowMark` were replaced by Lucide equivalents on all post-login screens.

- `frontend/src/components/layout/AppBar.tsx` — `Icon n="chevronLeft"` → `<ChevronLeft />`.
- `frontend/src/components/layout/Sidebar.tsx` — `Beef` → `CowHead` (via `CowHeadIcon.tsx`).
- `frontend/src/features/cows/pages/CowsPage.tsx` — `Icon n="search/chevronRight"` → `Search`, `ChevronRight`; `CowMark` → `CowHead`.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — `Icon n="alert/farm/collar/thermo/heart"` → `AlertTriangle`, `Warehouse`, `Tag`, `Thermometer`, `Heart`; `CowMark` → `CowHead`.
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — `Icon n="check/alert/bell/activity"` → `Check`, `AlertTriangle`, `Bell`, `Activity`; icon map by type refactored to `ReactNode`.
- `frontend/src/pages/home/HomePage.tsx` — `Icon n="bell/alert/chevronRight/check/list/map/farm"` → Lucide equivalents; `CowMark` → `CowHead`.
- `frontend/src/pages/profile/ProfilePage.tsx` — `Icon n="list/farm/collar/user/chevronRight/logout"` → Lucide equivalents; `CowMark` → `CowHead`; `menuItems` refactored to `ReactNode` instead of strings.
- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — `Beef` → `CowHead` (via `CowHeadIcon.tsx`).

**Frontend — Logout**

- `frontend/src/hooks/useAuth.ts` — `useLogout` redirects to `/` (Landing Page) instead of `/login`.
- `frontend/src/components/layout/Sidebar.tsx` — `handleLogout` redirects to `/`.
- `frontend/src/lib/api.ts` — 401 interceptor redirects to `/` instead of `/login`.

### Build Status

- Frontend TypeScript: zero errors (`tsc --noEmit`).

---

## 2026-05-23 - Hi-Fi Design System: 5 post-login screens + cascaded farm filter (JCFS)

Scope: Complete replacement of post-login screens with the Hi-Fi Design System (CowHealth AI — 5 screens · iPhone 14 Pro · Dark · PT-BR); addition of global selected farm context with cascade propagation to Prisma; rewrite of the map as a farm floor plan with paddocks/stables and real-time cow pins; creation of 5 unique SVG layouts (one per farm).

### Added

**Frontend — UI Components (`src/components/ui/`)**

- `Icon.tsx` — SVG renderer with 30+ Design System icons; props `{ n, s, c, sw, style }`; icons: bell, search, home, list, alert, map, user, wifi, arrowUp, calendar, chevronLeft/Right, filter, plus, check, thermo, heart, activity, battery, logout, farm, collar.
- `StatusDot.tsx` — colored indicator with `cowPulse` animation; tones `success | warn | danger | muted | info`.
- `Battery.tsx` — visual battery percentage component with range-based colors (danger < 20%, warning < 40%, accent ≥ 40%).
- `CowMark.tsx` — cow SVG logo; props `{ s, primary, accent }`.
- `LineChart.tsx` — native SVG chart consuming `SensorDailyPoint[]`; support for horizontal thresholds, area gradient, automatic X/Y axes, up to 5 date labels.

**Frontend — Context**

- `src/context/FarmContext.tsx` — `FarmProvider` exposing `selectedFarm`, `setSelectedFarm`, `farms`, `isLoading`; persists `selectedFarmId` in `localStorage`; auto-selects the first farm on initialization.

**Frontend — New Pages**

- `src/pages/map/farmLayouts.ts` — 5 SVG farm floor plan layouts: Aurora (fields + central stable), São Bento (corridor + side paddocks), Vale Verde (L-shape + pond), Santa Clara (3×2 grid of paddocks), Rio Bonito (linear + riparian forest + river); each layout defines colored zones with labels, roads, and pin positions.
- `src/pages/map/MapPage.tsx` — full-bleed map of the selected farm: SVG topographic background, zone polygons with labels, animated cow pins by status (real data filtered by farm), count legend, detail card on pin tap, "Next" button to cycle between farms.
- `src/pages/profile/ProfilePage.tsx` — user profile with CowMark, email, profile, quick access menu, and logout.

### Changed

**Frontend — Layout**

- `src/components/layout/BottomNav.tsx` — migrated from 4 tabs with emoji to 5 tabs with SVG `Icon` (Home / Herd / Alerts / Map / Profile); Pearl Aqua `.bottom-nav__indicator` animated on active item; unread badge in Alerts.
- `src/components/layout/AppBar.tsx` — added `subtitle`, `showBack`, `left` props; back button uses `Icon` chevronLeft; `left` slot for custom avatar/logo.

**Frontend — Rewritten Pages**

- `src/pages/home/HomePage.tsx` — hero card with health score + progress bar, critical alert strip, horizontal row of cows needing attention, quick access grid; bottom sheet for farm switching; all data filtered by the selected farm.
- `src/features/cows/pages/CowsPage.tsx` — `cow-row` layout with `CowMark` + `StatusDot`; farm filter via context; status chips; collapsible search; subtitle shows farm name.
- `src/features/cows/pages/CowDetailPage.tsx` — hero card with CowMark + status + farm/collar pills; metrics grid; `LineChart` with Temperature / HR tabs; recent cow notifications.
- `src/features/notifications/pages/NotificationsPage.tsx` — alert cards with type-colored left border; All / Unread chips; `timeAgo` in PT-BR; mark as read on tap; "mark all" action in AppBar.

**Frontend — Routes**

- `src/routes/AppRoutes.tsx` — added routes `/map` → `MapPage` and `/profile` → `ProfilePage`.

**Frontend — App**

- `src/App.tsx` — wrapped with `<FarmProvider>` inside `QueryClientProvider`.

**Frontend — CSS**

- `src/styles/App.css` — complete rewrite of the authenticated Design System (without the `:root` block, which resides in `landing.css`): `bottom-nav` 5 columns 64px with Pearl Aqua `.bottom-nav__indicator`; `app-bar` 56px with `.app-bar__titles`, `.app-bar__subtitle`, `.app-bar__action-badge`; `@keyframes cowPulse`; new classes: `.app-content`, `.home-hero`, `.home-hero__bar`, `.home-hero__bar-fill`, `.home-stat`, `.home-section`, `.home-section__header`, `.alert-card`, `.alert-card--danger`, `.alert-card--read`, `.quick-grid`, `.quick-chip`, `.cow-row`, `.cow-row__meta`, `.cow-row__right`, `.cow-row__status`, `.filter-chips`, `.filter-chip`, `.home-empty`.

**Frontend — Hooks**

- `src/features/dashboard/hooks/useDashboard.ts` — `useDashboardOverview(farmId?)` and `useCowsPerStatus(farmId?)` include `farmId` in the `queryKey` and pass it to the service.

**Frontend — Services**

- `src/services/dashboardService.ts` — `getDashboardOverview(farmId?)` and `getCowsPerStatus(farmId?)` send `?farmId=` when provided.

**Backend — Services**

- `src/services/dashboardService.ts` — `getDashboardOverview(farmId?)`: filters `prisma.cow.count()` with `where: { farmId }`; when `farmId` provided, returns the farm itself as `topFarm`; `getCowsPerStatus(farmId?)`: adds `where: { farmId }` to the `groupBy`.
- `src/services/cowsService.ts` — `getAllCows(farmId?)`: adds `where: farmId ? { farmId } : undefined` to the `findMany`.

**Backend — Controllers**

- `src/controllers/dashboardController.ts` — `overview` and `cowsPerStatus` read `request.query.farmId` and pass it as `number`.
- `src/controllers/cowsController.ts` — `listCows` reads `request.query.farmId` and passes it to `getAllCows`.

### Fixed

- **Dashboard displayed 160 cows (all farms)** when admin accessed a specific farm.
  Cause: backend lacked `farmId` support; frontend lacked selected farm state.
  Solution: `FarmContext` + query param `?farmId=` cascaded down to Prisma.

- **Map displayed global multi-farm view** instead of internal floor plan.
  Cause: previous `MapPage` used fixed pins for geographic location of farms.
  Solution: rewritten with `farmLayouts.ts` — internal floor plan with SVG zones and filtered cow pins.

- **`isPending: toggling` declared but never used** in `UsersPage` (pre-existing TypeScript error).
  Solution: removed from destructuring.

### Build Status

- Frontend TypeScript: zero errors — 842 modules transformed (`npm run build`).
- Backend TypeScript: no type errors in modified functions.

---

## 2026-05-23 - FarmContext + Refactored Map + Lucide React Icons (JCFS)

Scope: Global selected farm context, complete map refactoring, static farm layouts, adjustments in cows/dashboard backend, and replacement of all emojis with vector icons via `lucide-react`.

### Added

**Frontend — Context**

- `frontend/src/context/FarmContext.tsx` — global selected farm context; exposes `selectedFarm` and `setSelectedFarm` to filter data by farm across the application.

**Frontend — Map**

- `frontend/src/pages/map/farmLayouts.ts` — static farm layouts (sector positions, corrals, and points of interest); local data for map rendering without depending on external endpoint.

**Frontend — Dependencies**

- `frontend/package.json` — installed `lucide-react` for replacing emojis with consistent vector icons.

### Changed

**Backend — Cows**

- `backend/src/controllers/cowsController.ts` — adjustments in controller response.
- `backend/src/services/cowsService.ts` — adjustments in filtering logic.

**Backend — Dashboard**

- `backend/src/controllers/dashboardController.ts` — adjustments in KPI response.
- `backend/src/services/dashboardService.ts` — refactoring of data aggregation logic by farm.

**Frontend — Dashboard**

- `frontend/src/services/dashboardService.ts` — updated to support `farmId` filter.
- `frontend/src/features/dashboard/hooks/useDashboard.ts` — hooks updated to consume `FarmContext` and pass `farmId` in queries.

**Frontend — Home**

- `frontend/src/pages/home/HomePage.tsx` — refactored to use `FarmContext`; farm selector integrated into the home page.

**Frontend — Map**

- `frontend/src/pages/map/MapPage.tsx` — complete refactoring: rendering based on `farmLayouts.ts`, integration with `FarmContext`, new visual layout of sectors and corrals.

**Frontend — Cows**

- `frontend/src/features/cows/pages/CowsPage.tsx` — integrated farm filter via `FarmContext`.

**Frontend — App**

- `frontend/src/App.tsx` — `FarmContext.Provider` added to global providers wrapper.

**Frontend — Icons (lucide-react)**

All emojis were removed from the source code and replaced by Lucide components. **Impact: `icon` prop of `EmptyState` and `ErrorState` changed from `string` to `ReactNode`** — passing a string literal to these props will result in a TypeScript error.

- `frontend/src/components/common/EmptyState.tsx` — `icon?: string` → `icon?: ReactNode`; default `<Inbox size={40} />`.
- `frontend/src/components/common/ErrorState.tsx` — `icon?: string` → `icon?: ReactNode`; default `<AlertTriangle size={40} />`.
- `frontend/src/components/common/FormModal.tsx` — `✕` → `<X size={16} />`.
- `frontend/src/components/common/ConfirmDialog.tsx` — `✕` → `<X size={16} />`.
- `frontend/src/components/layout/Sidebar.tsx` — navigation emojis → `Home`, `Warehouse`, `Tag`, `Beef`, `Bell`, `ShieldCheck`, `LogOut`.
- `frontend/src/components/layout/BottomNav.tsx` — custom `Icon` SVG component → `Home`, `List`, `Bell`, `Map`, `User` (Lucide).
- `frontend/src/features/notifications/components/NotificationCard.tsx` — emoji map by type → `AlertTriangle`, `Bell`, `Info`, `XCircle`, `Megaphone`.
- `frontend/src/pages/auth/LoginPage.tsx` — emoji `🐄` removed from `CowHealth AI` title.
- `frontend/src/features/access/pages/AccessLayout.tsx` — `🔒` → `<Lock size={40} />`.
- `frontend/src/features/access/pages/RolesPage.tsx` — `✕` → `<X />`, `🎭` → `<Users size={40} />`.
- `frontend/src/features/access/pages/PermissionsPage.tsx` — `🔑` → `<Key size={40} />`.
- `frontend/src/features/access/pages/UsersPage.tsx` — `✕` → `<X />`, `👤` → `<User size={40} />`.
- `frontend/src/features/farms/pages/FarmsPage.tsx` — `🏡` → `<Warehouse size={40} />`.
- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — `❌` → `<XCircle />`, `🐄` → `<Beef />`.
- `frontend/src/features/collars/pages/CollarDetailPage.tsx` — `❌` → `<XCircle size={40} />`.

### Build Status

- Frontend TypeScript: zero errors (`tsc --noEmit`).

---

## 2026-05-23 - Backend MQTT + Access Management + Auth + Dashboard + Environment (JCFS)

Scope: MQTT ingestion endpoint, heuristic health analysis, complete access management screens, dashboard with real data, TypeScript type corrections, environment configuration, and massive data seed.

### Added

**Backend — MQTT Ingestion**

- `backend/src/middlewares/requireApiKey.ts` — API Key authentication middleware (`Authorization: Bearer`).
- `backend/src/services/mqttIngestService.ts` — payload validation, persistence of HeartRateData / TemperatureData / AccelerometerData, heuristic analysis of CALVING and HEAT_STRESS, notification triggering for ADMIN and MANAGER.
- `backend/src/controllers/mqttController.ts` — thin controller delegating to `ingestMqttPayload`.
- `backend/src/routes/mqttRoutes.ts` — `POST /mqtt/ingest` protected by `requireApiKey`.

**IoT Documentation**

- `docs/iot-simulator-plan.md` — complete plan for the Python simulator: bovine physiological ranges, MQTT payload format, flow architecture, pseudocode for all modules, and execution sequence.
- `cowhealth-iot-simulator/CLAUDE.md` — permanent instructions for AI in the separate IoT repository.

**Frontend — Dashboard**

- `frontend/src/services/dashboardService.ts` — service with 3 dashboard endpoints.
- `frontend/src/features/dashboard/hooks/useDashboard.ts` — `useDashboardOverview`, `useCowsPerStatus`, `useCowsPerFarm` hooks.
- `frontend/src/features/dashboard/components/DashboardKPICard.tsx`.
- `frontend/src/features/dashboard/components/CowsPerStatusChart.tsx` — PieChart with Recharts.
- `frontend/src/features/dashboard/components/CowsPerFarmChart.tsx` — BarChart with Recharts.
- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx` — LineChart with Recharts.

**Frontend — Auth**

- `frontend/src/pages/auth/RegisterPage.tsx`.

**Frontend — Access Hooks**

- `frontend/src/features/access/hooks/useRoles.ts` — `useRoles`, `useRole`, `useCreateRole`, `useUpdateRole`, `useDeleteRole`, `useGrantPermission`, `useRevokePermission`.
- `frontend/src/features/access/hooks/useUsers.ts` — `useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`, `useToggleActive`, `useAssignRole`, `useRemoveRole`.
- `frontend/src/features/access/hooks/usePermissions.ts` — `usePermissions`, `useCreatePermission`, `useUpdatePermission`, `useDeletePermission`.

### Changed

**Backend**

- `backend/src/server.ts` — registration of `mqttRoutes` in `app.use("/mqtt", mqttRoutes)`.
- `backend/src/types/auth.ts` — added `RegisterInput { name, email, password }` interface.
- `backend/src/services/authService.ts` — added `register()` function with bcrypt hash and VIEWER profile.
- `backend/src/controllers/authController.ts` — added `registerController`.
- `backend/src/routes/authRoutes.ts` — added `POST /register` route (public).
- `backend/.env` / `backend/.env.example` — added `MQTT_WORKER_API_KEY` variable.

**Frontend — Auth**

- `frontend/src/features/auth/components/LoginForm.tsx` — implementation with `react-hook-form` + `zod`, `autoComplete="off"` to prevent Chrome autofill.
- `frontend/src/features/auth/components/RegisterForm.tsx` — implemented from scratch with validations and `useRegister()` integration.
- `frontend/src/services/authService.ts` — added `registerService()`.
- `frontend/src/hooks/useAuth.ts` — added `useRegister()` with redirect to `/login` on `onSuccess`.
- `frontend/src/routes/AppRoutes.tsx` — replaced `RegisterPlaceholder` with real `<RegisterPage />`.

**Frontend — Dashboard**

- `frontend/src/features/dashboard/pages/DashboardPage.tsx` — replaced mock data with real hooks, loading state, additional KPIs (`totalActiveCollars`, `unreadNotifications`).

**Frontend — Cows**

- `frontend/src/features/cows/components/SensorChart.tsx` — corrected interface: `{ timestamp, value }` → `{ date, average }`.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — removed 2 unnecessary queries; `farm` and `collar` extracted directly from `cow.farm` and `cow.collar`.

**Frontend — Collars**

- `frontend/src/features/collars/components/CollarCard.tsx` — `collar.identifier` → `collar.name`; removed `batteryPercentage` and `lastSync` fields.
- `frontend/src/features/collars/pages/CollarDetailPage.tsx` — removed extra query; `linkedCow = collar?.cow` (already nested).

**Frontend — Farms**

- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — removed client-side filter `c.farmId === id`.

**Frontend — Access**

- `frontend/src/features/access/pages/UsersPage.tsx` — complete rewrite: search, `CreateUserModal`, `EditUserModal`, `ManageRolesModal`, active toggle, deletion with confirmation.
- `frontend/src/features/access/pages/RolesPage.tsx` — complete rewrite: search, `RoleFormModal`, `ManagePermissionsModal` with real-time checkboxes; fixed `role.permissions.length` → `role._count.permissions`.
- `frontend/src/features/access/pages/PermissionsPage.tsx` — complete rewrite: search, `PermissionFormModal`, deletion with confirmation.

**Frontend — Hooks**

- `frontend/src/hooks/useNotifications.ts` — `useMarkNotificationAsRead` and `useMarkAllAsRead` converted from fake objects to real `useMutation` with `invalidateQueries`.

**Frontend — Types**

- `frontend/src/types/cows.ts` — `id: string` → `number`; `dateOfBirth` → `birthDate`; `farmId` → `farm { id, name }`; `collarId` → `collar { id, name, status }`; `HeartRateDailyPoint` → `SensorDailyPoint { date, average }`.
- `frontend/src/types/collars.ts` — `identifier` → `name`; removed `batteryPercentage` and `lastSync`; `cowId` → `cow { id, tag, name }`.
- `frontend/src/types/access.ts` — added `RoleListItem` and `RoleDetail`; `Permission.description` → `string | null`.

**Frontend — Services**

- `frontend/src/services/rolesService.ts` — updated typing; fixed `grantPermission()` which sent `permissionId` in the URL instead of the body.

**Frontend — Dependencies**

- `frontend/package.json` — installed `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`.

**Environment**

- `backend/.env` — created from `.env.example`; `DATABASE_URL` configured with port `33071`.
- `frontend/.env` — created from `.env.example`; `VITE_API_URL=http://localhost:3001`.

### Removed

- `backend/prisma/run_seed.sh` — removed: Prisma ORM bypass with hardcoded MySQL credentials.
- `backend/prisma/seed_data.sql` — removed: direct SQL operations, plain text passwords.
- `backend/src/routes/authRoutes.ts` — removed `POST /register` route (public without authentication, rejected in code review).
- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx` — removed from dashboard (LineChart with categorical data makes no sense without time series endpoint).

### Fixed

- **Frontend called `localhost:3000/auth/login` (self) instead of `localhost:3001`**
  Cause: `frontend/.env` did not exist; `VITE_API_URL` was `undefined`.
  Solution: created `frontend/.env` with `VITE_API_URL=http://localhost:3001`.

- **`grantPermission` returned silent 404**
  Cause: frontend sent `POST /roles/:id/permissions/:permissionId` (non-existent route).
  Solution: fixed to `POST /roles/:id/permissions` with body `{ permissionId }`.

- **Crash in `/access/roles`: `Cannot read properties of undefined (reading 'length')`**
  Cause: `role.permissions.length` — but `getAllRoles` returns `_count.permissions` (integer).
  Solution: replaced with `role._count.permissions`.

- **Marking notification as read did not update the UI**
  Cause: `useMarkNotificationAsRead` returned fake object without React Query integration.
  Solution: converted to `useMutation` with `invalidateQueries(["notifications"])`.

- **Data arrived in the database but did not appear on screens**
  Cause: TypeScript types divergent from actual API contract (`timestamp/value` vs `date/average`, `identifier` vs `name`, etc.).
  Solution: all types aligned with the real shape of the endpoints.

- **Chrome filling email field with user's Google account**
  Cause: form without `autoComplete`.
  Solution: `autoComplete="off"` on `<form>` + `autoComplete="one-time-code"` on email input.

- **Port 3001 occupied by external process**
  Cause: another project with Node process on the same port.
  Solution: identified via `lsof -i :3001` + `kill {PID}`.

### Build Status

- Backend TypeScript: zero errors (`npx tsc --noEmit`).
- Frontend TypeScript: zero errors — 837 modules | 284ms.

---

## 2026-05-15 - Landing Page: iOS/Android responsiveness + scroll fix (JCFS)

Scope: mobile optimization of the landing page and scroll bug fix.

### Changed

- `frontend/index.html` — added iOS/Android meta tags: `viewport-fit=cover`, `theme-color`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`.
- `frontend/src/styles/landing.css` — added global rules, `.stage` with `min-height: 100dvh`, `.app` with `overflow-y: auto`, `padding` with `env(safe-area-inset-*)`, `overscroll-behavior-y: none`.
- `frontend/src/features/landing/pages/LandingPage.tsx` — content wrapped in `<div className="stage">`.

### Fixed

- **Mouse scroll did not work on landing page**
  Cause: `overflow-y: auto` missing in `.app` CSS.
  Solution: restored `overflow-y: auto; overflow-x: hidden` + `scrollbar-width: none`.

### Build Status

- TypeScript: zero errors | Vite: zero errors.

---

## 2026-05-14 - Frontend base structure per professor's instructions (JCFS)

Scope: `frontend/` only — no backend changes.

### Added

- `frontend/src/routes/AppRoutes.tsx` — centralized routing.
- `frontend/src/config/environment.ts` — centralized environment configuration.
- `frontend/src/components/charts/ChartContainer.tsx` and `index.ts`.
- `frontend/src/components/common/index.ts`.
- `frontend/src/components/layout/index.ts`.
- `frontend/src/components/feedback/index.ts`.
- `frontend/src/utils/index.ts`.

### Changed

- `frontend/src/App.tsx` — simplified to global provider composition and routing via `AppRoutes`.
- `frontend/vite.config.ts` — aliases: `@`, `@components`, `@features`, `@pages`, `@hooks`, `@services`, `@routes`, `@config`, `@utils`, `@types`.
- `frontend/tsconfig.app.json` — added `baseUrl` and `paths` aligned with Vite.
- `frontend/src/lib/api.ts` — `baseURL` now uses `environment.apiUrl`.
- `frontend/.env.example` — added `VITE_API_URL`, `VITE_APP_NAME`, `VITE_ENV` variables.

---

# Changes and Progress by Angelo

...

# Changes and Progress by Ian

...

# Changes and Progress by Renato

...
