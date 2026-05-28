# TODO — Jafté (JCFS / cyberfika)
> Branch base: `develop` | Data: 2026-05-28

---

## Prioridade CRÍTICA (apresentação do professor)

### TAREFA 1 — Feature D frontend: Aposentadoria de Animal

O backend já está pronto (Renato entregou). Falta o frontend completo.

**1a — Adicionar `RETIRED` nos tipos**

Arquivo: `frontend/src/types/cows.ts`

Localizar `COW_STATUS_VALUES` e adicionar:
```ts
export const COW_STATUS_VALUES = {
  HEALTHY:    "HEALTHY",
  ALERT:      "ALERT",
  HEAT_STRESS:"HEAT_STRESS",
  CALVING:    "CALVING",
  RETIRED:    "RETIRED",   // ← ADICIONAR
} as const;
```

**1b — Serviço `retireCow`**

Arquivo: `frontend/src/services/cowsService.ts`

Adicionar função:
```ts
export const retireCow = (id: number, reason: "SALE" | "SLAUGHTER") =>
  api.post<Cow>(`/cows/${id}/retire`, { reason }).then((r) => r.data);
```

**1c — Hook `useRetireCow`**

Arquivo: `frontend/src/features/cows/hooks/useCows.ts`

```ts
export const useRetireCow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: "SALE" | "SLAUGHTER" }) =>
      cowsService.retireCow(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cows"] });
    },
  });
};
```

**1d — Criar `RetireAnimalModal`**

Arquivo a criar: `frontend/src/features/cows/components/RetireAnimalModal.tsx`

Modal com:
- Dropdown ou dois botões: **Venda** / **Abate**
- Mensagem de confirmação: "Esta ação é irreversível. O animal sairá do rebanho ativo."
- Botão cancelar + botão confirmar (vermelho)
- Ao confirmar: chama `useRetireCow()` → fecha modal → navega para `/cows`

**1e — Seção de aposentadoria em `CowDetailPage`**

Arquivo: `frontend/src/features/cows/pages/CowDetailPage.tsx`

Adicionar **no final da página**, visível apenas para quem tem permissão:
```tsx
import { useHasPermission } from "@hooks/usePermission";

const canRetire = useHasPermission("Retire Cow");

{canRetire && cow.status !== "RETIRED" && (
  <div className="card" style={{ borderColor: "var(--danger)", marginTop: "var(--s-4)" }}>
    <p style={{ fontWeight: 700, color: "var(--danger)" }}>Zona de perigo</p>
    <p style={{ fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
      Aposentar o animal remove-o do rebanho ativo permanentemente.
    </p>
    <button className="btn btn-danger btn-sm" onClick={() => setShowRetireModal(true)}>
      Aposentar animal
    </button>
  </div>
)}

<RetireAnimalModal
  open={showRetireModal}
  cowId={cow.id}
  onClose={() => setShowRetireModal(false)}
/>
```

**1f — Filtrar vacas RETIRED do mapa e do HomePage**

`frontend/src/pages/map/MapPage.tsx` — na query ou no filter de pins, adicionar:
```ts
.filter(cow => cow.status !== "RETIRED")
```

`frontend/src/pages/home/HomePage.tsx` — nos arrays que alimentam o strip de atenção, adicionar o mesmo filtro.

---

## Prioridade ALTA

### TAREFA 2 — Botão de alternância Light/Dark na UI

A infraestrutura já existe: `useTheme.ts` criado, anti-FOUC no `index.html`, CSS vars `[data-theme="light"]` em `landing.css`. Falta apenas o botão.

**Arquivo: `frontend/src/components/layout/Sidebar.tsx`**

```tsx
import { useTheme } from "@hooks/useTheme";
import { Sun, Moon } from "lucide-react";

// dentro do componente:
const { theme, toggle } = useTheme();

// no sidebar__footer, antes do botão de logout:
<button onClick={toggle} className="sidebar__logout" title="Alternar tema">
  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
</button>
```

**Arquivo: `frontend/src/components/layout/BottomNav.tsx`**

```tsx
import { useTheme } from "@hooks/useTheme";
import { Sun, Moon } from "lucide-react";

const { theme, toggle } = useTheme();

// adicionar item extra no nav (ou substituir um existente menos usado):
<button className="bottom-nav__item" onClick={toggle}>
  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
  <span>Tema</span>
</button>
```

---

### TAREFA 3 — Reaplicar correção do bottom nav (revertida)

O commit `cc06909` reverteu a correção do Ian. Replicar no `App.css`:

**Arquivo: `frontend/src/styles/App.css`** — localizar `.bottom-nav` (~linha 196):

```css
/* SUBSTITUIR */
.bottom-nav {
  /* ... */
  height: calc(64px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  /* ... resto das propriedades ... */
  -webkit-transform: translateZ(0);
}

.bottom-nav__item {
  /* ... */
  height: 64px;
  align-self: start;
}
```

---

### TAREFA 4 — Endpoints backend do Dashboard

Os componentes `CowProfilePanel`, `DashboardAlertFeed`, `DashboardActivityTimeline` e `DashboardCenterPanel` já existem no frontend mas consomem dados genéricos. Criar os endpoints especializados.

**4a — `GET /dashboard/featured-cow?farmId=X`**

Arquivo: `backend/src/services/dashboardService.ts`

