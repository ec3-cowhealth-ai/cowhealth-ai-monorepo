# Handoff for Angelo, Ian, and Renato — 2026-05-24

This document describes the current state of the project, what has already been done, and what each person needs to deliver now.

---

## General state

The project is functional with the database, backend, and frontend integrated.
Build passes with **zero TypeScript errors** in the frontend and backend.

### What already exists and works

| Screen / Functionality                            | Status |
| ------------------------------------------------- | ------ |
| Landing Page                                      | Ready  |
| Login + Register (form + Zod validation)          | Ready  |
| Dashboard with KPIs and charts (Recharts)         | Ready  |
| Cow List and detail (with sensors)                | Ready  |
| Collar List and detail                            | Ready  |
| Farm List and detail                              | Ready  |
| Notifications (mark read, mark all)               | Ready  |
| Access Management: Users, Roles, Permissions      | Ready  |
| Map with farm layout and cow pins                 | Ready  |
| User profile                                      | Ready  |
| MQTT ingestion + heuristic health analysis        | Ready  |
| Selected farm context (FarmContext)               | Ready  |
| Seed with 160 cows, 5 farms, sensor data          | Ready  |

---

## Angelo — What's missing for you

### 0. Protect UI actions by role (MAIN — this is what the professor wants)

The professor wants "screens for all roles implemented". Today, any logged-in user sees all create/edit/delete buttons. A VIEWER should not see these actions.

The screens exist. The `useHasPermission` hook already exists in `frontend/src/hooks/usePermission.ts`.
It remains to be applied to condition the buttons on each page.

**Pattern to follow on each page:**

```tsx
import { useHasPermission } from "@hooks/usePermission";

// inside the component:
const canCreate = useHasPermission("Create Farm");
const canEdit = useHasPermission("Update Farm");
const canDelete = useHasPermission("Delete Farm");

// in JSX — hide the button if no permission:
{
  canCreate && (
    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
      New Farm
    </button>
  );
}
```

**Page and permission map:**

| Page                   | Button/Action  | Required Permission |
| ---------------------- | -------------- | -------------------- |
| `FarmsPage.tsx`        | "New Farm"     | `"Create Farm"`      |
| `FarmDetailPage.tsx`   | Edit farm      | `"Update Farm"`      |
| `FarmDetailPage.tsx`   | Delete farm    | `"Delete Farm"`      |
| `CowsPage.tsx`         | "New Cow"      | `"Create Cow"`       |
| `CowDetailPage.tsx`    | Edit cow       | `"Update Cow"`       |
| `CowDetailPage.tsx`    | Delete cow     | `"Delete Cow"`       |
| `CollarsPage.tsx`      | "New Collar"   | `"Create Collar"`    |
| `CollarDetailPage.tsx` | Edit collar    | `"Update Collar"`    |
| `CollarDetailPage.tsx` | Delete collar  | `"Delete Collar"`    |

**How to verify that it's working:**

1. Log in as `admin@admin.com` — should see all buttons.
2. Log in as `ana@farm.com` (Viewer) — create/edit/delete buttons should disappear.
3. Log in as `pedro@farm.com` (Manager) — should see operational buttons but not /access.

After each page, run `npm run build` to ensure zero TypeScript errors.

---

### 1. Adjust Farm → Cows access by role (investigate + propose change)

**Context — what the database has today:**

| Role            | Users                                      | Relevant permissions                                          |
| --------------- | ------------------------------------------ | ------------------------------------------------------------- |
| `SuperAdmin`    | admin@admin.com                            | All                                                           |
| `Administrator` | pedro@farm.com (MANAGER)                   | Everything except managing Permissions                        |
| `Veterinarian`  | joao@vet.com, maria@farm.com, ana@farm.com | View anything + everything about Cow + everything about Notification |

**The problem:** the permission filter for `vetRole` in the seed (`seed.ts` line ~238) includes everything that contains `"Cow"` — this gives `Create Cow`, `Update Cow`, and `Delete Cow` to `maria@farm.com` and `ana@farm.com`, who have `profile: VIEWER`. An Observer can create and delete cows.

