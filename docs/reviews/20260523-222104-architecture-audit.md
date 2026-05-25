# Code Review Report

| Field     | Value                       |
| --------- | --------------------------- |
| Date      | 2026-05-23 22:26            |
| Prompt    | `architecture-audit`        |
| Codebase  | `D:\Projects\cowhealthai`   |
| Generator | `review.py` via Claude Code |

---

I now have a complete picture of both layers. Let me produce the full architectural audit report.

---

# CowHealth AI — Architectural Audit Report

---

## Section 1 — System Comprehension

### Macro-Domains

The system is an **IoT-connected livestock health monitoring platform** with the following business domains:

| Domain          | Responsibility                                                 |
| --------------- | -------------------------------------------------------------- |
| `auth`          | User authentication, JWT issuance, session validation          |
| `access`        | RBAC — users, roles, permissions, permission groups            |
| `farms`         | Farm CRUD and contextual filtering throughout the app          |
| `cows`          | Livestock management, sensor data retrieval, photo upload      |
| `collars`       | IoT device management and assignment to cows                   |
| `health-ingest` | MQTT payload ingestion, health analysis, status classification |
| `notifications` | In-app alerts triggered by automated health events             |
| `dashboard`     | Cross-domain aggregation for KPIs and charts                   |

### Actors

- **Admin** — full CRUD access, user and permission management
- **Manager** — operational access to farms, cows, collars, and notifications
- **Viewer** — read-only access
- **IoT Worker** (external service) — posts MQTT payloads via API key authentication
- **Frontend SPA** — authenticated via JWT token stored in `localStorage`

### Critical Flows End-to-End

1. **Login** → `POST /auth/login` → JWT returned → stored in `localStorage` → `useMe()` query populates user session → permissions embedded in response
2. **CRUD operations** → JWT sent in `Authorization` header → `requireAuth` validates JWT → `requirePermission` performs DB query → controller delegates to service → Prisma executes query
3. **IoT sensor ingest** → external worker posts to `POST /mqtt/ingest` with API key → `validatePayload` → `persistSensorData` → `analyzeHealth` → status update → `notifyUsers`
4. **Farm context selection** → `FarmContext` fetches all farms via `useFarms()` on every authenticated session → selected farm persisted to `localStorage`

### External Integrations

- **MySQL via Prisma** — sole data persistence provider; no abstraction layer
- **MQTT worker** — external process (not in this repo) that transforms MQTT broker messages into HTTP payloads sent to `/mqtt/ingest`
- **Local filesystem** — cow photos stored in `uploads/` directory on the server, served via Express static middleware

---

## Section 2 — Current Structure (As-Is)

### Backend Layer Map

```
backend/src/
  routes/          ← HTTP routing + middleware application
  controllers/     ← HTTP request/response handling, minor validation
  services/        ← Business logic + ALL Prisma calls
  helpers/         ← Cross-cutting utilities (query builders, error handlers)
  middlewares/     ← Auth, permission, API key guards
  lib/             ← Prisma singleton
  types/           ← Input DTOs
```

**Layer collapse diagnosis:**

- The `services/` layer functions as both **application layer** and **infrastructure layer** simultaneously. It executes business rules (uniqueness checks, deletion guards, authorization ownership) and directly calls Prisma without any repository interface.
- `mqttIngestService.ts` collapses **application orchestration**, **domain analysis**, **persistence**, and **notification dispatch** into one 200-line file.
- `cowsService.ts` collapses domain behavior (photo limits, sensor aggregation) with filesystem operations (`fs.unlinkSync`).
- `helpers/serviceHelpers.ts` collapses three unrelated concerns: uniqueness assertion, sensor query building, and daily aggregation calculation.

### Frontend Layer Map

```
frontend/src/
  features/        ← Feature modules (pages + hooks + components + types)
  components/      ← Shared UI components (layout, common, ui, charts)
  services/        ← HTTP client wrappers per domain (thin API layer)
  hooks/           ← Cross-feature hooks (useAuth, usePermission, useNotifications)
  context/         ← FarmContext (global server state coordination)
  pages/           ← Pages that live outside feature modules (map, home, profile, auth)
  routes/          ← AppRoutes (single file)
  types/           ← Shared type definitions (partially)
  store/           ← Placeholder stubs, not implemented
  lib/             ← Axios instance, QueryClient config
  config/          ← Environment config
```

