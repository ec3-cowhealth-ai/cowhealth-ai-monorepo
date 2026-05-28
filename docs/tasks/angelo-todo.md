# TODO — Angelo (PJorgeto)
> Branch base: `develop` | Data: 2026-05-28
> Criar branch: `feature/angelo-rbac-v2` a partir de `develop`

---

## Contexto importante antes de começar

O hook `useHasPermission` já existe em `frontend/src/hooks/usePermission.ts`.
Ele lê permissões diretamente do token JWT (Renato já embutiu `permissions[]` no login).
**Não use `isSuperAdmin`.** Use sempre o hook abaixo:

```tsx
import { useHasPermission } from "@hooks/usePermission";

const canCreate = useHasPermission("Create Cow");
// retorna true/false com base nas permissões reais do usuário logado
```

Os nomes exatos das permissões estão em `backend/prisma/seed.ts` (~linha 330).

---

## Prioridade CRÍTICA (apresentação do professor)

### TAREFA 1 — Criar `frontend/src/config/permissions.ts`

Este arquivo centraliza os nomes de permissão como constantes tipadas,
evitando typos silenciosos.

**Arquivo a criar:** `frontend/src/config/permissions.ts`

```ts
export const PERMISSIONS = {
  // Farms
  VIEW_ANY_FARM:    "ViewAny Farm",
  VIEW_FARM:        "View Farm",
  CREATE_FARM:      "Create Farm",
  UPDATE_FARM:      "Update Farm",
  DELETE_FARM:      "Delete Farm",

  // Cows
  VIEW_ANY_COW:     "ViewAny Cow",
  VIEW_COW:         "View Cow",
  CREATE_COW:       "Create Cow",
  UPDATE_COW:       "Update Cow",
  DELETE_COW:       "Delete Cow",
  RETIRE_COW:       "Retire Cow",

  // Collars
  VIEW_ANY_COLLAR:  "ViewAny Collar",
  VIEW_COLLAR:      "View Collar",
  CREATE_COLLAR:    "Create Collar",
  UPDATE_COLLAR:    "Update Collar",
  DELETE_COLLAR:    "Delete Collar",

  // Medical Records
  VIEW_ANY_MEDICAL_RECORD:  "ViewAny MedicalRecord",
  VIEW_MEDICAL_RECORD:      "View MedicalRecord",
  CREATE_MEDICAL_RECORD:    "Create MedicalRecord",
  UPDATE_MEDICAL_RECORD:    "Update MedicalRecord",
  DELETE_MEDICAL_RECORD:    "Delete MedicalRecord",

  // Users
  VIEW_ANY_USER:    "ViewAny User",
  CREATE_USER:      "Create User",
  UPDATE_USER:      "Update User",
  DELETE_USER:      "Delete User",

  // Roles
  VIEW_ANY_ROLE:    "ViewAny Role",
  CREATE_ROLE:      "Create Role",
  UPDATE_ROLE:      "Update Role",
  DELETE_ROLE:      "Delete Role",

  // Permissions
  VIEW_ANY_PERMISSION:  "ViewAny Permission",
  CREATE_PERMISSION:    "Create Permission",
  UPDATE_PERMISSION:    "Update Permission",
  DELETE_PERMISSION:    "Delete Permission",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
```

> Confirme os nomes exatos consultando `backend/prisma/seed.ts` antes de salvar.

---

### TAREFA 2 — Atualizar `useHasPermission` para aceitar `PermissionName`

**Arquivo: `frontend/src/hooks/usePermission.ts`**

```ts
import type { PermissionName } from "@config/permissions";
import { useMe } from "./useAuth";

export const useHasPermission = (permissionName: PermissionName): boolean => {
  const { data: user } = useMe();
  return user?.permissions?.some((p) => p.name === permissionName) ?? false;
};
```

Após esta mudança, qualquer string inválida passada para `useHasPermission` gerará
**erro de TypeScript em tempo de compilação** — objetivo do enum.

---

### TAREFA 3 — Corrigir guards em FarmsPage e FarmDetailPage

Hoje as páginas usam `isSuperAdmin`. Isso impede que Administradores e Gerentes
de Fazenda vejam os botões que deveriam ter acesso.

**Arquivo: `frontend/src/features/farms/pages/FarmsPage.tsx`**

```tsx
// REMOVER:
const { data: me } = useMe();
const isSuperAdmin = me?.roles.some((r) => r.name === "SuperAdmin");

// ADICIONAR:
const canCreate = useHasPermission(PERMISSIONS.CREATE_FARM);

// SUBSTITUIR no JSX:
{canCreate && (
  <button className="app-bar__action" onClick={() => setShowForm(true)}>
    <Plus size={20} />
  </button>
)}
```

**Arquivo: `frontend/src/features/farms/pages/FarmDetailPage.tsx`**

```tsx
// REMOVER isSuperAdmin / isFarmAdmin — SUBSTITUIR por:
const canEdit   = useHasPermission(PERMISSIONS.UPDATE_FARM);
const canDelete = useHasPermission(PERMISSIONS.DELETE_FARM);

{canEdit   && <button onClick={() => setEditing(true)}>Editar</button>}
{canDelete && <button onClick={() => setShowDelete(true)}>Excluir</button>}
```

---

### TAREFA 4 — Corrigir guards em CollarsPage e CollarDetailPage

**Arquivo: `frontend/src/features/collars/pages/CollarsPage.tsx`** (~linha 123)

```tsx
// REMOVER: const isSuperAdmin = user?.roles.some(...)
// ADICIONAR:
const canCreate = useHasPermission(PERMISSIONS.CREATE_COLLAR);

{canCreate && (
  <button onClick={() => setShowForm(true)}>+ Novo Colar</button>
)}
```

