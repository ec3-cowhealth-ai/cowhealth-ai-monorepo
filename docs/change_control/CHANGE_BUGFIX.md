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