**Layer collapse diagnosis:**

- `FarmContext.tsx` is simultaneously a **data-fetching layer** (calls `useFarms()`), **state management layer** (manages `selectedFarm`), and **persistence layer** (reads/writes `localStorage`).
- The split between `frontend/src/types/` and `frontend/src/features/*/types/` and inline types in service files creates a fragmented type layer with no single source of truth.
- `pages/` and `features/*/pages/` coexist with no consistent rule, breaking the feature-module convention mid-project.

---

## Section 3 — Critical Diagnosis

### 3.1 Architectural Problems

**A. Zero input validation at the HTTP boundary (critical security gap)**

All controllers pass `request.body` directly to services:

```ts
// farmsController.ts:21
await handleRequest(response, () => createFarm(request.body), 201);
```

No schema validation (Zod, Joi, or otherwise) is applied at any controller. Malformed or malicious payloads reach Prisma directly. While Prisma's TypeScript types provide compile-time safety, they are absent at runtime. Required fields, type coercion, CNPJ format, email format — none are validated. This is an OWASP A03 (Injection) surface and causes unpredictable error responses instead of structured 422 responses.

**B. `mqttIngestService.ts` — single-file god orchestrator**

The file at `backend/src/services/mqttIngestService.ts` performs six distinct responsibilities in sequence:

1. Payload structure validation (`validatePayload`)
2. Device lookup and cow resolution (application orchestration)
3. Sensor data persistence (`persistSensorData` — 3 separate DB writes)
4. Multi-query health analysis (`analyzeHealth` — 5 Prisma queries with hardcoded thresholds)
5. Cow status update
6. Notification fan-out to all ADMIN/MANAGER users (`notifyUsers`)

This is the most severe SRP violation in the system. The health-classification algorithm (`posturalChanges > 10 && avgHr > 90 && tempDelta < 0`) is business-critical domain logic with hardcoded magic numbers sitting inside an infrastructure ingestion service.

**C. `requirePermission` issues an uncached DB query per request**

```ts
// requirePermission.ts:13
const allowed = await userHasPermission(userId, permissionName);
```

`userHasPermission` traverses `user → user_roles → role → role_permissions → permission` on every authenticated request. With no caching, this is `O(n)` DB queries per API call — a scalability concern that will worsen as the permission graph grows.

**D. Dashboard `unreadNotifications` count is globally scoped — missing user context**

```ts
// dashboardService.ts:18
prisma.notification.count({ where: { readAt: null } }),
```

The count returns all unread notifications system-wide, not filtered to the authenticated user. This leaks cross-user data in the dashboard KPIs. A Viewer with no notifications would see another user's unread count.

**E. CORS is fully open — no origin restriction**

```ts
// server.ts:24
app.use(cors());
```

No `origin` whitelist is defined. Any domain can make credentialed requests to the API.

**F. Static file uploads are publicly accessible without authentication**

```ts
// server.ts:27
app.use("/uploads", express.static(...));
```

Cow photos are served to anyone who knows or can guess a filename. Photo filenames are generated with `Date.now()` plus a random suffix — guessable given the pattern.

**G. Authorization enforcement is split across layers**

Notification ownership is checked in the service layer:

```ts
// notificationsService.ts:26
if (notification.userId !== userId)
  throw new Error("No permission for this action.");
```

This authorization rule belongs in middleware or an application service, not in a data-access service. It creates an inconsistency — most authorization goes through `requirePermission`, but ownership authorization is scattered inside services.

**H. No global Express error handler registered**

`server.ts` registers no `app.use((err, req, res, next) => ...)` error handler. Unhandled exceptions thrown outside the `handleRequest` wrapper will produce Express's default HTML error page or crash the process.

---

### 3.2 Structural Problems

**A. `serviceHelpers.ts` groups three unrelated concerns**

The file contains:

- `findOrThrow` — generic record lookup utility
- `assertUnique` — data integrity guard
- `querySensorData` — Prisma query builder for sensor tables
- `aggregateDailyAverage` — analytical data transformation

These are from completely different layers: infrastructure query patterns, domain integrity rules, and data presentation logic. They share a file for accidental reasons (both are helpers), not because they belong together.

**B. Multer infrastructure is configured inside a controller**

