# Bug Fix Change Log

---

## 2026-05-28 — Style Overhaul: CSS Theme System & Responsive Icons

**Branch:** `feature/cow-lifecycle-sensors`
**Commit:** `d050a73`
**Author:** JCFS

---

### Alteração 1 — Novo arquivo `theme.css` com tokens de design

**File:** `frontend/src/styles/theme.css`

**Descrição:**
Criado arquivo dedicado de tokens CSS com variáveis para modo escuro e claro (cores, backgrounds, borders, shadows, tipografia). Centraliza a identidade visual do sistema, evitando valores hardcoded espalhados pelos componentes.

---

### Alteração 2 — Refatoração de `DashboardIcons.tsx` para SVGs responsivos

**File:** `frontend/src/features/dashboard/components/DashboardIcons.tsx`

**Descrição:**
Reestruturado com formato SVG responsivo (`viewBox` + `width`/`height` via props), melhorando legibilidade e escalabilidade dos ícones em diferentes tamanhos de tela.

---

### Alteração 3 — `CowDetailPage.tsx` e `CowsPage.tsx` usando variáveis CSS

**Files:**
- `frontend/src/features/cows/pages/CowDetailPage.tsx`
- `frontend/src/features/cows/pages/CowsPage.tsx`

**Descrição:**
Substituídos valores de cor hardcoded por variáveis CSS do design system (`var(--bg-status-*)`, `var(--text-*)` etc.) nas badges de status e backgrounds de cards, garantindo consistência com o tema e suporte automático a futuras mudanças de paleta.

---

### Alteração 4 — Ajustes de layout e estilo em múltiplos componentes

**Files afetados (23 no total):**
`AppShell.tsx`, `CollarCard.tsx`, `CollarsPage.tsx`, `CowProfilePanel.tsx`, `CowSelectorBar.tsx`, `DashboardActivityTimeline.tsx`, `DashboardAlertFeed.tsx`, `DashboardCenterPanel.tsx`, `DashboardKPIs.tsx`, `colors.ts`, `FarmCard.tsx`, `NotificationsPage.tsx`, `useTheme.ts`, `HomePage.tsx`, `CowPin.tsx`, `ProfilePage.tsx`, `App.css`, `index.css`

**Descrição:**
Aplicação consistente das variáveis do novo `theme.css` em toda a camada autenticada: cores de background, bordas, textos e estados visuais (hover, active, disabled) alinhados ao token system. Total de **+1847 / -727 linhas** alteradas.

---

## 2026-05-28 — Fix Lint + TypeScript Build Errors (codebase-wide)

**Branch:** `develop`
**Author:** JCFS

---

### Bug 1 — `cardStyle` e `NOTIF_TONE` ausentes em `CowDetailPage.tsx`

**File:** `frontend/src/features/cows/pages/CowDetailPage.tsx`

**Problem:**
O componente usava `cardStyle` (espalhado em 5 divs de gráficos) e `NOTIF_TONE` (mapa de cor por tipo de notificação) sem importar nem definir essas referências, causando 6 erros `TS2304: Cannot find name`.

**Fix:**
Adicionado `cardStyle` ao import de `@features/dashboard/constants/colors`. Definida constante local `NOTIF_TONE` (mesmo esquema de `TYPE_COLOR` de `NotificationsPage`) com as cores `ALERT`, `WARNING` e `INFO`.

---

### Bug 2 — `values: initialData` incompatível em `FarmForm.tsx`

**File:** `frontend/src/features/farms/components/FarmForm.tsx`

**Problem:**
`useForm<CreateFarmInput>` recebia `values: initialData` onde `initialData` é `Partial<CreateFarmInput> | undefined`. A prop `values` do react-hook-form exige o tipo completo `T`, não `Partial<T>`, causando 2 erros `TS2322`/`TS2345`.

**Fix:**
Trocado `values:` por `defaultValues:`, que aceita `Partial<T>`.

---

### Bug 3 — `cardStyle` importado mas não usado em `FarmsPage.tsx`

**File:** `frontend/src/features/farms/pages/FarmsPage.tsx`

**Problem:**
Import `{ C, cardStyle }` — `cardStyle` não era utilizado na página, gerando `TS6133` e `@typescript-eslint/no-unused-vars`.

**Fix:**
Removido `cardStyle` do import, mantendo apenas `{ C }`.

---

### Bug 4 — `List` importado mas não usado em `ProfilePage.tsx`

**File:** `frontend/src/pages/profile/ProfilePage.tsx`

**Problem:**
Import `{ List, Warehouse, Tag, ... }` — `List` não aparecia em nenhum JSX da página, gerando `TS6133` e `@typescript-eslint/no-unused-vars`.

**Fix:**
Removido `List,` do import lucide.

---

### Bug 5 — `prisma` importado mas não usado em 3 controllers

**Files:**
- `backend/src/controllers/collarsController.ts`
- `backend/src/controllers/farmsController.ts`
- `backend/src/controllers/usersController.ts`

**Problem:**
Cada controller importava `prisma` diretamente, mas toda comunicação com o banco foi delegada para os respectivos services. O import residual gerava `@typescript-eslint/no-unused-vars`.

**Fix:**
Removida a linha `import { prisma } from "../lib/prisma";` de cada controller.

---

### Bug 6 — `path` importado mas não usado em `server.ts`

**File:** `backend/src/server.ts`

**Problem:**
`import path from "path"` estava presente mas `path` não era referenciado em nenhum lugar do arquivo, gerando `@typescript-eslint/no-unused-vars`.

**Fix:**
Removida a linha de import.

---

### Bug 7 — `any` em `controllerHelpers.ts`

**File:** `backend/src/helpers/controllerHelpers.ts`

**Problem:**
Dois usos de `any`: `serviceCall: () => Promise<any>` e `catch (error: any)`, gerando 2x `@typescript-eslint/no-explicit-any`.

**Fix:**
- `Promise<any>` → `Promise<unknown>` (o retorno do service não precisa ser tipado no helper).
- `catch (error: any)` → `catch (error: unknown)` com narrowing via `error as { statusCode?: number; message?: string }`.

---

### Bug 8 — `any` em `serviceHelpers.ts`

**File:** `backend/src/helpers/serviceHelpers.ts`

**Problem:**
`(error as any).statusCode = statusCode` para embutir o status HTTP no objeto de erro, gerando `@typescript-eslint/no-explicit-any`.

**Fix:**
Declarada interface local `interface HttpError extends Error { statusCode: number; }`. Cast alterado para `(error as HttpError).statusCode`.

---

**Resultado:** `npm run lint` e `npm run build` (frontend) + `npx tsc --noEmit` (backend) com **0 erros**.

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
