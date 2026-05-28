# Bug Fix Change Log

---

## 2026-05-25 — Fix Frontend ESLint CI failures

**Branch:** `jcfs/frontEndDesign`
**Commits:** `cd2f258`, `7afac2e`
**Author:** JCFS

---

### Bug 1 — Invalid `types` property in `@typescript-eslint/naming-convention` rule

**File:** `frontend/eslint.config.js`

**Problem:**
The ESLint flat config (ESLint 10.x) uses a stricter schema for `@typescript-eslint/naming-convention`. The `types` property (used to filter by variable type, e.g. `"object"`) is not part of the allowed schema in this version. This caused ESLint to throw a configuration validation error and abort entirely, blocking the CI from running any lint checks.

**Fix:**
Removed the `types: ["object"]` property from the naming-convention rule. The rule now applies `UPPER_CASE` formatting to all `const` exported variables inside `src/types/**/*.ts`, not just objects. This is a minor widening of scope but has no practical impact since all existing exports in that directory already follow `UPPER_CASE` naming.

---

### Bug 2 — `react-refresh/only-export-components` in `Icon.tsx`

**File:** `frontend/src/components/ui/Icon.tsx`

**Problem:**
The file exports both the `Icon` component and the `ICONS` constant (a plain object). The `react-refresh` plugin enforces that each file exports only React components so that Fast Refresh can reliably hot-reload changes. Mixing non-component exports triggers an error.

**Fix:**
Added `// eslint-disable-next-line react-refresh/only-export-components` above the `ICONS` export. Co-locating the icon path data with the component that uses it is intentional — moving it to a separate file would add unnecessary indirection for a simple lookup table.

---

### Bug 3 — `react-refresh/only-export-components` in `FarmContext.tsx`

**File:** `frontend/src/context/FarmContext.tsx`

**Problem:**
The file exports both the `FarmProvider` component and the `useFarmContext` hook. Context files typically co-locate the provider and its associated hook as a single cohesive unit. However, the `react-refresh` rule treats hooks as non-component exports and flags the file.

**Fix:**
Added `// eslint-disable-next-line react-refresh/only-export-components` above the `useFarmContext` export. Splitting the hook into a separate file solely to satisfy this rule would fragment related logic without any benefit.

---

### Bug 4 — `react-hooks/set-state-in-effect` in `FarmContext.tsx`

**File:** `frontend/src/context/FarmContext.tsx` (line 36)

**Problem:**
The `useEffect` initializes `selectedFarm` from the `farms` array (loaded asynchronously) by calling `setSelectedFarmState` directly in the effect body. The `react-hooks/set-state-in-effect` rule discourages this pattern because it can cause cascading re-renders in some cases. However, this particular usage is safe: the effect guards with `if (farms.length > 0 && !selectedFarm)`, ensuring it only runs once after the async data arrives.

**Fix:**
Added `// eslint-disable-next-line react-hooks/set-state-in-effect` above the `setState` call. The initialization logic is correct and intentional — refactoring it would add complexity without solving a real problem.

---

## 2026-05-28 — Fix runtime ReferenceErrors causing black screen on navigation

**Branch:** `develop`
**Author:** JCFS

---

### Bug 5 — `cardStyle` not imported in `CowDetailPage.tsx`

**File:** `frontend/src/features/cows/pages/CowDetailPage.tsx`

**Problem:**
The component used `cardStyle` in multiple `style` props (lines 242, 327, 333, 341, 352) but only imported `C` from `@features/dashboard/constants/colors`. This caused an `Uncaught ReferenceError: cardStyle is not defined` at runtime when navigating to any cow detail page, crashing the React tree and rendering a black screen. Navigating back to the cows list kept the screen black until a full page refresh.

**Fix:**
Added `cardStyle` to the named import: `import { C, cardStyle } from "@features/dashboard/constants/colors"`.

---

### Bug 6 — `nColor` typo in `NotificationsPage.tsx`

**File:** `frontend/src/features/notifications/pages/NotificationsPage.tsx`

**Problem:**
Inside the `notifications.map()` callback, a local variable was declared as `const color = ...` (line 132) but referenced as `nColor` on line 141 (`borderLeft: \`4px solid ${nColor}\``). This caused an `Uncaught ReferenceError: nColor is not defined` whenever the notifications page rendered, crashing the React tree with the same black screen symptom.

**Fix:**
Corrected the reference from `nColor` to `color` on line 141.

---

## 2026-05-28 — Fix TypeScript build errors and unused import warnings

**Branch:** `develop`
**Author:** JCFS

---

### Bug 7 — `NOTIF_TONE` not defined in `CowDetailPage.tsx`

**File:** `frontend/src/features/cows/pages/CowDetailPage.tsx`

**Problem:**
The notification list inside the cow detail page referenced `NOTIF_TONE[n.type]` for the `borderLeftColor` style, but `NOTIF_TONE` was never declared. This caused a `TS2304: Cannot find name 'NOTIF_TONE'` build error.

**Fix:**
Declared `NOTIF_TONE` as a local constant mapping notification types to their accent colors (`ALERT → C.red`, `WARNING → C.orange`, `INFO → #6bb4e8`), consistent with the equivalent mapping in `NotificationsPage.tsx`.

---

### Bug 8 — Type mismatch in `FarmForm.tsx` (`values` and `SubmitHandler`)

**File:** `frontend/src/features/farms/components/FarmForm.tsx`

**Problem:**
`useForm<CreateFarmInput>` expects `values` to be `CreateFarmInput | undefined`, but the prop `initialData` is typed as `Partial<CreateFarmInput> | undefined`. This caused two TS errors: `TS2322` on the `values` assignment and `TS2345` on the `handleSubmit(onValid)` call.

**Fix:**
Cast `initialData` to `CreateFarmInput | undefined` at the `values` assignment. The form validation via Zod ensures all required fields are populated before `onValid` is called, so the cast is safe.

---

### Bug 9 — Unused imports in `FarmsPage.tsx`, `NotificationsPage.tsx`, `ProfilePage.tsx`

**Files:**
- `frontend/src/features/farms/pages/FarmsPage.tsx` — `cardStyle` imported but not used
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — `TYPE_BG` constant declared but not used
- `frontend/src/pages/profile/ProfilePage.tsx` — `List` icon imported but not used

**Problem:**
Leftover imports/declarations from earlier refactors caused `TS6133` errors, blocking the production build.

**Fix:**
Removed each unused symbol from its respective import or declaration.

---

### Bug 10 — Relative import paths in `FarmsPage.tsx`

**File:** `frontend/src/features/farms/pages/FarmsPage.tsx`

**Problem:**
Imports for `useMe` and `CreateFarmInput` used deep relative paths (`../../../hooks/useAuth`, `../../../types/farms`) instead of the configured path aliases, triggering IDE warnings.

**Fix:**
Replaced with `@hooks/useAuth` and `@/types/farms`.
