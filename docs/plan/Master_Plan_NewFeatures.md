# Master Plan — New Features
**Date**: 2026-05-25
**Author**: JCFS

---

## Executive Summary

This document consolidates all planned features and missing screens for CowHealth AI, analysed against the current system state to produce an implementation roadmap with responsibility assignments per team member.

| # | Feature | Primary owner | Risk | Status |
|---|---|---|---|---|
| A | Vitals charts grid (accelerometer) | JCFS | Low | Planned |
| B | Notifications navigate to medical record | Ian | Low | Planned |
| C | Veterinary medical record (MedicalRecord) | Renato + Ian | High | Planned |
| D | Animal retirement (Retire) | Renato + JCFS | Medium | Planned |
| E | Splash Screen | JCFS | Low | Planned |
| F | Onboarding Screen (3-step carousel) | Ian | Low | Planned |
| G | History Screen (sensor data table) | Renato + JCFS | Low | Planned |
| H | Settings Screen | Angelo | Low | Planned |
| P1 | Notifications: severity filter tabs | Ian | Low | Partial |
| P2 | Home: Pré-parto section | JCFS | Low | Partial |
| P3 | Offline banner + skeleton loading | Ian | Low | Partial |

---

## Index

- [Feature A — Vitals Charts Grid](#feature-a--vitals-charts-grid-accelerometer)
- [Feature B — Notifications Navigate to Medical Record](#feature-b--notifications-navigate-to-medical-record)
- [Feature C — Veterinary Medical Record](#feature-c--veterinary-medical-record-medicalrecord)
- [Feature D — Animal Retirement](#feature-d--animal-retirement-retire)
- [Feature E — Splash Screen](#feature-e--splash-screen)
- [Feature F — Onboarding Screen](#feature-f--onboarding-screen-3-step-carousel)
- [Feature G — History Screen](#feature-g--history-screen-sensor-data-table)
- [Feature H — Settings Screen](#feature-h--settings-screen)
- [Partial P1 — Notifications severity filters](#p1--notifications-add-severity-filter-tabs)
- [Partial P2 — Home Pré-parto section](#p2--home-add-pré-parto-section)
- [Partial P3 — Offline banner + skeleton](#p3--offline-banner--skeleton-loading)

---

## Feature A — Vitals Charts Grid (Accelerometer)

### What it is

Replace the sensor tab layout (Temperature / Heart Rate) in `CowDetailPage` with a responsive side-by-side grid that simultaneously displays Temperature, Heart Rate, and Activity (accelerometer). Add the missing accelerometer daily endpoint.

### Current system state

- `GET /cows/:id/heart-rate/daily` — **exists** (`cowsRoutes.ts:61`)
- `GET /cows/:id/temperature/daily` — **exists** (confirmed in service)
- `GET /cows/:id/accelerometer` — **exists** (raw data, `cowsRoutes.ts:58`)
- `GET /cows/:id/accelerometer/daily` — **does not exist** (only missing backend item)
- `AccelerometerData` in schema — **exists** with fields `accelX`, `accelY`, `accelZ`, `measuredAt`
- `LineChart` component — **exists** at `frontend/src/components/ui/LineChart.tsx`
- `SensorDailyPoint` type — **exists** in `frontend/src/types/cows.ts`

### Impact analysis

| Layer | File | Change | Type |
|---|---|---|---|
| Backend service | `cowsService.ts` | Add `getCowAccelerometerDaily()` | Addition |
| Backend controller | `cowsController.ts` | Add `listAccelerometerDaily` | Addition |
| Backend routes | `cowsRoutes.ts` | `GET /:id/accelerometer/daily` | Addition |
| Frontend types | `types/cows.ts` | Alias `AccelerometerDailyPoint = SensorDailyPoint` | Minimal addition |
| Frontend service | `services/cowsService.ts` | `getAccelerometerDaily()` | Addition |
| Frontend hook | `features/cows/hooks/useCows.ts` | `useCowAccelerometerDaily()` | Addition |
| Frontend page | `features/cows/pages/CowDetailPage.tsx` | Remove tabs, replace with grid | Modification |

**No breaking changes.** No schema changes. No migration required.

**Regression risk**: removing the `sensorTab` state (useState) may cause a lint error if the `useState` import becomes unused — verify in build.

### Assignments

| Task | Owner |
|---|---|
| Backend: service + controller + route | **JCFS** |
| Frontend: type + service + hook + CowDetailPage | **JCFS** |

---

## Feature B — Notifications Navigate to Medical Record

### What it is

When clicking a notification that has a `cowId`, automatically navigate to `/cows/:id` after marking it as read. Fix the shape mismatch between backend and frontend.

### Current system state

**Backend** — `notificationsService.ts` returns `readAt` (DB field) but **does not include `cowId`** in the select (field exists in the Prisma model but is not selected). There is no computed `read` field.

**Frontend** — `Notification` type declares `cowId?: string` and `read: boolean`. `NotificationsPage.tsx` has the click handler but never navigates — `cowId` always arrives as `undefined` because the backend does not select it.

**`NotificationCard.tsx`** — component that already implements navigation but is not used in `NotificationsPage` (the page renders cards inline, not via the component).

### Impact analysis

| Layer | File | Change | Type |
|---|---|---|---|
| Backend service | `notificationsService.ts` | Add `cowId: true` to select + computed `read` field | Minimal modification |
| Frontend page | `NotificationsPage.tsx` | Add `navigate(\`/cows/${n.cowId}\`)` in click handler | ~3-line change |
| Frontend type | `Notification` interface | Confirm `cowId` is `number` (not `string`) to align with backend | Possible type fix |

**No API breaking changes.** The `read` field is added (does not remove `readAt`), so existing frontend code using `readAt` will not break.

**Check**: whether `NotificationsPage` already imports `useNavigate` — add import if missing.

### Assignments

| Task | Owner |
|---|---|
| Backend: `cowId` in select + `read` field | **Ian** |
| Frontend: navigation on click | **Ian** |

---

## Feature C — Veterinary Medical Record (MedicalRecord)

### What it is

New `medical_records` table linked to `Cow` and `User`. Full CRUD with RBAC control. "Medical Record" section in `CowDetailPage` with a record list and creation modal.

### Current system state

- **No clinical table exists** in the current schema
- `CowStatus` enum has: `HEALTHY`, `CALVING`, `HEAT_STRESS`, `ALERT` — no `RETIRED`
- Project routing pattern: **flat** (no nested sub-routers) — confirmed in `cowsRoutes.ts`
- `handleRequest` helper — **exists** and is the standard across all controllers
- `requirePermission` middleware — **exists** and reads permissions from JWT (Renato already implemented)
- `validateSchema` helper — **exists** (Renato implemented in commit `d12045f`)
- `MedicalRecord` permissions — **do not exist** in seed or database

### Impact analysis

#### Schema (migration required)

```prisma
enum MedicalRecordType {
  CHECKUP
  PROCEDURE
  MEDICATION
}

model MedicalRecord {
  id         Int               @id @default(autoincrement())
  cowId      Int               @map("cow_id")
  userId     Int               @map("user_id")
  type       MedicalRecordType
  title      String
  notes      String?           @db.Text
  recordedAt DateTime          @map("recorded_at")
  createdAt  DateTime          @default(now()) @map("created_at")
  updatedAt  DateTime          @updatedAt @map("updated_at")

  cow  Cow  @relation(fields: [cowId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])

  @@index([cowId, recordedAt])
  @@map("medical_records")
}
```

The `MedicalRecord` relation must also be declared on the `Cow` model:
```prisma
// In model Cow:
medicalRecords MedicalRecord[]
```

And on the `User` model:
```prisma
medicalRecords MedicalRecord[]
```

> Note on enum values: the original plan used Portuguese (`CONSULTA`, `PROCEDIMENTO`, `MEDICACAO`). Align with the team on whether to use English equivalents (`CHECKUP`, `PROCEDURE`, `MEDICATION`) for consistency with the rest of the codebase — all other enums use English.

#### New permissions (seed)

| Permission | Veterinarian | Farm Manager | Admin | SuperAdmin |
|---|---|---|---|---|
| `ViewAny MedicalRecord` | ✅ | ✅ | ✅ | ✅ |
| `View MedicalRecord` | ✅ | ✅ | ✅ | ✅ |
| `Create MedicalRecord` | ✅ | — | ✅ | ✅ |
| `Update MedicalRecord` | ✅ | — | ✅ | ✅ |
| `Delete MedicalRecord` | ✅ | — | ✅ | ✅ |

> Farm Managers can read medical records but cannot create, edit, or delete — only veterinarians and admins write.

#### Backend — new files

| File | Contents |
|---|---|
| `backend/src/services/medicalRecordsService.ts` | `getMedicalRecords`, `getMedicalRecord`, `createMedicalRecord`, `updateMedicalRecord`, `deleteMedicalRecord` |
| `backend/src/controllers/medicalRecordsController.ts` | 5 handlers using `handleRequest` |

Mount pattern in `cowsRoutes.ts` (flat, consistent with project):
```ts
// append to cowsRoutes.ts
router.get("/:id/medical-records", requireAuth, requirePermission("ViewAny MedicalRecord"), listMedicalRecords);
router.get("/:id/medical-records/:recordId", requireAuth, requirePermission("View MedicalRecord"), showMedicalRecord);
router.post("/:id/medical-records", requireAuth, requirePermission("Create MedicalRecord"), validateSchema(createMedicalRecordSchema), storeMedicalRecord);
router.put("/:id/medical-records/:recordId", requireAuth, requirePermission("Update MedicalRecord"), validateSchema(updateMedicalRecordSchema), updateMedicalRecordController);
router.delete("/:id/medical-records/:recordId", requireAuth, requirePermission("Delete MedicalRecord"), destroyMedicalRecord);
```

> Use flat pattern (inline in `cowsRoutes.ts`) for consistency with the rest of the project. No separate router file needed.

#### Zod schema required (Renato)

```ts
// backend/src/routes/schemas/medicalRecordSchemas.ts
export const createMedicalRecordSchema = z.object({
  type: z.enum(["CHECKUP", "PROCEDURE", "MEDICATION"]),
  title: z.string().min(2).max(200),
  notes: z.string().optional(),
  recordedAt: z.string().datetime(),
});
export const updateMedicalRecordSchema = createMedicalRecordSchema.partial();
```

#### Frontend — new files

| File | Contents |
|---|---|
| `frontend/src/services/medicalRecordsService.ts` | CRUD via `api.get/post/put/delete` |
| `frontend/src/features/cows/hooks/useMedicalRecords.ts` | `useMedicalRecords`, `useCreateMedicalRecord`, `useUpdateMedicalRecord`, `useDeleteMedicalRecord` |
| `frontend/src/features/cows/components/MedicalRecordCard.tsx` | Card with type badge, date, author, collapsible notes |
| `frontend/src/features/cows/components/MedicalRecordModal.tsx` | Creation/edit modal |

#### Frontend — modifications

| File | Change |
|---|---|
| `frontend/src/types/cows.ts` | Add `MedicalRecord`, `MedicalRecordType`, `CreateMedicalRecordInput` |
| `frontend/src/features/cows/pages/CowDetailPage.tsx` | New "Medical Record" section with `useHasPermission` guard |
| `frontend/src/config/permissions.ts` | Add `VIEW_MEDICAL_RECORD`, `CREATE_MEDICAL_RECORD`, `UPDATE_MEDICAL_RECORD`, `DELETE_MEDICAL_RECORD` (after Angelo creates the file) |

#### Impact on existing functionality

- **No existing endpoints are modified**
- **CowDetailPage** grows significantly — watch for page load time (3 queries: cow + vitals + medical records)
- **Seed must be re-run** after migration to create the new permissions

### Assignments

| Task | Owner |
|---|---|
| Migration: `MedicalRecord` schema + relations on `Cow` and `User` | **Renato** |
| Seed: new permissions + role assignments | **Renato** |
| Zod schema `medicalRecordSchemas.ts` | **Renato** |
| Backend service + controller + routes | **Renato** |
| Frontend types + service + hooks | **Ian** |
| Components `MedicalRecordCard` + `MedicalRecordModal` | **Ian** |
| "Medical Record" section in `CowDetailPage` with RBAC guards | **Ian** |
| Add permissions to `PERMISSIONS` enum (`config/permissions.ts`) | **Angelo** |

---

## Feature D — Animal Retirement (Retire)

### What it is

Flow to register an animal's definitive departure (sale or slaughter). The cow receives `RETIRED` status, the associated collar is unlinked and marked `INACTIVE`, and the complete history remains in the database (soft-delete strategy).

### Current system state

- Current `CowStatus` enum: `HEALTHY`, `CALVING`, `HEAT_STRESS`, `ALERT` — **no `RETIRED`**
- `Cow` model: **does not have** `retiredAt` or `retiredReason`
- `Collar` model: has `status` field (CollarStatus enum) — confirm that `INACTIVE` already exists
- `getAllCows` in `cowsService.ts`: **does not filter** RETIRED (status does not exist yet)
- `dashboardService.ts`: counts cows via `prisma.cow.count()` and `groupBy status` — **will be affected**
- `MapPage.tsx`: renders pins for all farm cows — **will be affected**

### Impact analysis

#### Breaking changes after adding RETIRED

This is the highest-impact change in the system because the new status propagates across multiple components:

| File | Impact | Required action |
|---|---|---|
| `backend/src/services/cowsService.ts` — `getAllCows` | Will return RETIRED cows if unfiltered | Add `status: { not: "RETIRED" }` to `findMany` by default |
| `backend/src/services/dashboardService.ts` — `getDashboardOverview` | Total cow count will include RETIRED | Add same filter to `cow.count()` |
| `backend/src/services/dashboardService.ts` — `getCowsPerStatus` | RETIRED will appear in groupBy and charts | Add `where: { status: { not: "RETIRED" } }` |
| `frontend/src/types/cows.ts` — `COW_STATUS_VALUES` | Must include `RETIRED: "RETIRED"` | Addition |
| `frontend/src/features/cows/components/CowStatusBadge.tsx` | Does not handle RETIRED status | Add RETIRED case with neutral/gray badge |
| `frontend/src/pages/home/HomePage.tsx` | May display RETIRED cows in the attention strip | Filter `status !== "RETIRED"` |
| `frontend/src/pages/map/MapPage.tsx` | RETIRED cow pins will appear on the map | Filter in `simulateCowPositions` or in the query |
| `frontend/src/pages/map/CowDetailCard.tsx` | Status badge does not handle RETIRED | Add case |
| `frontend/src/features/cows/pages/CowsPage.tsx` | List may show RETIRED cows if query changes | Depends on backend filter |

#### Schema (same migration as Feature C, or separate)

```prisma
// Add to CowStatus enum:
RETIRED

// Add to Cow model:
retiredAt     DateTime? @map("retired_at")
retiredReason String?   @map("retired_reason")  // "SALE" | "SLAUGHTER"
```

#### New permission

| Permission | Farm Manager | Admin | SuperAdmin |
|---|---|---|---|
| `Retire Cow` | ✅ | ✅ | ✅ |

> Veterinarians do **not** have retirement permission — only operational managers and admins.

#### Backend

| File | Change |
|---|---|
| `backend/src/services/cowsService.ts` | Add `retireCow(cowId, reason)` + RETIRED filter in `getAllCows` |
| `backend/src/services/dashboardService.ts` | Filter RETIRED in `cow.count()` and `groupBy` |
| `backend/src/controllers/cowsController.ts` | Add `retireCowController` |
| `backend/src/routes/cowsRoutes.ts` | `POST /:id/retire` with `requirePermission("Retire Cow")` |

`retireCow` logic:
1. Find cow — throw error if not found or already `RETIRED`
2. Update cow: `status = RETIRED`, `retiredAt = now()`, `retiredReason = reason`, `collarId = null`
3. If cow had a collar: update `collar.status = INACTIVE`
4. Return updated cow

#### Frontend

| File | Change |
|---|---|
| `frontend/src/types/cows.ts` | `RETIRED` in `COW_STATUS_VALUES` and `CowStatus` |
| `frontend/src/features/cows/hooks/useCows.ts` | `useRetireCow()` mutation |
| `frontend/src/services/cowsService.ts` | `retire(id, reason)` |
| `frontend/src/features/cows/pages/CowDetailPage.tsx` | "Animal Retirement" section with `canRetire` guard |
| `frontend/src/features/cows/components/RetireAnimalModal.tsx` | New modal (SALE/SLAUGHTER selection + confirmation) |
| `frontend/src/features/cows/components/CowStatusBadge.tsx` | RETIRED case with gray/muted badge |
| `frontend/src/pages/map/MapPage.tsx` | Filter out RETIRED cow pins |
| `frontend/src/pages/home/HomePage.tsx` | Filter RETIRED from attention list |

#### Side effect on collar

After retirement, the associated collar becomes `INACTIVE`. `CollarDetailPage` must continue to work — the collar remains in the database but is no longer linked to any cow. Verify whether `CollarDetailPage` displays the previously linked cow via `collar.cow` — after retirement, both `cow.collarId` and `collar.cowId` should be `null`.

### Assignments

| Task | Owner |
|---|---|
| Migration: `RETIRED` in enum + `retiredAt/retiredReason` fields on `Cow` | **Renato** |
| Seed: `Retire Cow` permission + role assignments | **Renato** |
| Backend: `retireCow()` service + controller + route | **Renato** |
| Backend: RETIRED filter in `getAllCows` + `dashboardService` | **Renato** |
| Frontend: `RETIRED` in `COW_STATUS_VALUES` + `CowStatus` | **JCFS** |
| Frontend: `useRetireCow()` + `cowsService.retire()` | **JCFS** |
| Frontend: "Animal Retirement" section in `CowDetailPage` + `RetireAnimalModal` | **JCFS** |
| Frontend: RETIRED case in `CowStatusBadge` | **Angelo** (already working on UI guards) |
| Frontend: filter RETIRED in `MapPage` and `HomePage` | **JCFS** |
| Add `RETIRE_COW` to `PERMISSIONS` enum | **Angelo** |

---

## Global implementation order

The sequence respects dependencies between database, backend, and frontend:

```
1.  [Renato]  Migration: MedicalRecord + RETIRED status + retiredAt/retiredReason
2.  [Renato]  Seed: new permissions (MedicalRecord CRUD + Retire Cow) + role assignments
3.  [Renato]  Backend Feature D: retireCow service + controller + route
4.  [Renato]  Backend Feature D: RETIRED filter in getAllCows + dashboardService
5.  [Renato]  Backend Feature C: medicalRecords CRUD (service + controller + routes + Zod schema)
6.  [Ian]     Backend Feature B: cowId in notifications select + read field
7.  [JCFS]   Backend Feature A: getCowAccelerometerDaily + controller + route
8.  [Angelo]  Frontend: RETIRE_COW + MedicalRecord permissions in config/permissions.ts
9.  [JCFS]   Frontend Feature A: type + service + hook + CowDetailPage grid
10. [JCFS]   Frontend Feature D: RETIRED in enum + useRetireCow + RetireAnimalModal + CowDetailPage
11. [JCFS]   Frontend Feature D: filter RETIRED in MapPage and HomePage
12. [Ian]     Frontend Feature B: navigation on click in NotificationsPage
13. [Ian]     Frontend Feature C: types + service + hooks + MedicalRecordCard + MedicalRecordModal
14. [Ian]     Frontend Feature C: Medical Record section in CowDetailPage
15. [Angelo]  Frontend: RETIRED case in CowStatusBadge
```

---

## Responsibility summary

### Renato (rpgouveia)

Backend-heavy. Prerequisite for Ian and JCFS on the frontend.

- Migration with `MedicalRecord`, `RETIRED`, `retiredAt`, `retiredReason`
- Seed with 6 new permissions + correct role assignments
- `retireCow()` + `POST /:id/retire` endpoint
- RETIRED filter in `getAllCows` and `dashboardService`
- Full medical CRUD (service + controller + routes + Zod)

### Ian (DevIanBraz)

Frontend for features C and B, after Renato delivers the migration and backend.

- Notification shape fix (minimal backend) + navigation (frontend)
- `MedicalRecord` types + service + hooks
- `MedicalRecordCard` and `MedicalRecordModal` components
- Medical Record section in `CowDetailPage`

### Angelo (PJorgeto)

Can work in parallel — no dependency on the migration.

- Create `frontend/src/config/permissions.ts` with **all** permissions including new ones (`RETIRE_COW`, `VIEW_MEDICAL_RECORD`, `CREATE_MEDICAL_RECORD`, `UPDATE_MEDICAL_RECORD`, `DELETE_MEDICAL_RECORD`)
- `RETIRED` case in `CowStatusBadge`

### JCFS

Feature A (independent) can be delivered at any time. Feature D frontend depends on Renato's migration.

- Feature A: accelerometer endpoint + vitals chart grid (independent)
- Feature D frontend: RETIRED status in types, retire hook, modal, map/home filters

---

## Critical dependencies

```
Renato (migration) ──> Ian (Feature C frontend)
Renato (migration) ──> JCFS (Feature D frontend)
Angelo (permissions.ts) ──> Ian (RBAC guards in medical record section)
Angelo (permissions.ts) ──> JCFS (canRetire guard in retirement section)
Feature A ──── independent (can be delivered in any order)
Feature B ──── nearly independent (only requires reading current schema)
```

---

## Acceptance criteria per feature

### Feature A
1. `GET /cows/:id/accelerometer/daily` returns `[{ date, average }]`
2. `CowDetailPage` on desktop (>600px): 3 charts side-by-side, 200px height
3. `CowDetailPage` on mobile (<560px): single column stacked
4. Cow without accelerometer data: Activity card does not appear, no error

### Feature B
1. Clicking a notification with `cowId` → marks as read → navigates to `/cows/:id`
2. Clicking a notification without `cowId` → marks as read → stays on the page

### Feature C
1. User with `Create MedicalRecord` sees "+ Record" button in CowDetailPage
2. User without permission does not see the button
3. POST creates record, appears in the list without manual reload
4. Farm Manager can read but cannot create/edit/delete
5. Build with zero TypeScript errors after all components are in place

### Feature D
1. User with `Retire Cow` sees "Animal Retirement" section in CowDetailPage
2. Confirm SLAUGHTER → cow disappears from `/cows` list and map
3. Associated collar becomes `INACTIVE` in the database
4. Dashboard does not count the retired cow in KPIs
5. Admin with `?includeRetired=true` can access historical data
6. `CowStatusBadge` displays gray/muted badge for RETIRED status without errors

---

## Feature E — Splash Screen

### What it is

Branded loading screen shown on app startup while the JWT token is validated and initial React Query hydration runs. Displays the CowHealth AI logo and a "Sincronizando coleiras…" status indicator. Not a real route — rendered conditionally in `AppRoutes.tsx` during auth resolution.

### Current system state

- No splash/loading gate exists; the app renders the protected route immediately, which can cause a flash of the login screen on refresh even when a valid JWT is in `localStorage`
- `useAuth` hook resolves asynchronously — there is a brief `isLoading` window with no UI
- Design reference: `templates/NewCowHealthAI/screens-1.jsx` `SplashScreen`

### Impact analysis

| Layer | File | Change | Type |
|---|---|---|---|
| Frontend page | `frontend/src/pages/splash/SplashPage.tsx` | New component | Addition |
| Frontend routes | `frontend/src/routes/AppRoutes.tsx` | Render `<SplashPage />` while `useAuth` is loading | Modification |

**No backend changes. No schema changes. No migration required.**

Duration: 1.2–2 s auto-navigate. On success → `/home`; on failure → `/login`.

### Assignments

| Task | Owner |
|---|---|
| `SplashPage.tsx` + `AppRoutes.tsx` auth gate | **JCFS** |

---

## Feature F — Onboarding Screen (3-step carousel)

### What it is

First-run experience shown only once (flag persisted as `localStorage` key `onboardingDone`). Three slides: (1) collar monitoring intro, (2) alert system, (3) farm selector. Accessible again from the Profile page via a "Ver tutorial" link.

### Current system state

- No onboarding flow exists
- Design reference: `templates/NewCowHealthAI/screens-1.jsx` `OnboardingScreen` — hero illustration with SVG grid + CowMark, pagination dots, "Próximo" button, "Pular" link

### Impact analysis

| Layer | File | Change | Type |
|---|---|---|---|
| Frontend page | `frontend/src/pages/onboarding/OnboardingPage.tsx` | New component | Addition |
| Frontend routes | `frontend/src/routes/AppRoutes.tsx` | Add `/onboarding` public route | Addition |
| Frontend | `AppRoutes.tsx` or `AppShell.tsx` | Check `!localStorage.getItem("onboardingDone")` after login | Modification |

**No backend changes. No schema changes. No migration required.**

Condition: shown when `!localStorage.getItem("onboardingDone")`; sets flag on "Pular" or last slide "Concluir".

### Assignments

| Task | Owner |
|---|---|
| `OnboardingPage.tsx` + route + first-run gate | **Ian** |
| "Ver tutorial" link in `ProfilePage.tsx` | **Ian** |

---

## Feature G — History Screen (Sensor Data Table)

### What it is

Tabular view of raw sensor readings for a specific cow over a selectable time window. Accessed from `CowDetailPage` via a "Histórico" button. Shows: date/time, temperature, heart rate, activity, status dot. Includes a CSV export button.

### Current system state

- No history route or page exists
- Backend has raw data endpoints (`GET /cows/:id/heart-rate`, `/accelerometer`) but no unified time-window query
- Design reference: `templates/NewCowHealthAI/screens-2.jsx` `HistoryScreen` — sticky header table, date/time range picker, "Exportar" button
- `.data-table` CSS class already exists in `frontend/src/styles/App.css`

### Impact analysis

#### Backend — new endpoint

```
GET /cows/:id/sensor-history?from=<ISO>&to=<ISO>
```

Returns paginated array of `{ measuredAt, temperature, heartRate, activity, status }` — one row per ingest window, joining `HeartRateData`, `TemperatureData`, `AccelerometerData` by `measuredAt`.

| Layer | File | Change | Type |
|---|---|---|---|
| Backend service | `backend/src/services/cowsService.ts` | Add `getCowSensorHistory(cowId, from, to)` | Addition |
| Backend controller | `backend/src/controllers/cowsController.ts` | Add `listSensorHistory` | Addition |
| Backend routes | `backend/src/routes/cowsRoutes.ts` | `GET /:id/sensor-history` | Addition |

#### Frontend

| Layer | File | Change | Type |
|---|---|---|---|
| Frontend page | `frontend/src/features/cows/pages/CowHistoryPage.tsx` | New page | Addition |
| Frontend routes | `frontend/src/routes/AppRoutes.tsx` | `/cows/:id/history` | Addition |
| Frontend navigation | `frontend/src/features/cows/pages/CowDetailPage.tsx` | Add "Histórico" button | Modification |

Date range: simple `<input type="date">` + "Aplicar" button (no external dependency).
Export: client-side CSV from response data or `window.open(\`/cows/${id}/sensor-history?format=csv\`)`.

### Assignments

| Task | Owner |
|---|---|
| Backend: `getCowSensorHistory` service + controller + route | **Renato** |
| Frontend: `CowHistoryPage.tsx` + route | **JCFS** |
| Frontend: "Histórico" button in `CowDetailPage` | **JCFS** |

---

## Feature H — Settings Screen

### What it is

User-level settings accessible from the Profile page (settings icon in AppBar). Two sections:
1. **Notifications**: toggles for critical alerts, warnings, daily summary, email/SMS
2. **Account**: edit profile link, password & security, language, LGPD privacy

Data collection frequency (collar reading interval) is an **admin-only** setting — not included in this screen to avoid confusion for Viewers.

### Current system state

- No `/settings` route exists
- Profile page AppBar has a settings icon in the design but it is not wired
- Design reference: `templates/NewCowHealthAI/screens-3.jsx` `SettingsScreen` — toggle switches, section headers

### Impact analysis

| Layer | File | Change | Type |
|---|---|---|---|
| Frontend page | `frontend/src/pages/settings/SettingsPage.tsx` | New page | Addition |
| Frontend routes | `frontend/src/routes/AppRoutes.tsx` | `/settings` protected route | Addition |
| Frontend navigation | `frontend/src/pages/profile/ProfilePage.tsx` | Wire settings icon → `navigate("/settings")` | Modification |

**Backend considerations (open question)**:
- Notification preferences can be persisted in `localStorage` only (prototype-acceptable, no migration) — **recommended for this iteration**
- Alternatively: add `notifPreferences JSON?` field to `User` model + `GET/PUT /users/me/preferences` endpoints
- Decision needed before implementation: see open questions below

**Toggle component**: inline CSS toggle — no external dependency, pattern consistent with design system.

### Open question

> Should notification preferences be persisted **in the database** (requires Prisma migration + backend endpoints) or in **localStorage only** (simpler, prototype-acceptable)?
>
> Recommendation: localStorage-only for this iteration; backend sync can be added in a follow-up.

### Assignments

| Task | Owner |
|---|---|
| `SettingsPage.tsx` + route + ProfilePage navigation | **Angelo** |
| (Optional) backend `notifPreferences` if database persistence chosen | **Renato** |

---

## Partial completions — design alignment

These are not new screens but require targeted changes to match the Hi-Fi design.

### P1 — Notifications: add severity filter tabs

**Design**: `AlertsScreen` (`screens-2.jsx`) has filter pills: "Todos · 14", "Críticos · 1", "Avisos · 2", "Resolvidos"
**Current**: `NotificationsPage.tsx` only has "All / Unread" chips
**Change**: Add "Críticos" (danger severity), "Avisos" (warn severity), "Resolvidos" (readAt != null) filter tabs

| File | Change |
|---|---|
| `frontend/src/features/notifications/pages/NotificationsPage.tsx` | Add severity filter state + pill UI |

**Owner**: Ian

---

### P2 — Home: add Pré-parto section

**Design**: `HomeScreen` (`screens-1.jsx`) has a "Pré-parto (2)" card showing cows near calving with offline badge
**Current**: `HomePage.tsx` has no pre-calving section
**Change**: Query cows with `status === "CALVING"` and display as a horizontal-scroll card strip

| File | Change |
|---|---|
| `frontend/src/pages/home/HomePage.tsx` | Add pre-calving card strip |

**Owner**: JCFS

---

### P3 — Offline banner + skeleton loading

**Design doc (Design.md §9.3)**: Every screen with remote data must cover Full / Empty / Loading (skeleton) / Error+offline states
**Current**: Generic `EmptyState` and `ErrorState` components exist; no offline detection or banner

**Changes**:
- New component: `frontend/src/components/ui/OfflineBanner.tsx` — 32px, `--warning-soft` bg, wifi-off icon + "Offline · última sync: hh:mm"
- Offline detection: `navigator.onLine` + `window.addEventListener('offline'/'online')`
- Render banner globally in `AppShell.tsx`
- Skeleton shimmer: add `.skeleton` CSS class with shimmer animation to `App.css` (uses `--bg-elev-2` + gradient)

| File | Change |
|---|---|
| `frontend/src/components/layout/AppShell.tsx` | Import and render `<OfflineBanner />` |
| `frontend/src/styles/App.css` | Add `.skeleton` shimmer class |
| `frontend/src/components/ui/OfflineBanner.tsx` | New component |

**Owner**: Ian

---

## Updated implementation order (Features E–H + Partials)

```
E.        [JCFS]   Splash Screen — auth check gate (no deps)
F.        [Ian]    Onboarding Screen — first-run localStorage gate (no deps)
G-back.   [Renato] GET /cows/:id/sensor-history endpoint
G-front.  [JCFS]   CowHistoryPage + route + navigation from CowDetailPage
H.        [Angelo] Settings page (localStorage-only prefs, no migration needed)
P1.       [Ian]    Notifications severity filter tabs
P2.       [JCFS]   Home pre-calving section
P3.       [Ian]    Offline banner + skeleton shimmer in AppShell
```

---

## Updated responsibility summary (Features E–H)

### JCFS (additions)
- Feature E: `SplashPage.tsx` + auth gate in `AppRoutes.tsx`
- Feature G frontend: `CowHistoryPage.tsx` + route + `CowDetailPage` navigation
- Partial P2: pre-calving section in `HomePage.tsx`

### Ian (additions)
- Feature F: `OnboardingPage.tsx` + route + first-run gate + "Ver tutorial" link
- Partial P1: severity filters in `NotificationsPage.tsx`
- Partial P3: `OfflineBanner.tsx` + `AppShell.tsx` + `.skeleton` CSS

### Angelo (additions)
- Feature H: `SettingsPage.tsx` + route + ProfilePage settings icon wiring

### Renato (additions)
- Feature G backend: `getCowSensorHistory` service + controller + route
- Feature H backend (optional, if database persistence chosen): `notifPreferences` migration + endpoints

---

## Acceptance criteria — Features E–H

### Feature E
1. On cold start with valid JWT: Splash shown for ≥ 1.2 s, then navigates to `/home`
2. On cold start without JWT: Splash shown briefly, then navigates to `/login`
3. No flash of login screen when a valid session already exists

### Feature F
1. First visit after install: Onboarding appears before `/home`
2. "Pular" on any slide → sets `onboardingDone` → navigates to `/home`
3. Completing last slide → sets `onboardingDone` → navigates to `/home`
4. Subsequent visits: Onboarding does not appear (flag is set)
5. Profile "Ver tutorial" → navigates to `/onboarding` (clears flag or forces show)

### Feature G
1. `GET /cows/:id/sensor-history` returns data rows with `measuredAt`, `temperature`, `heartRate`, `activity`
2. Date range filter applied via `from`/`to` query params
3. Table renders with `.data-table` class, sticky header, correct columns
4. "Exportar" downloads a CSV with the current filtered data
5. Empty state shown when no readings exist for the selected window

### Feature H
1. Settings icon in ProfilePage AppBar navigates to `/settings`
2. Toggle switches render and update state (localStorage)
3. Settings persist across page reloads (localStorage)
4. All sections visible per design: Notificações, Conta
