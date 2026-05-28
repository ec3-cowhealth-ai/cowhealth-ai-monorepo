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