**What to investigate:**
Open `backend/prisma/seed.ts` and locate the `vetRole` block. The current filter is:

```ts
p.name.includes("ViewAny") ||
  p.name.includes("View") ||
  p.name.includes("Cow") || // ← gives Create/Update/Delete Cow to viewers
  p.name.includes("Notification"); // ← gives Create/Update/Delete Notification to viewers
```

**What to correct in the seed:**

Separate `vetRole` into two more precise roles:

```ts
// Role for those who take care of animal health (Veterinarian — MANAGER)
// can view everything + create/edit/delete cows
const vetRole = await prisma.role.create({
  data: {
    name: "Veterinarian",
    permissions: {
      create: createdPermissions
        .filter(
          (p) =>
            p.name.includes("ViewAny") ||
            p.name.includes("View") ||
            (p.name.includes("Cow") && !p.name.includes("Delete")) ||
            (p.name.startsWith("View") && p.name.includes("Notification")),
        )
        .map((p) => ({ permissionId: p.id })),
    },
  },
});

// Role for those who only observe (Observer — VIEWER)
// read-only: no Create/Update/Delete on any entity
const observerRole = await prisma.role.create({
  data: {
    name: "Observer",
    permissions: {
      create: createdPermissions
        .filter(
          (p) => p.name.startsWith("ViewAny") || p.name.startsWith("View "),
        )
        .map((p) => ({ permissionId: p.id })),
    },
  },
});

// Assign correctly:
// { email: "maria@farm.com", role: observerRole }
// { email: "ana@farm.com",   role: observerRole }
// { email: "joao@vet.com",   role: vetRole }
```

**Proposed change to document and discuss with the group:**

Today, access to Farm → Cows is global — any authenticated user sees all farms and all cows. This does not reflect the reality of a producer who only manages their own farm.

Proposal: add `UserFarm` table (N:N relationship between User and Farm) and filter `/farms` and `/cows` endpoints to return only the logged-in user's farm data, except for SuperAdmin who sees everything.

```
User ──< UserFarm >── Farm ──< Cow
```

This is a schema change (Prisma migration) — discuss with the group before implementing to avoid breaking the seed or other endpoints.

---

### 3. Correct `Farm.id`: `string` → `number`

**File:** `frontend/src/types/farms.ts`

The backend returns `id` as an integer, but the type is declared as `string`.
This causes `Number(id)` / `String(id)` casts scattered in the code.

```ts
// CURRENT (wrong)
export interface Farm {
  id: string;
  ...
}

// CORRECT
export interface Farm {
  id: number;
  ...
}
```

After changing, run `npm run build` and fix all type errors that appear.
Search for `Number(.*id)` and `String(.*id)` in the frontend to clean up unnecessary casts.

---

### 4. Create permission names enum

**File to create:** `frontend/src/config/permissions.ts`

Today `useHasPermission("View Cow")` accepts any string — a typo silences the guard without error.

```ts
// frontend/src/config/permissions.ts
export const PERMISSIONS = {
  VIEW_COW: "View Cow",
  CREATE_COW: "Create Cow",
  UPDATE_COW: "Update Cow",
  DELETE_COW: "Delete Cow",
  VIEW_FARM: "ViewAny Farm",
  CREATE_FARM: "Create Farm",
  UPDATE_FARM: "Update Farm",
  DELETE_FARM: "Delete Farm",
  VIEW_COLLAR: "ViewAny Collar",
  CREATE_COLLAR: "Create Collar",
  UPDATE_COLLAR: "Update Collar",
  DELETE_COLLAR: "Delete Collar",
  VIEW_USER: "ViewAny User",
  CREATE_USER: "Create User",
  UPDATE_USER: "Update User",
  DELETE_USER: "Delete User",
  VIEW_ROLE: "ViewAny Role",
  CREATE_ROLE: "Create Role",
  UPDATE_ROLE: "Update Role",
  DELETE_ROLE: "Delete Role",
  VIEW_PERMISSION: "ViewAny Permission",
  CREATE_PERMISSION: "Create Permission",
  UPDATE_PERMISSION: "Update Permission",
  DELETE_PERMISSION: "Delete Permission",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
```