```ts
// cowsController.ts:22-42
const storage = multer.diskStorage({ ... });
export const upload = multer({ storage, fileFilter, limits: ... });
```

File upload storage configuration — an infrastructure concern — is defined inside `cowsController.ts`. This creates a hidden coupling: the controller both handles HTTP and owns the upload infrastructure. It also makes it impossible to replace the storage adapter (e.g., moving to S3) without modifying the controller.

**C. `cowsService.ts` performs filesystem operations**

```ts
// cowsService.ts:136
if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
```

A service layer function deletes files from the filesystem. Infrastructure side effects (disk writes/deletes) belong in an infrastructure adapter, not a service. This makes the service untestable in isolation.

**D. Inconsistent page organization convention**

Pages are split across two locations:

- Inside feature modules: `features/dashboard/pages/`, `features/farms/`, `features/cows/`
- Outside features: `pages/auth/`, `pages/home/`, `pages/map/`, `pages/profile/`

There is no documented rule governing which pages live where. This fractures the feature-module convention midway through the project.

**E. Inconsistent form implementation**

`LoginForm.tsx` uses React Hook Form + Zod with proper schema validation. `FarmForm.tsx` uses `useState` with manual field spreading and no validation. Two different paradigms for the same UI pattern, creating inconsistency in error handling, accessibility, and submit behavior.

**F. Type definitions are split across multiple locations with no clear ownership**

Types exist in:

- `frontend/src/types/` — `auth.ts`, `farms.ts`, `cows.ts`, `collars.ts`, `access.ts`
- `frontend/src/features/auth/types/index.ts` — login form types
- `frontend/src/features/dashboard/types/index.ts` — dashboard-specific types
- `frontend/src/services/dashboardService.ts` — response interfaces defined inline

No convention determines where a type belongs. Response shapes (`DashboardOverviewResponse`, `CowStatusItem`, `CowFarmItem`) are defined in `dashboardService.ts` rather than in a types module, making them invisible to other modules.

**G. `MapPage.tsx` — monolithic page component**

`MapPage.tsx` is a 263-line component that handles:

- Data fetching via `useCows` and `useFarmContext`
- Layout algorithm (distributing cows over SVG pins)
- SVG map rendering with hardcoded topographic patterns, zone polygons, and road paths
- Farm legend computation
- Farm switching interaction
- Cow detail panel rendering with navigation

No sub-components are extracted. This file cannot be read, tested, or modified in isolation.

**H. `store/` directory is a non-functional placeholder**

`frontend/src/store/context/index.ts` and `frontend/src/store/reducers/index.ts` are empty barrel files that exist but export nothing. Dead structure adds noise.

---

### 3.3 Domain Modeling Problems

**A. No domain entity layer exists anywhere**

The system has no concept of a domain entity. `Cow`, `Farm`, `Collar`, `Notification` exist only as Prisma model types and flat TypeScript interfaces. Business invariants such as:

- A cow can only have one collar at a time
- A farm cannot be deleted if it has cows
- A collar cannot be deleted if assigned
- A notification can only be marked read by its owner
- A cow's health status must only be set to `HEALTHY` through recovery, not manually during active CALVING/HEAT_STRESS

...are enforced through scattered conditional checks across multiple service files with no central encapsulation.

**B. Health classification rules are hardcoded magic numbers with no formal identity**

```ts
// mqttIngestService.ts:110
if (posturalChanges > 10 && avgHr > 90 && tempDelta < 0) {
  return CowStatus.CALVING;
}
if (avgTemp > 39.0 && avgHr > 100 && restlessPeaks > 15) {
  return CowStatus.HEAT_STRESS;
}
```

These thresholds are the core scientific domain of the product. They are unnamed, undocumented constants embedded in an infrastructure service. There is no `HealthClassifier`, no `CowHealthRule`, no domain object that owns these decisions. The system cannot test them in isolation, cannot make them configurable per farm or per breed, and cannot audit their behavior separately from ingest logic.

**C. No use case objects or application service layer**

The closest thing to an application layer is the controllers, which delegate immediately to services. There is no `CreateFarmUseCase`, no `IngestSensorDataUseCase`, no `MarkNotificationAsReadUseCase`. Orchestration logic (e.g., creating a cow requires checking farm existence, checking collar existence, asserting tag uniqueness) is inside the service functions with no encapsulation boundary.

