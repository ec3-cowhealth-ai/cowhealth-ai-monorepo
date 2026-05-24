# Handoff para Angelo, Ian e Renato — 2026-05-24

Este documento descreve o estado atual do projeto, o que já foi feito, e o que cada um precisa entregar agora.

---

## Estado geral

O projeto está funcional com banco, backend e frontend integrados.
Build passa com **zero erros de TypeScript** em frontend e backend.

### O que já existe e funciona

| Tela / Funcionalidade                             | Status |
| ------------------------------------------------- | ------ |
| Landing Page                                      | Pronta |
| Login + Register (formulário + validação Zod)     | Pronto |
| Dashboard com KPIs e gráficos (Recharts)          | Pronto |
| Lista e detalhe de Vacas (com sensores)           | Pronto |
| Lista e detalhe de Colares                        | Pronto |
| Lista e detalhe de Fazendas                       | Pronto |
| Notificações (marcar lida, marcar todas)          | Pronto |
| Gestão de Acesso: Usuários, Papéis, Permissões    | Pronto |
| Mapa com layout de fazenda e pins de vaca         | Pronto |
| Perfil do usuário                                 | Pronto |
| Ingestão MQTT + análise heurística de saúde       | Pronto |
| Contexto de fazenda selecionada (FarmContext)     | Pronto |
| Seed com 160 vacas, 5 fazendas, dados de sensores | Pronto |

---

## Angelo — O que falta para você

### 0. Proteger ações da UI por role (PRINCIPAL — é isso que o professor quer)

O professor quer "telas para todos os roles implementadas". Hoje qualquer usuário logado vê todos os botões de criar/editar/deletar. Um VIEWER não deveria ver essas ações.

As telas existem. O hook `useHasPermission` já existe em `frontend/src/hooks/usePermission.ts`.
Falta aplicá-lo para condicionar os botões em cada página.

**Padrão a seguir em cada página:**

```tsx
import { useHasPermission } from "@hooks/usePermission";

// dentro do componente:
const canCreate = useHasPermission("Create Farm");
const canEdit = useHasPermission("Update Farm");
const canDelete = useHasPermission("Delete Farm");

// no JSX — esconder o botão se não tiver permissão:
{
  canCreate && (
    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
      Nova Fazenda
    </button>
  );
}
```

**Mapa de páginas e permissões:**

| Página                 | Botão/Ação      | Permissão necessária |
| ---------------------- | --------------- | -------------------- |
| `FarmsPage.tsx`        | "Nova Fazenda"  | `"Create Farm"`      |
| `FarmDetailPage.tsx`   | Editar fazenda  | `"Update Farm"`      |
| `FarmDetailPage.tsx`   | Excluir fazenda | `"Delete Farm"`      |
| `CowsPage.tsx`         | "Nova Vaca"     | `"Create Cow"`       |
| `CowDetailPage.tsx`    | Editar vaca     | `"Update Cow"`       |
| `CowDetailPage.tsx`    | Excluir vaca    | `"Delete Cow"`       |
| `CollarsPage.tsx`      | "Novo Colar"    | `"Create Collar"`    |
| `CollarDetailPage.tsx` | Editar colar    | `"Update Collar"`    |
| `CollarDetailPage.tsx` | Excluir colar   | `"Delete Collar"`    |

**Como verificar que está funcionando:**

1. Logar como `admin@admin.com` — deve ver todos os botões
2. Logar como `ana@farm.com` (Viewer) — botões de criar/editar/deletar devem sumir
3. Logar como `pedro@farm.com` (Manager) — deve ver botões operacionais mas não /access

Após cada página, rodar `npm run build` para garantir zero erros de TypeScript.

---

### 1. Ajustar acesso Farm → Cows por role (investigar + propor mudança)

**Contexto — o que o banco tem hoje:**

| Role            | Usuários                                   | Permissões relevantes                                         |
| --------------- | ------------------------------------------ | ------------------------------------------------------------- |
| `SuperAdmin`    | admin@admin.com                            | Todas                                                         |
| `Administrador` | pedro@farm.com (MANAGER)                   | Tudo exceto gerenciar Permissões                              |
| `Veterinario`   | joao@vet.com, maria@farm.com, ana@farm.com | Ver qualquer coisa + tudo sobre Cow + tudo sobre Notification |

**O problema:** o filtro de permissões do `vetRole` no seed (`seed.ts` linha ~238) inclui tudo que contém `"Cow"` — isso dá `Create Cow`, `Update Cow` e `Delete Cow` para `maria@farm.com` e `ana@farm.com`, que têm `profile: VIEWER`. Um Observador consegue criar e deletar vacas.

**O que investigar:**
Abrir `backend/prisma/seed.ts` e localizar o bloco `vetRole`. O filtro atual é:

```ts
p.name.includes("ViewAny") ||
  p.name.includes("View") ||
  p.name.includes("Cow") || // ← dá Create/Update/Delete Cow para viewers
  p.name.includes("Notification"); // ← dá Create/Update/Delete Notification para viewers
```

**O que corrigir no seed:**

Separar o `vetRole` em dois roles mais precisos:

```ts
// Role para quem cuida da saúde animal (Veterinário — MANAGER)
// pode ver tudo + criar/editar/deletar vacas
const vetRole = await prisma.role.create({
  data: {
    name: "Veterinario",
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

// Role para quem só observa (Observador — VIEWER)
// só leitura: sem Create/Update/Delete em nenhuma entidade
const observerRole = await prisma.role.create({
  data: {
    name: "Observador",
    permissions: {
      create: createdPermissions
        .filter(
          (p) => p.name.startsWith("ViewAny") || p.name.startsWith("View "),
        )
        .map((p) => ({ permissionId: p.id })),
    },
  },
});

// Atribuir corretamente:
// { email: "maria@farm.com", role: observerRole }
// { email: "ana@farm.com",   role: observerRole }
// { email: "joao@vet.com",   role: vetRole }
```

**Proposta de mudança a documentar e discutir com o grupo:**

Hoje o acesso a Farm → Cows é global — qualquer usuário autenticado vê todas as fazendas e todas as vacas. Isso não reflete a realidade de um produtor que só gerencia sua própria fazenda.

Proposta: adicionar tabela `UserFarm` (relação N:N entre User e Farm) e filtrar os endpoints `/farms` e `/cows` para retornar apenas os dados da fazenda do usuário logado, exceto para SuperAdmin que vê tudo.

```
User ──< UserFarm >── Farm ──< Cow
```

Isso é uma mudança de schema (Prisma migration) — discutir com o grupo antes de implementar para não quebrar o seed nem os outros endpoints.

---

### 3. Corrigir `Farm.id`: `string` → `number`

**Arquivo:** `frontend/src/types/farms.ts`

O backend retorna `id` como inteiro, mas o tipo está declarado como `string`.
Isso causa casts `Number(id)` / `String(id)` espalhados no código.

```ts
// ATUAL (errado)
export interface Farm {
  id: string;
  ...
}

// CORRETO
export interface Farm {
  id: number;
  ...
}
```

Após mudar, rodar `npm run build` e corrigir todos os erros de tipo que aparecerem.
Procurar por `Number(.*id)` e `String(.*id)` no frontend para limpar os casts desnecessários.

---

### 4. Criar enum de nomes de permissão

**Arquivo a criar:** `frontend/src/config/permissions.ts`

Hoje `useHasPermission("View Cow")` aceita qualquer string — um typo silencia o guard sem erro.

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

Depois mudar `useHasPermission` em `frontend/src/hooks/usePermission.ts`:

```ts
// de:
export const useHasPermission = (permissionName: string): boolean => {
// para:
export const useHasPermission = (permissionName: PermissionName): boolean => {
```

Confirmar os nomes exatos consultando o banco ou `backend/prisma/seed.ts`.

---

## Ian — O que falta para você

### 1. Bottom nav mobile — suporte iOS e Android correto

**Arquivos:** `frontend/src/styles/App.css` + `frontend/src/components/layout/BottomNav.tsx`

O CSS atual tem `padding-bottom: env(safe-area-inset-bottom, 0)` mas a altura fica fixa em `64px`, o que causa dois problemas:

- **iOS** (notch/Dynamic Island): o padding empurra o conteúdo interno mas a barra não cresce — os ícones ficam espremidos atrás do home indicator
- **Android** (gesture navigation): a barra não cede espaço para a gesture bar, ficando cortada em dispositivos sem botões físicos

**Correção no CSS** — substituir o bloco `.bottom-nav`:

```css
.bottom-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: var(--bg-elev-1);
  border-top: 1px solid var(--border);
  /* altura real = 64px de conteúdo + safe area embaixo */
  padding-bottom: env(safe-area-inset-bottom, 0px);
  height: calc(64px + env(safe-area-inset-bottom, 0px));
  position: sticky;
  bottom: 0;
  z-index: 20;
  /* evita scroll bounce sobrepor a barra no iOS */
  -webkit-transform: translateZ(0);
}
```

**Correção nos itens** — os botões devem ocupar apenas os 64px de conteúdo, não o padding de safe area:

```css
.bottom-nav__item {
  height: 64px; /* fixar altura do item, não herdar do grid */
  align-self: start; /* ancora no topo do grid, não estica */
  /* restante permanece igual */
}
```

**Teste obrigatório:**

- iOS Safari: abrir no iPhone (ou DevTools › iPhone 14 Pro) — indicador home não deve sobrepor ícones
- Android Chrome: modo gestos — barra deve dar espaço para a gesture area
- Ambos com rotação de tela — barra deve se adaptar (em landscape, safe-area-inset muda de lado)