Then change `useHasPermission` in `frontend/src/hooks/usePermission.ts`:

```ts
// from:
export const useHasPermission = (permissionName: string): boolean => {
// to:
export const useHasPermission = (permissionName: PermissionName): boolean => {
```

Confirm exact names by consulting the database or `backend/prisma/seed.ts`.

---

## Ian — What's missing for you

### 1. Mobile bottom nav — correct iOS and Android support

**Files:** `frontend/src/styles/App.css` + `frontend/src/components/layout/BottomNav.tsx`

The current CSS has `padding-bottom: env(safe-area-inset-bottom, 0)` but the height remains fixed at `64px`, which causes two problems:

- **iOS** (notch/Dynamic Island): the padding pushes internal content but the bar doesn't grow — icons are squeezed behind the home indicator.
- **Android** (gesture navigation): the bar does not yield space for the gesture bar, appearing cut off on devices without physical buttons.

**CSS fix** — replace the `.bottom-nav` block:

```css
.bottom-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: var(--bg-elev-1);
  border-top: 1px solid var(--border);
  /* real height = 64px content + safe area below */
  padding-bottom: env(safe-area-inset-bottom, 0px);
  height: calc(64px + env(safe-area-inset-bottom, 0px));
  position: sticky;
  bottom: 0;
  z-index: 20;
  /* prevents scroll bounce from overlapping bar on iOS */
  -webkit-transform: translateZ(0);
}
```

**Item fix** — buttons should only occupy the 64px of content, not the safe area padding:

```css
.bottom-nav__item {
  height: 64px; /* fix item height, do not inherit from grid */
  align-self: start; /* anchor to grid top, do not stretch */
  /* rest remains the same */
}
```

**Mandatory test:**

- iOS Safari: open on iPhone (or DevTools › iPhone 14 Pro) — home indicator should not overlap icons.
- Android Chrome: gesture mode — bar should yield space for the gesture area.
- Both with screen rotation — bar should adapt (in landscape, safe-area-inset changes sides).

---

### 2. Herd Cards — change from list to tile (2-column grid)

**File:** `frontend/src/features/cows/pages/CowsPage.tsx`

Today it uses `cow-row` (horizontal list layout). Change to a 2-tile-per-row grid — more visual, more information visible at once, expected standard for herd listings in agricultural apps.

**Replace the list block** (line ~118 onwards):

```tsx
// BEFORE — vertical list
<div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
  {filtered.map((cow: Cow) => (
    <button key={cow.id} className="cow-row" onClick={...}>
      ...
    </button>
  ))}
</div>

// AFTER — tile grid
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
  {filtered.map((cow: Cow) => (
    <button
      key={cow.id}
      className="card"
      onClick={() => navigate(`/cows/${cow.id}`)}
      style={{ textAlign: "left", cursor: "pointer", padding: "var(--s-4)", display: "flex", flexDirection: "column", gap: "var(--s-2)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <CowHead size={32} color={statusColor(cow.status)} />
        <StatusDot tone={statusTone(cow.status)} pulse={cow.status === CowStatusValues.ALERT} />
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: "var(--t-sm)", fontFamily: "var(--font-display)" }}>
          {cow.name}
        </p>
        <p style={{ fontSize: "var(--t-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          #{cow.tag}
        </p>
      </div>
      <span style={{
        fontSize: "var(--t-xs)", fontWeight: 600,
        color: statusColor(cow.status),
        background: `color-mix(in srgb, ${statusColor(cow.status)} 12%, transparent)`,
        borderRadius: 999, padding: "2px 8px", alignSelf: "flex-start",
      }}>
        {STATUS_LABEL[cow.status] ?? cow.status}
      </span>
    </button>
  ))}
</div>
```

Verify if `.card` class exists in `App.css` before using — if not, use `className="kpi-card"` or create inline style.

---

### 3. Correct `unreadNotifications` in dashboard (security bug)

**File:** `backend/src/services/dashboardService.ts`
**File:** `backend/src/controllers/dashboardController.ts`