**D. Fragile client/server type contract with silent type mismatches**

`Farm.id` is typed as `string` on the frontend (`frontend/src/types/farms.ts:2`) but the backend returns an integer. The frontend passes this string ID to API calls and casts it with `Number()` in some controllers. `Cow.id` is typed as `number` on the frontend. The divergence is unstructured and undetected at compile time because there is no shared contract module. This is a latent runtime bug.

**E. `getMe` response shape embeds permissions as a flat permission list**

The `AuthUser` type (`frontend/src/types/auth.ts`) and the `getMe` backend response expose permissions as a flat array of `{ id, name }`. Client-side permission checks (`useHasPermission`) scan this array by name string. There is no permission enum shared between frontend and backend. A permission name change on the backend silently breaks frontend guards.

**F. `SensorPage<T>` pagination type defined on frontend but pagination is not implemented on the backend daily endpoints**

`SensorPage<T>` is defined in `frontend/src/types/cows.ts` but the daily sensor endpoints (`/heart-rate/daily`, `/temperature/daily`) return plain arrays. The paginated endpoints exist, but `cowsService.getHeartRate` types the response as `SensorPage<HeartRateDailyPoint>` — a type-level lie that hides a contract mismatch.

---

## Section 4 — Proposed Architecture (To-Be)

The target architecture is **Modular Layered Monolith with Clean Separation**, organized by business domain.

### Backend Target Layers

```
Presentation (HTTP)
  ↓ request/response only
Application (Use Cases)
  ↓ orchestration, no HTTP, no Prisma
Domain (Entities + Rules)
  ↓ pure logic, no I/O
Infrastructure (Prisma, Filesystem, Notification Dispatch)
```

**Key principles:**

- Controllers validate HTTP input (schema + types) and delegate to use cases
- Use cases orchestrate the flow, call domain services and repository interfaces
- Domain objects encapsulate invariants and classification rules
- Infrastructure implements repository interfaces defined by the domain
- No Prisma imports above the infrastructure layer

### Frontend Target Layers

```
Presentation (Pages, Components)
  ↓ React, display-only
Application (Hooks, Query/Mutation coordination)
  ↓ useQuery/useMutation wrappers
Infrastructure (API clients, localStorage, context)
```

**Key principles:**

- Forms use React Hook Form + Zod universally
- All types in a single `types/` directory per domain module
- Pages live inside their feature module, period
- `FarmContext` becomes a thin coordinator that doesn't own data-fetching
- Permission names shared as a typed enum between layers

---

## Section 5 — Suggested Module and Folder Structure

### Backend

```
backend/src/
  modules/
    auth/
      application/
        loginUseCase.ts
        getMeUseCase.ts
        registerUseCase.ts
      domain/
        authService.ts          ← password hashing, JWT signing (pure functions)
        permissionChecker.ts    ← userHasPermission logic
      infrastructure/
        authRepository.ts       ← Prisma queries for auth
      presentation/
        authController.ts
        authRoutes.ts
        authSchemas.ts          ← Zod schemas for request bodies

    access/
      application/
        createUserUseCase.ts
        assignRoleUseCase.ts
        grantPermissionsUseCase.ts
      domain/
        user.ts                 ← User domain entity
        role.ts
        permission.ts
      infrastructure/
        userRepository.ts
        roleRepository.ts
        permissionRepository.ts
      presentation/
        usersController.ts
        rolesController.ts
        permissionsController.ts
        usersRoutes.ts
        rolesRoutes.ts
        permissionsRoutes.ts
        schemas.ts

    farming/
      application/
        createFarmUseCase.ts
        deleteFarmUseCase.ts
        createCowUseCase.ts
        updateCowUseCase.ts
        deleteCowUseCase.ts
        manageCowPhotosUseCase.ts
      domain/
        farm.ts                 ← Farm entity with deletion guard
        cow.ts                  ← Cow entity with assignment/status invariants
        collar.ts               ← Collar entity
        cowHealthStatus.ts      ← CowStatus enum + allowed transitions
      infrastructure/
        farmRepository.ts
        cowRepository.ts
        collarRepository.ts
        fileStorageAdapter.ts   ← fs operations (or S3 adapter)
      presentation/
        farmsController.ts
        cowsController.ts
        collarsController.ts
        farmsRoutes.ts
        cowsRoutes.ts
        collarsRoutes.ts
        schemas.ts

    health-ingest/
      application/
        ingestSensorDataUseCase.ts   ← orchestrates: persist → analyze → notify
      domain/
        healthClassifier.ts          ← CALVING/HEAT_STRESS rules (named, testable)
        sensorReading.ts             ← value objects: HeartRate, Temperature, Accelerometer
        healthThresholds.ts          ← named constants
      infrastructure/
        sensorRepository.ts
        mqttPayloadValidator.ts      ← JSON shape validation
      presentation/
        mqttController.ts
        mqttRoutes.ts

    notifications/
      application/
        markReadUseCase.ts
        notifyUsersUseCase.ts       ← extracted from ingest service
      domain/
        notification.ts             ← ownership invariant
      infrastructure/
        notificationRepository.ts
      presentation/
        notificationsController.ts
        notificationsRoutes.ts

    dashboard/
      application/
        getDashboardOverviewUseCase.ts
      infrastructure/
        dashboardRepository.ts
      presentation/
        dashboardController.ts
        dashboardRoutes.ts

  shared/
    middlewares/
      requireAuth.ts
      requirePermission.ts       ← uses cached permission check
      requireApiKey.ts
    lib/
      prisma.ts
    errors/
      AppError.ts                ← typed error classes
      errorHandler.ts            ← global Express error handler
    validation/
      validateSchema.ts          ← Zod middleware factory
    types/
      express.d.ts               ← augmented Request with user
      auth.ts
```

