# TODO — Ian (DevIanBraz)
> Branch base: `develop` | Data: 2026-05-28
> Criar branch: `feature/ian-medical-mobile-v2` a partir de `develop`
> **STATUS: ✅ CONCLUÍDO em 2026-05-28 — branch `feature/ian-medical-mobile-v2` — todas as tarefas implementadas**

---

## Contexto: o que já está pronto

- ✅ Backend de prontuário médico entregue por Renato:
  - `GET /cows/:id/medical-records`
  - `POST /cows/:id/medical-records`
  - `PUT /cows/:id/medical-records/:recordId`
  - `DELETE /cows/:id/medical-records/:recordId`
- ✅ Schema: `MedicalRecord` com campos `type`, `title`, `notes`, `recordedAt`, `veterinarianId`
- ✅ Permissões no banco: `Create MedicalRecord`, `View MedicalRecord`, etc.
- ✅ Rota `GET /dashboard/health-timeline` existe no backend

---

## Prioridade CRÍTICA (apresentação do professor)

### ✅ TAREFA 1 — Feature C frontend: Prontuário Médico

Esta é a tarefa de maior impacto para amanhã. O backend está 100% pronto.

**✅ 1a — Tipos TypeScript**

Arquivo: `frontend/src/types/cows.ts` — adicionar:

```ts
export type MedicalRecordType = "CHECKUP" | "PROCEDURE" | "MEDICATION";

export interface MedicalRecord {
  id: number;
  cowId: number;
  userId: number;
  type: MedicalRecordType;
  title: string;
  notes: string | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: number; name: string };
}

export interface CreateMedicalRecordInput {
  type: MedicalRecordType;
  title: string;
  notes?: string;
  recordedAt: string;
}
```

**✅ 1b — Serviço**

Arquivo: `frontend/src/services/medicalRecordsService.ts` (criar novo):

```ts
import api from "@lib/api";
import type { MedicalRecord, CreateMedicalRecordInput } from "@/types/cows";

const base = (cowId: number) => `/cows/${cowId}/medical-records`;

export const getMedicalRecords = (cowId: number) =>
  api.get<MedicalRecord[]>(base(cowId)).then((r) => r.data);

export const createMedicalRecord = (cowId: number, data: CreateMedicalRecordInput) =>
  api.post<MedicalRecord>(base(cowId), data).then((r) => r.data);

export const updateMedicalRecord = (
  cowId: number,
  recordId: number,
  data: Partial<CreateMedicalRecordInput>,
) => api.put<MedicalRecord>(`${base(cowId)}/${recordId}`, data).then((r) => r.data);

export const deleteMedicalRecord = (cowId: number, recordId: number) =>
  api.delete(`${base(cowId)}/${recordId}`);
```

**✅ 1c — Hooks**

Arquivo: `frontend/src/features/cows/hooks/useMedicalRecords.ts` (criar novo):

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "@services/medicalRecordsService";
import type { CreateMedicalRecordInput } from "@/types/cows";

export const useMedicalRecords = (cowId: number) =>
  useQuery({
    queryKey: ["medical-records", cowId],
    queryFn: () => svc.getMedicalRecords(cowId),
    enabled: !!cowId,
  });

export const useCreateMedicalRecord = (cowId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedicalRecordInput) =>
      svc.createMedicalRecord(cowId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medical-records", cowId] }),
  });
};

export const useDeleteMedicalRecord = (cowId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordId: number) => svc.deleteMedicalRecord(cowId, recordId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medical-records", cowId] }),
  });
};
```

**✅ 1d — Criar `MedicalRecordCard`**

Arquivo: `frontend/src/features/cows/components/MedicalRecordCard.tsx`

Card com:
- Badge colorido por tipo: CHECKUP (azul) / PROCEDURE (laranja) / MEDICATION (verde)
- Título e data formatada (pt-BR)
- Nome do veterinário que registrou
- Notas colapsáveis (se existirem)
- Botão excluir (visível apenas com permissão `Delete MedicalRecord`)

```tsx
const TYPE_LABEL: Record<MedicalRecordType, string> = {
  CHECKUP:   "Consulta",
  PROCEDURE: "Procedimento",
  MEDICATION:"Medicação",
};
```

**✅ 1e — Criar `MedicalRecordModal`**

Arquivo: `frontend/src/features/cows/components/MedicalRecordModal.tsx`

Formulário com:
- Select de tipo: Consulta / Procedimento / Medicação
- Input de título (obrigatório)
- Textarea de notas (opcional)
- Date-time picker para data da consulta (padrão: agora)
- Botões: Cancelar / Salvar

Usar `react-hook-form` + validação simples (título obrigatório, tipo obrigatório).

**✅ 1f — Adicionar seção de prontuário em `CowDetailPage`**

Arquivo: `frontend/src/features/cows/pages/CowDetailPage.tsx`

```tsx
import { useMedicalRecords, useDeleteMedicalRecord } from "../hooks/useMedicalRecords";
import { MedicalRecordCard } from "../components/MedicalRecordCard";
import { MedicalRecordModal } from "../components/MedicalRecordModal";
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";  // após Angelo criar