---

### 2. Cards de Rebanho — mudar de lista para tile (grade 2 colunas)

**Arquivo:** `frontend/src/features/cows/pages/CowsPage.tsx`

Hoje usa `cow-row` (layout horizontal em lista). Mudar para grade de 2 tiles por linha — mais visual, mais informação visível de uma vez, padrão esperado para listagens de rebanho em apps agropecuários.

**Substituir o bloco de lista** (linha ~118 em diante):

```tsx
// ANTES — lista vertical
<div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
  {filtered.map((cow: Cow) => (
    <button key={cow.id} className="cow-row" onClick={...}>
      ...
    </button>
  ))}
</div>

// DEPOIS — grade de tiles
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

Verificar se a classe `.card` existe em `App.css` antes de usar — se não existir, usar `className="kpi-card"` ou criar o estilo inline.

---

### 3. Corrigir `unreadNotifications` no dashboard (bug de segurança)

**Arquivo:** `backend/src/services/dashboardService.ts`
**Arquivo:** `backend/src/controllers/dashboardController.ts`

O contador atual mostra notificações não-lidas de **todos os usuários** — qualquer Viewer vê o total global.

**Passo 1:** Ler o `userId` do token JWT no controller:

```ts
// backend/src/controllers/dashboardController.ts
export const overview = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const farmId = request.query.farmId
    ? Number(request.query.farmId)
    : undefined;
  const userId = request.user!.sub; // já disponível via requireAuth
  await handleRequest(response, () => getDashboardOverview(farmId, userId));
};
```

**Passo 2:** Receber e usar `userId` no service:

```ts
// backend/src/services/dashboardService.ts
export const getDashboardOverview = async (farmId?: number, userId?: number) => {
    ...
    prisma.notification.count({ where: { readAt: null, userId } }),  // filtrar pelo usuário
    ...
};
```

---

### 4. Implementar `DashboardOverviewChart` (LineChart de série temporal)

Este gráfico foi removido porque não existe endpoint de série temporal ainda.

**Backend:** criar `GET /dashboard/health-timeline` que retorna contagem de vacas por status por dia nos últimos 7 dias:

```ts
// Resposta esperada:
[
  { date: "2026-05-18", healthy: 140, alert: 12, heatStress: 5, calving: 3 },
  { date: "2026-05-19", healthy: 138, alert: 14, ... },
  ...
]
```

**Frontend:** reativar `DashboardOverviewChart.tsx` com `LineChart` do Recharts consumindo este endpoint.

---

## Renato — O que falta para você

Os itens estão marcados com `TODO[RENATO]` no código. Os arquivos são:

### 1. CORS restrito — `backend/src/server.ts`

```ts
// ATUAL
app.use(cors());

// CORRETO
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") }));
// Adicionar no .env: ALLOWED_ORIGINS=http://localhost:5173
```

### 2. Uploads autenticados — `backend/src/server.ts`

Remover a linha:

```ts
app.use("/uploads", express.static(...));
```

Criar endpoint autenticado:

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

Adicionar **antes** do `app.listen`:

```ts
import { Request, Response, NextFunction } from "express";

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
```

### 4. Validação de input nos controllers

Todos os `request.body` chegam sem validação. Instalar Zod se não estiver, criar schemas e aplicar como middleware.

Exemplo para fazendas — criar `backend/src/routes/schemas/farmSchemas.ts`:

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

Aplicar na rota:

```ts
router.post(
  "/",
  requireAuth,
  requirePermission("Create Farm"),
  validateSchema(createFarmSchema),
  storeFarm,
);
```

Onde `validateSchema` é um middleware factory:

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

Aplicar em **todos** os controllers que recebem POST/PUT: farms, cows, collars, users, roles, permissions, auth.

### 5. `requirePermission` sem DB query por request — `backend/src/middlewares/requirePermission.ts`

Embutir `permissions[]` no payload JWT no login:

```ts
// backend/src/services/authService.ts — na função login()
const permissions = await prisma.permission.findMany({
  where: { roles: { some: { users: { some: { userId: user.id } } } } },
  select: { name: true },
});
const token = jwt.sign(
  { sub: user.id, permissions: permissions.map((p) => p.name) },
  SECRET,
);
```

No middleware, ler de `request.user` sem query adicional:

```ts
const allowed = request.user?.permissions?.includes(permissionName) ?? false;
```

---

## Como rodar o projeto

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

Credenciais de teste: `admin@admin.com` / `password123`

---

## Branches

- Criar branch `feature/<nome>-<descricao>` a partir de `main`
- Abrir PR para `develop`
- Rodar `npm run build` antes de abrir PR (deve passar com zero erros)
- Atualizar `docs/change_control/CHANGELOG.md` na sua seção