### Frontend

```
frontend/src/
  modules/
    auth/
      components/
        LoginForm.tsx
        RegisterForm.tsx
      pages/
        LoginPage.tsx
        RegisterPage.tsx
      hooks/
        useAuth.ts
      types/
        index.ts
      services/
        authService.ts

    farms/
      components/
        FarmCard.tsx
        FarmForm.tsx
        FarmDetail.tsx
      pages/
        FarmsPage.tsx
        FarmDetailPage.tsx
      hooks/
        useFarms.ts
      types/
        index.ts
      services/
        farmsService.ts

    cows/
      components/
        CowCard.tsx
        CowForm.tsx
        SensorChart.tsx
        CowStatusBadge.tsx
      pages/
        CowsPage.tsx
        CowDetailPage.tsx
      hooks/
        useCows.ts
        useSensors.ts
      types/
        index.ts
      services/
        cowsService.ts

    collars/
      components/ | pages/ | hooks/ | types/ | services/

    health-map/
      components/
        FarmMap.tsx         ← extracted SVG map
        CowPin.tsx          ← extracted pin component
        MapLegend.tsx       ← extracted legend
        CowDetailCard.tsx   ← extracted detail card
      pages/
        MapPage.tsx
      hooks/
        useMapState.ts

    dashboard/
      components/ | pages/ | hooks/ | types/ | services/

    notifications/
      components/ | pages/ | hooks/ | types/ | services/

    access/
      users/ | roles/ | permissions/
      components/ | pages/ | hooks/ | types/ | services/

    landing/
      components/ | pages/

  shared/
    components/
      ui/           ← Icon, Button, StatusDot, Battery, etc.
      layout/       ← AppShell, AppBar, Sidebar
      common/       ← LoadingSpinner, EmptyState, ErrorState, ConfirmDialog
      charts/       ← ChartContainer, LineChart

    hooks/
      usePermission.ts
      useNotifications.ts

    context/
      FarmContext.tsx

    lib/
      api.ts
      queryClient.ts

    config/
      environment.ts
      permissions.ts   ← shared permission name constants

    types/
      shared.ts        ← Pagination, ApiError, etc.

  routes/
    AppRoutes.tsx

  main.tsx
```

---

## Section 6 — Detailed Refactoring Map