The current counter shows unread notifications from **all users** — any Viewer sees the global total.

**Step 1:** Read `userId` from the JWT token in the controller:

```ts
// backend/src/controllers/dashboardController.ts
export const overview = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const farmId = request.query.farmId
    ? Number(request.query.farmId)
    : undefined;
  const userId = request.user!.sub; // already available via requireAuth
  await handleRequest(response, () => getDashboardOverview(farmId, userId));
};
```

**Step 2:** Receive and use `userId` in the service:

```ts
// backend/src/services/dashboardService.ts
export const getDashboardOverview = async (farmId?: number, userId?: number) => {
    ...
    prisma.notification.count({ where: { readAt: null, userId } }),  // filter by user
    ...
};
```

---

### 4. Implement `DashboardOverviewChart` (time series LineChart)

This chart was removed because a time series endpoint does not exist yet.

**Backend:** create `GET /dashboard/health-timeline` that returns cow count by status per day in the last 7 days:

```ts
// Expected response:
[
  { date: "2026-05-18", healthy: 140, alert: 12, heatStress: 5, calving: 3 },
  { date: "2026-05-19", healthy: 138, alert: 14, ... },
  ...
]
```

**Frontend:** reactivate `DashboardOverviewChart.tsx` with `LineChart` from Recharts consuming this endpoint.

---

## Renato — What's missing for you

Items are marked with `TODO[RENATO]` in the code. The files are:

### 1. Restricted CORS — `backend/src/server.ts`

```ts
// CURRENT
app.use(cors());

// CORRECT
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") }));
// Add to .env: ALLOWED_ORIGINS=http://localhost:5173
```

### 2. Authenticated Uploads — `backend/src/server.ts`

Remove the line:

```ts
app.use("/uploads", express.static(...));
```

Create authenticated endpoint:

```ts
router.get(
  "/:id/photos/:filename",
  requireAuth,
  requirePermission("View Cow"),
  async (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "uploads", req.params.filename));
  },
);
```

### 3. Global error handler — `backend/src/server.ts`

Add **before** `app.listen`:

```ts
import { Request, Response, NextFunction } from "express";

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
```

### 4. Input validation in controllers

All `request.body` arrive without validation. Install Zod if not already, create schemas, and apply as middleware.

Example for farms — create `backend/src/routes/schemas/farmSchemas.ts`:

```ts
import { z } from "zod";

export const createFarmSchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().min(14),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().length(2),
  phone: z.string().min(8),
  email: z.string().email(),
});
```

Apply to route:

```ts
router.post(
  "/",
  requireAuth,
  requirePermission("Create Farm"),
  validateSchema(createFarmSchema),
  storeFarm,
);
```

Where `validateSchema` is a middleware factory:

```ts
// backend/src/helpers/validateSchema.ts
import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateSchema =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({ error: result.error.flatten().fieldErrors });
      return;
    }
    req.body = result.data;
    next();
  };
```

Apply to **all** controllers that receive POST/PUT: farms, cows, collars, users, roles, permissions, auth.

### 5. `requirePermission` without DB query per request — `backend/src/middlewares/requirePermission.ts`

Embed `permissions[]` in the JWT payload on login:

```ts
// backend/src/services/authService.ts — in login() function
const permissions = await prisma.permission.findMany({
  where: { roles: { some: { users: { some: { userId: user.id } } } } },
  select: { name: true },
});
const token = jwt.sign(
  { sub: user.id, permissions: permissions.map((p) => p.name) },
  SECRET,
);
```

In the middleware, read from `request.user` without additional query:

```ts
const allowed = request.user?.permissions?.includes(permissionName) ?? false;
```

---

## How to run the project

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev

# Frontend (another terminal)
cd frontend
npm install
npm run dev
```

Test credentials: `admin@admin.com` / `password123`

---

## Branches

- Create `feature/<name>-<description>` branch from `main`.
- Open PR to `develop`.
- Run `npm run build` before opening PR (must pass with zero errors).
- Update `docs/change_control/CHANGELOG.md` in your section.