Lógica: vaca com status `ALERT` ou `HEAT_STRESS` + temperatura mais alta recente na fazenda. Retornar todos os campos do modelo Cow + `ageYears` calculado.

**4b — `GET /dashboard/alerts/recent?farmId=X&limit=6`**

Retornar as últimas 6 notificações com: `id`, `title`, `cowTag`, `cowName`, `severity`, `alertType`, `createdAt`, `timeAgo` (formatado em pt-BR no backend).

**4c — `GET /dashboard/cow/:id/vitals`**

Retornar histórico 7 dias de temperatura e FC + `riskScore` calculado com 4 fatores.

**4d — `GET /dashboard/cow/:id/activity-timeline?date=YYYY-MM-DD`**

Enquanto a tabela `activity_events` não for populada pelo MQTT, retornar array vazio `[]` (não quebra o componente que já trata estado vazio).

**Arquivo: `backend/src/routes/dashboardRoutes.ts`** — registrar as 4 rotas com `requireAuth`.

---

### TAREFA 5 — Feature A: Acelerômetro diário + grade de gráficos

**5a — Backend**

Arquivo: `backend/src/services/cowsService.ts` — adicionar:
```ts
export const getCowAccelerometerDaily = async (cowId: number) => {
  // agrupar AccelerometerData por dia, calcular magnitude média
  // retornar SensorDailyPoint[] = { date: string, average: number }[]
};
```

Arquivo: `backend/src/controllers/cowsController.ts` — handler `listAccelerometerDaily`.

Arquivo: `backend/src/routes/cowsRoutes.ts` — `GET /:id/accelerometer/daily`.

**5b — Frontend**

Arquivo: `frontend/src/services/cowsService.ts` — adicionar `getAccelerometerDaily(id)`.

Arquivo: `frontend/src/features/cows/hooks/useCows.ts` — adicionar `useCowAccelerometerDaily(id)`.

Arquivo: `frontend/src/features/cows/pages/CowDetailPage.tsx` — substituir as tabs de sensor por grade 3 colunas (desktop) / 1 coluna (mobile):
- Temperatura (já existe)
- Frequência cardíaca (já existe)
- Atividade (acelerômetro diário — novo)

---

## Prioridade MÉDIA

### TAREFA 6 — Feature G frontend: Histórico de Sensores

O backend já existe (`GET /cows/:id/sensor-history?from=&to=`). Falta o frontend.

**Arquivo a criar:** `frontend/src/features/cows/pages/CowHistoryPage.tsx`

- Tabela com `.data-table` (classe já existe no `App.css`)
- Colunas: Data/hora, Temperatura, FC, Atividade, Status
- Filtro de intervalo de datas com `<input type="date">` + botão Aplicar
- Botão "Exportar CSV" (client-side, via `Blob` + `URL.createObjectURL`)
- Estado vazio quando não há leituras no intervalo

**Arquivo: `frontend/src/routes/AppRoutes.tsx`** — adicionar rota protegida `/cows/:id/history`.

**Arquivo: `frontend/src/features/cows/pages/CowDetailPage.tsx`** — adicionar botão "Histórico" que navega para `/cows/${cow.id}/history`.

---

### TAREFA 7 — Feature E: Splash Screen

**Arquivo a criar:** `frontend/src/pages/splash/SplashPage.tsx`

- Logo CowHealth AI centralizado
- Texto "Sincronizando coleiras…" com animação de fade
- Duração mínima de 1,2 s
- Não é uma rota real — renderizado condicionalmente

**Arquivo: `frontend/src/routes/AppRoutes.tsx`**

```tsx
// antes de qualquer <Route>:
if (isLoadingAuth) return <SplashPage />;
```

Comportamento:
- JWT válido → navega para `/dashboard`
- JWT inválido/ausente → navega para `/login`
- Elimina o flash de tela de login em sessões ativas

---

### TAREFA 8 — P2: Seção Pré-parto em HomePage

**Arquivo: `frontend/src/pages/home/HomePage.tsx`**

Adicionar após o strip de alertas críticos:

```tsx
const prepartumCows = cows?.filter(c => c.status === COW_STATUS_VALUES.CALVING) ?? [];

{prepartumCows.length > 0 && (
  <section className="home-section">
    <div className="home-section__header">
      <span>Pré-parto ({prepartumCows.length})</span>
    </div>
    <div style={{ display: "flex", gap: "var(--s-3)", overflowX: "auto" }}>
      {prepartumCows.map(cow => (
        <button key={cow.id} className="card" onClick={() => navigate(`/cows/${cow.id}`)}>
          <CowHead size={24} color="var(--info)" />
          <span>{cow.name ?? cow.tag}</span>
        </button>
      ))}
    </div>
  </section>
)}
```

---

## Verificação final

```bash
cd frontend
npm run lint      # zero warnings em arquivos modificados
npm run build     # zero erros TypeScript

cd ../backend
npm run build     # zero erros TypeScript
```

Testes manuais:
1. Login como `admin@cowhealth.com` (SuperAdmin) → botão "Aposentar animal" visível em CowDetailPage
2. Login como `obs@cowhealth.com` (Observador) → botão não aparece
3. Confirmar aposentadoria → vaca some do mapa e da lista
4. Botão Sun/Moon na Sidebar → tema alterna; recarregar → persiste
5. `/cows/:id/history` carrega tabela com dados de sensor