| Current Element                                              | Problem Identified                                                                                      | New Responsibility                                       | Suggested Architectural Destination                                                                                                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mqttIngestService.ts`                                       | God service: payload validation + persistence + health analysis + status update + notification dispatch | Split into 4 distinct units                              | `mqttPayloadValidator.ts` (infra), `ingestSensorDataUseCase.ts` (application), `healthClassifier.ts` (domain), `notifyUsersUseCase.ts` (application)                 |
| `analyzeHealth()` in `mqttIngestService.ts`                  | Domain rules with hardcoded magic numbers in infrastructure layer                                       | Named health classification rules, testable in isolation | `health-ingest/domain/healthClassifier.ts` + `healthThresholds.ts`                                                                                                   |
| `notifyUsers()` in `mqttIngestService.ts`                    | Notification dispatch mixed into ingest service                                                         | Standalone use case                                      | `notifications/application/notifyUsersUseCase.ts`                                                                                                                    |
| All controllers (`request.body` passthrough)                 | Zero input validation — raw body reaches Prisma                                                         | Validate with Zod before delegating                      | `schemas.ts` per module + `validateSchema` middleware factory                                                                                                        |
| `serviceHelpers.ts`                                          | Three unrelated concerns in one file                                                                    | Split by concern                                         | `assertUnique` → domain guard utility; `querySensorData` → `sensorRepository.ts` (infra); `aggregateDailyAverage` → `health-ingest/domain/` or shared analytics util |
| `cowsService.ts` `removeCowPhoto`                            | `fs.unlinkSync` in service layer                                                                        | Infrastructure adapter                                   | `shared/infrastructure/fileStorageAdapter.ts`                                                                                                                        |
| `cowsController.ts` Multer config                            | Storage infrastructure in controller                                                                    | Infrastructure adapter injected into use case            | `farming/infrastructure/fileStorageAdapter.ts`                                                                                                                       |
| `requirePermission`                                          | Uncached per-request DB query                                                                           | Caching layer or JWT-embedded permissions                | Embed permissions in JWT claims at login; `requirePermission` reads JWT without DB hit                                                                               |
| `dashboardService.ts` `unreadNotifications`                  | Global count leaks cross-user data                                                                      | Filter by `userId` from request context                  | `getDashboardOverviewUseCase.ts` receives `userId` as parameter                                                                                                      |
| `FarmContext.tsx`                                            | Fetches farms + manages selection state + reads/writes `localStorage`                                   | Separate data-fetching from context state                | `useFarms()` stays in query layer; `FarmContext` only manages selection state; persistence belongs in a `StorageAdapter`                                             |
| `MapPage.tsx`                                                | Monolithic 263-line component                                                                           | Decompose into focused sub-components                    | `FarmMap.tsx`, `CowPin.tsx`, `MapLegend.tsx`, `CowDetailCard.tsx`, `useMapState.ts`                                                                                  |
| `FarmForm.tsx`                                               | Manual `useState` with no validation                                                                    | React Hook Form + Zod                                    | `FarmForm.tsx` with `farmSchema` Zod schema                                                                                                                          |
| `dashboardService.ts` (frontend) inline types                | Response types defined inside service file                                                              | Move to types module                                     | `dashboard/types/index.ts`                                                                                                                                           |
| `pages/auth/`, `pages/map/`, `pages/home/`, `pages/profile/` | Pages outside feature modules — inconsistent                                                            | Move all pages inside their feature module               | `modules/auth/pages/`, `modules/health-map/pages/`, etc.                                                                                                             |
| `store/context/index.ts`, `store/reducers/index.ts`          | Empty placeholder stubs                                                                                 | Remove dead structure                                    | Deleted                                                                                                                                                              |
| `notificationsService.ts` ownership check                    | Authorization inside service                                                                            | Application-layer guard                                  | `markReadUseCase.ts` validates ownership before calling repository                                                                                                   |
| `frontend/src/types/auth.ts` Permission type                 | Permission names are plain strings                                                                      | Shared typed enum                                        | `shared/config/permissions.ts` with `PermissionName` enum used by both frontend and backend                                                                          |
| `Farm.id: string` (frontend) vs `number` (backend)           | Type contract mismatch — silent runtime bugs                                                            | Align to `number` or introduce a shared contract layer   | `modules/farms/types/index.ts` corrected; shared contract enforced via API response types                                                                            |
| `server.ts` CORS wildcard                                    | Any origin can call the API                                                                             | Restrict to known origins                                | `cors({ origin: process.env.ALLOWED_ORIGINS })`                                                                                                                      |
| `/uploads` static route                                      | Photos publicly accessible without auth                                                                 | Serve through authenticated endpoint                     | `GET /cows/:id/photos/:filename` guarded by `requireAuth` + `requirePermission`                                                                                      |
| `useAuth.ts` `useLogin` / `useLogout`                        | Navigation side effects in auth hook                                                                    | Navigation is a presentation concern                     | `onSuccess` callback injected by the calling page; auth hook is navigation-agnostic                                                                                  |

---

## Section 7 — Responsibility Redefinition

### Presentation (Controllers / React Pages + Components)

Should only:

- Parse and validate HTTP request shape (Zod schema, then delegate)
- Render UI state received from hooks
- Capture user input and forward it to application hooks
- Map HTTP status codes to response shapes
- Handle navigation decisions triggered by application outcomes

Should NOT: contain business rules, call repositories directly, or perform data aggregation.

### Application (Use Cases / React Hooks)

Should:

- Orchestrate one business operation end-to-end
- Coordinate calls to domain services and repository interfaces (backend) or API services (frontend)
- Enforce application-level rules (e.g., only one use case per HTTP mutation)
- Handle transactional boundaries

Should NOT: know about HTTP, React Router navigation, or Prisma internals.

### Domain (Entities, Classifiers, Invariants)

Should:

- Encapsulate business rules as named, testable functions and objects
- Define what a valid `Cow`, `Farm`, or health classification means
- Declare repository interfaces (contracts) that infrastructure must implement
- Own the `HealthClassifier` with its named thresholds

Should NOT: import Prisma, axios, React, or any external library.

### Infrastructure (Repositories, Adapters)

Should:

- Implement repository interfaces using Prisma, the filesystem, or any provider
- Own Multer configuration, file storage operations, external API wrappers
- Be replaceable without touching domain or application code

Should NOT: contain business logic or validation beyond data mapping.

---

## Section 8 — Consolidated Problem List (Prioritized)

| #   | Problem                                                                            | Severity | Category                    |
| --- | ---------------------------------------------------------------------------------- | -------- | --------------------------- |
| 1   | No HTTP input validation — `request.body` passed raw to Prisma                     | Critical | Architectural / Security    |
| 2   | `mqttIngestService.ts` combines 6 responsibilities                                 | Critical | Architectural               |
| 3   | Dashboard `unreadNotifications` leaks cross-user data                              | Critical | Security / Domain           |
| 4   | Health classification thresholds are unnamed magic numbers in infrastructure       | High     | Domain Modeling             |
| 5   | CORS open to all origins                                                           | High     | Security                    |
| 6   | Static `/uploads` route serves photos without authentication                       | High     | Security                    |
| 7   | JWT stored in `localStorage` (XSS-accessible)                                      | High     | Security                    |
| 8   | No global Express error handler — stack traces may leak                            | High     | Architectural               |
| 9   | `requirePermission` executes uncached DB query per request                         | High     | Architectural / Performance |
| 10  | `Farm.id` typed as `string` (frontend) vs `number` (backend) — silent mismatch     | High     | Domain Modeling             |
| 11  | `cowsService.ts` performs `fs.unlinkSync` — infrastructure in service layer        | Medium   | Architectural               |
| 12  | Multer configured inside `cowsController.ts` — infrastructure in controller        | Medium   | Architectural               |
| 13  | `notificationsService.ts` enforces ownership — authorization in service layer      | Medium   | Architectural               |
| 14  | `serviceHelpers.ts` groups three unrelated concerns                                | Medium   | Structural                  |
| 15  | `MapPage.tsx` is a 263-line monolith                                               | Medium   | Structural                  |
| 16  | `FarmForm.tsx` uses manual `useState` — inconsistent with `LoginForm.tsx`          | Medium   | Structural                  |
| 17  | Type definitions scattered across `types/`, `features/*/types/`, and service files | Medium   | Domain Modeling             |
| 18  | Pages split between `features/` and `pages/` — no consistent convention            | Medium   | Structural                  |
| 19  | Permission names are plain strings — no shared enum                                | Medium   | Domain Modeling             |
| 20  | `store/` directory is dead placeholder structure                                   | Low      | Structural                  |
| 21  | Zero test coverage across the entire codebase                                      | High     | Quality                     |

---

## Section 9 — Executive Summary of the New Architecture

After reorganization, the system will be a **domain-oriented modular monolith** where each business domain (`auth`, `access`, `farming`, `health-ingest`, `notifications`, `dashboard`) owns its own presentation, application, domain, and infrastructure layers with explicit dependency direction: presentation depends on application, application depends on domain, infrastructure implements domain interfaces.

**Concrete gains:**

- **Security** — input validation with Zod at every HTTP boundary eliminates injection surfaces. CORS restriction, authenticated photo serving, and potential JWT migration to `httpOnly` cookies eliminate the top security gaps.
- **Testability** — `healthClassifier.ts` becomes a pure function testable with zero mocking. `ingestSensorDataUseCase.ts` becomes testable by injecting mock repositories. No unit in the domain layer will import Prisma.
- **Maintainability** — the health classification thresholds (currently magic numbers) become named constants in a dedicated module. Adjusting the CALVING detection criteria will be a one-file change with a clear test target.
- **Scalability** — `requirePermission` operating on JWT-embedded permissions eliminates the per-request DB traversal across the entire permission graph.
- **Consistency** — all forms use React Hook Form + Zod. All pages live inside their feature module. All type definitions live in the types module for their domain. All responses follow structured error shapes via the global error handler.
- **Data integrity** — fixing the `Farm.id` type mismatch and centralizing permission names as a typed enum eliminates an entire class of silent runtime bugs that TypeScript cannot currently catch.

The architecture is superior to the current one not because it is more complex, but because it has **explicit boundaries** between layers. Today, the cost of changing the health classification algorithm, replacing local file storage with S3, or adding a caching layer on permission checks requires reading through and modifying multiple unrelated files. After reorganization, each of those changes is isolated to one module and one layer.

---

## Section 10 — Incremental Implementation Roadmap

### Phase 1 — Security gaps (do first, high blast radius)

1. Add Zod validation schemas for all POST/PUT bodies; apply via a `validateSchema` middleware factory
2. Restrict CORS to known frontend origins via environment variable
3. Serve `/uploads` through an authenticated `GET /cows/:id/photos/:filename` endpoint; remove the public static route
4. Add global Express error handler in `server.ts`; define `AppError` class for structured error responses
5. Fix `dashboardService.ts` `unreadNotifications` to filter by the authenticated user's ID

### Phase 2 — Decompose `mqttIngestService.ts`

6. Extract `validatePayload` into `mqtt/infrastructure/mqttPayloadValidator.ts`
7. Extract `persistSensorData` into `health-ingest/infrastructure/sensorRepository.ts`
8. Extract `analyzeHealth` into `health-ingest/domain/healthClassifier.ts` with named constants in `healthThresholds.ts`
9. Extract `notifyUsers` into `notifications/application/notifyUsersUseCase.ts`
10. Create `ingestSensorDataUseCase.ts` that composes the above

### Phase 3 — Infrastructure cleanup

11. Create `fileStorageAdapter.ts`; move `fs.unlinkSync` out of `cowsService.ts`
12. Move Multer configuration out of `cowsController.ts` into `fileStorageAdapter.ts`
13. Split `serviceHelpers.ts` into `assertUnique.ts` (domain utility), sensor query helper (infra), and aggregation function (domain analytics)

### Phase 4 — Type contract alignment

14. Align `Farm.id` to `number` throughout the frontend
15. Create `shared/config/permissions.ts` with a `PermissionName` typed constant map used by both layers
16. Consolidate all type definitions into their feature module's `types/index.ts`; remove inline types from service files

### Phase 5 — Frontend consistency

17. Migrate `FarmForm.tsx` to React Hook Form + Zod
18. Move all pages from `pages/auth/`, `pages/map/`, `pages/home/`, `pages/profile/` into their corresponding feature modules
19. Decompose `MapPage.tsx` into `FarmMap`, `CowPin`, `MapLegend`, `CowDetailCard`, `useMapState`
20. Refactor `FarmContext.tsx` to remove direct `useFarms()` call; accept farms as a prop or subscribe to a shared query state
21. Remove `store/` placeholder directories

### Phase 6 — Performance and authorization

22. Embed permissions in JWT payload at login; modify `requirePermission` to read from `request.user` without a DB query
23. Extract `notificationsService.ts` ownership guard into `markReadUseCase.ts` at the application layer

### Phase 7 — Test coverage foundation

24. Write unit tests for `healthClassifier.ts` covering all status transitions
25. Write integration tests for `ingestSensorDataUseCase.ts` with mock repositories
26. Write unit tests for Zod schemas at each module boundary
27. Add end-to-end tests for the MQTT ingest → health status → notification flow