// dentro do componente:
const { data: records } = useMedicalRecords(cow.id);
const canCreateRecord = useHasPermission(PERMISSIONS.CREATE_MEDICAL_RECORD);
const [showRecordModal, setShowRecordModal] = useState(false);

// no JSX — nova seção após os dados de sensor:
<section>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <h3>Prontuário</h3>
    {canCreateRecord && (
      <button className="btn btn-primary btn-sm" onClick={() => setShowRecordModal(true)}>
        + Registro
      </button>
    )}
  </div>

  {records?.length === 0 && (
    <p style={{ color: "var(--text-muted)" }}>Nenhum registro clínico.</p>
  )}
  {records?.map((r) => (
    <MedicalRecordCard key={r.id} record={r} cowId={cow.id} />
  ))}

  <MedicalRecordModal
    open={showRecordModal}
    cowId={cow.id}
    onClose={() => setShowRecordModal(false)}
  />
</section>
```

> **Nota:** se Angelo ainda não criou `config/permissions.ts`, use as strings literais
> por enquanto: `useHasPermission("Create MedicalRecord")`.

---

## Prioridade ALTA

### ✅ TAREFA 2 — Reaplicar correção do bottom nav

O commit `cc06909` reverteu a correção que você fez. Reaplicar no `App.css`:

**Arquivo: `frontend/src/styles/App.css`** — localizar `.bottom-nav` (~linha 196):

```css
/* ANTES (estado atual — com bug) */
.bottom-nav {
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* DEPOIS (corrigido) */
.bottom-nav {
  height: calc(64px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  -webkit-transform: translateZ(0);
}
```

Localizar `.bottom-nav__item` (~linha 218) e adicionar:

```css
.bottom-nav__item {
  height: 64px;       /* fixar altura no conteúdo, não herdar o safe-area */
  align-self: start;  /* ancorar ao topo do grid */
  /* ... restante dos estilos permanece igual ... */
}
```

**Testar no DevTools:** iPhone 14 Pro (375×812) e Pixel 7 — ícones devem ficar
acima do indicador de home, sem sobreposição.

---

### ✅ TAREFA 3 — Feature B: Notificação navega para a vaca

**✅ 3a — Backend**

Arquivo: `backend/src/services/notificationsService.ts` — na query de listagem,
adicionar `cowId: true` no `select`:

```ts
select: {
  id: true,
  title: true,
  message: true,
  readAt: true,
  createdAt: true,
  cowId: true,   // ← ADICIONAR
}
```

Adicionar campo `read` computado:
```ts
// mapear resultado:
records.map(n => ({ ...n, read: n.readAt !== null }))
```

**✅ 3b — Frontend**

Arquivo: `frontend/src/types/notifications.ts` (ou onde o tipo `Notification` está) —
confirmar que `cowId` é `number | null`, não `string`.

Arquivo: `frontend/src/features/notifications/pages/NotificationsPage.tsx` —
no handler de clique na notificação:

```tsx
const handleNotificationClick = async (n: Notification) => {
  await markAsRead(n.id);
  if (n.cowId) {
    navigate(`/cows/${n.cowId}`);
  }
};
```

Verificar se `useNavigate` já está importado — adicionar se necessário.

---

### ✅ TAREFA 4 — Conectar DashboardOverviewChart ao endpoint health-timeline

O componente `DashboardOverviewChart` existe mas não está renderizado em `DashboardPage`.
O endpoint `GET /dashboard/health-timeline` existe no backend.

**Arquivo: `frontend/src/features/dashboard/pages/DashboardPage.tsx`**

```tsx
import { DashboardOverviewChart } from "../components/DashboardOverviewChart";

// após os KPI cards, antes do grid de 3 colunas:
<DashboardOverviewChart farmId={selectedFarm?.id} />
```

Verificar a interface de props de `DashboardOverviewChart` — se espera `data: ChartDataPoint[]`
como prop, criar um hook wrapper:

```ts
// frontend/src/features/dashboard/hooks/useHealthTimeline.ts
export const useHealthTimeline = (farmId?: number) =>
  useQuery({
    queryKey: ["dashboard", "health-timeline", farmId],
    queryFn: async () => {
      const params = farmId ? `?farmId=${farmId}` : "";
      const res = await api.get(`/dashboard/health-timeline${params}`);
      return res.data;
    },
  });
```

---

## Prioridade MÉDIA

### ✅ TAREFA 5 — Feature F: Onboarding (3 slides)

**Arquivo a criar:** `frontend/src/pages/onboarding/OnboardingPage.tsx`

3 slides com dot navigation e botão "Próximo" / "Pular":

| Slide | Título | Subtítulo |
|---|---|---|
| 1 | Monitoramento em tempo real | Coleiras RF10A enviam dados de FC, temperatura e atividade |
| 2 | Alertas inteligentes | Receba notificações quando uma vaca precisar de atenção |
| 3 | Gerencie seu rebanho | Selecione a fazenda e acompanhe cada animal individualmente |

Lógica:
```ts
// mostrar apenas uma vez:
const done = localStorage.getItem("onboardingDone");
if (done) navigate("/dashboard", { replace: true });

// ao pular ou concluir:
localStorage.setItem("onboardingDone", "true");
navigate("/dashboard", { replace: true });
```

**Arquivo: `frontend/src/routes/AppRoutes.tsx`** — adicionar rota pública `/onboarding`.

**Arquivo: `frontend/src/pages/profile/ProfilePage.tsx`** — adicionar link
"Ver tutorial" que limpa o flag e navega para `/onboarding`.

---

### ✅ TAREFA 6 — P1: Filtros de severidade em NotificationsPage

**Arquivo: `frontend/src/features/notifications/pages/NotificationsPage.tsx`**

Adicionar filtros além dos existentes ("Todos" / "Não lidos"):

```tsx
type SeverityFilter = "all" | "high" | "medium" | "low" | "read";
const [severity, setSeverity] = useState<SeverityFilter>("all");

// filtrar notificações:
const filtered = notifications?.filter(n => {
  if (severity === "read")   return n.readAt !== null;
  if (severity === "high")   return n.severity === "HIGH";
  if (severity === "medium") return n.severity === "MEDIUM";
  if (severity === "low")    return n.severity === "LOW";
  return true;
});
```

Pills a adicionar: **Críticos · N** / **Avisos · N** / **Resolvidos**

> Nota: o campo `severity` já existe no modelo `Notification` do backend
> (Renato adicionou `AlertSeverity` enum). Verificar se o frontend
> já inclui `severity` no tipo — adicionar se necessário.

---

### ✅ TAREFA 7 — P3: OfflineBanner + skeleton shimmer

**Arquivo a criar:** `frontend/src/components/ui/OfflineBanner.tsx`

```tsx
import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export const OfflineBanner = () => {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  if (!offline) return null;

  return (
    <div style={{
      background: "var(--warning-soft, rgba(245,127,23,0.15))",
      color: "var(--warning)",
      padding: "6px 16px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: "var(--t-sm)",
      fontWeight: 600,
    }}>
      <WifiOff size={14} />
      Offline · dados podem estar desatualizados
    </div>
  );
};
```

**Arquivo: `frontend/src/components/layout/AppShell.tsx`** — importar e renderizar
o `<OfflineBanner />` logo abaixo do `<Sidebar />` e antes do `<main>`.

**Arquivo: `frontend/src/styles/App.css`** — adicionar classe de skeleton:

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-elev-1) 25%,
    var(--bg-elev-2) 50%,
    var(--bg-elev-1) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

Usar nas páginas que têm estado de loading:
```tsx
{isLoading && <div className="skeleton" style={{ height: 80, marginBottom: 8 }} />}
```

---

## Verificação final

```bash
cd frontend
npm run lint
npm run build   # zero erros TypeScript

cd ../backend
npm run build   # zero erros TypeScript (para a mudança em notificationsService)
```

Testes manuais:
1. Login como `vet@cowhealth.com` → acessar qualquer vaca → seção Prontuário visível com botão "+ Registro"
2. Login como `obs@cowhealth.com` → seção Prontuário visível mas sem botão de criação
3. Clicar em notificação com vaca associada → navegar para `/cows/:id`
4. Clicar em notificação sem vaca → permanecer na página
5. Bottom nav no iPhone 14 Pro (DevTools) → ícones acima do home indicator
6. Dashboard → gráfico de linha dos últimos 7 dias visível

## Abrir PR

```bash
git add -A
git commit -m "feat: medical records frontend, bottom nav fix, notification navigation"
git push origin feature/ian-medical-mobile-v2
# Abrir PR → base: develop
```