**Arquivo: `frontend/src/features/collars/pages/CollarDetailPage.tsx`** (~linha 125)

```tsx
// REMOVER: const isSuperAdmin = user?.roles.some(...)
// ADICIONAR:
const canEdit   = useHasPermission(PERMISSIONS.UPDATE_COLLAR);
const canDelete = useHasPermission(PERMISSIONS.DELETE_COLLAR);

{canEdit   && <button onClick={...}>Editar</button>}
{canDelete && <button onClick={...}>Excluir</button>}
```

---

### TAREFA 5 — Adicionar guards em CowsPage (AUSENTE)

**Arquivo: `frontend/src/features/cows/pages/CowsPage.tsx`**

```tsx
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";

// dentro do componente:
const canCreate = useHasPermission(PERMISSIONS.CREATE_COW);

// no JSX do cabeçalho, ao lado da busca:
{canCreate && (
  <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
    + Nova vaca
  </button>
)}
```

---

### TAREFA 6 — Adicionar guards em CowDetailPage (AUSENTE)

**Arquivo: `frontend/src/features/cows/pages/CowDetailPage.tsx`**

```tsx
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";

// dentro do componente:
const canEdit   = useHasPermission(PERMISSIONS.UPDATE_COW);
const canDelete = useHasPermission(PERMISSIONS.DELETE_COW);

// no JSX — botões de ação:
{canEdit && (
  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
    Editar
  </button>
)}
{canDelete && (
  <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>
    Excluir
  </button>
)}
```

---

## Verificação dos guards (tabela de roles)

Após implementar, testar com cada perfil abaixo:

> Fonte: `backend/prisma/seed.ts` — grupos `cowPermissions` (all) vs `viewOnlyCow` (ViewAny+View).

| Credencial | Role | Nova Vaca (Create) | Editar Vaca (Update) | Excluir Vaca (Delete) |
|---|---|---|---|---|
| `admin@cowhealth.com` | SuperAdmin | ✅ | ✅ | ✅ |
| `administrador@aurora.com` | Administrador | ✅ | ✅ | ✅ |
| `vet@cowhealth.com` | Veterinario | ✅ | ✅ | ✅ |
| `zoot@cowhealth.com` | Zootecnista | ✅ | ✅ | ✅ |
| `gerente@cowhealth.com` | Gerente de Fazenda | ❌ | ❌ | ❌ |
| `operador@cowhealth.com` | Operador de Campo | ❌ | ❌ | ❌ |
| `financeiro@cowhealth.com` | Financeiro | ❌ | ❌ | ❌ |
| `obs@cowhealth.com` | Observador | ❌ | ❌ | ❌ |
| (sem usuário seed) | Produtor | ❌ | ❌ | ❌ |

**Atenção:** Veterinário e Zootecnista recebem `cowPermissions` completo (inclui Delete Cow).
Gerente de Fazenda recebe apenas `viewOnlyCow` + `Retire Cow` — sem botões de criar/editar/excluir.

---

## Prioridade MÉDIA

### TAREFA 7 — Tratar status `RETIRED` no CowStatusBadge

O backend já retorna `RETIRED` como status possível (Renato implementou).
Se um Observador carregar a lista de vacas e existir uma aposentada, o badge quebrará.

**Arquivo:** localizar o componente que renderiza badges/pills de status
(provavelmente `CowsPage.tsx` ou um componente separado).

Adicionar o caso:
```tsx
case "RETIRED":
  return <span className="status-badge--muted">Aposentada</span>;
```

---

### TAREFA 8 — Feature H: Settings Page

**Arquivo a criar:** `frontend/src/pages/settings/SettingsPage.tsx`

Duas seções (localStorage apenas — sem backend):

**Seção 1: Notificações**
- Toggle: Alertas críticos (padrão: ligado)
- Toggle: Avisos (padrão: ligado)
- Toggle: Resumo diário (padrão: desligado)

**Seção 2: Conta**
- Link para editar perfil → `/profile`
- Texto estático: Privacidade (LGPD)

**Arquivo: `frontend/src/routes/AppRoutes.tsx`** — adicionar rota protegida:
```tsx
<Route path="/settings" element={<SettingsPage />} />
```

**Arquivo: `frontend/src/pages/profile/ProfilePage.tsx`** — conectar o ícone de
configurações (já existe na UI mas não está wired) para navegar para `/settings`.

---

## Verificação final

```bash
cd frontend
npm run lint
npm run build   # deve terminar com zero erros TypeScript
```

Sequência de testes manuais:
1. Login como `admin@cowhealth.com` → todos os botões de criar/editar/excluir visíveis
2. Login como `administrador@aurora.com` → todos os botões de criar/editar/excluir visíveis
3. Login como `vet@cowhealth.com` → pode criar/editar/excluir vacas (cowPermissions completo)
4. Login como `zoot@cowhealth.com` → pode criar/editar/excluir vacas (cowPermissions completo)
5. Login como `gerente@cowhealth.com` → nenhum botão de ação de vaca visível (apenas viewOnlyCow)
6. Login como `operador@cowhealth.com` → nenhum botão de ação visível
7. Login como `financeiro@cowhealth.com` → nenhum botão de ação visível
8. Login como `obs@cowhealth.com` → nenhum botão de ação visível em nenhuma página
4. Verificar que `npm run build` compila sem erros (o enum `PermissionName`
   pegará qualquer string inválida passada para `useHasPermission`)

## Abrir PR

```bash
git add -A
git commit -m "feat(frontend): RBAC guards with useHasPermission on all pages + PERMISSIONS enum"
git push origin feature/angelo-rbac-v2
# Abrir PR → base: develop
```
