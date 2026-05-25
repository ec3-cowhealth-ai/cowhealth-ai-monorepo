# Plano: Prontuário Veterinário, Notificações com Navegação e Baixa de Animal

**Data**: 2026-05-25
**Status**: Planejado (aguardando aprovação para implementação)

## Nomenclatura

> **`CowDetailPage` = "Prontuário"** na documentação, UX e comunicação do projeto. A rota `/cows/:id` leva ao Prontuário do animal.

## Contexto

Três necessidades inter-relacionadas na plataforma:

1. **Notificações sem navegação**: `NotificationsPage` só marca como lida ao clicar — não navega até o Prontuário do animal. `NotificationCard` já implementa a navegação mas não é usado. Há também uma divergência entre o shape retornado pelo backend (`cow: { id }`, `readAt`) e o tipo do frontend (`cowId`, `read`).

2. **Prontuário sem ficha clínica**: Não há tabela de registros clínicos no schema. O Prontuário (`CowDetailPage`) precisa de uma seção para veterinários e zootecnistas registrarem atendimentos, procedimentos e medicações, com controle de acesso RBAC.

3. **Baixa de animal sem fluxo**: Quando uma vaca é vendida ou abatida, não existe mecanismo para desacoplar a coleira, arquivar o histórico e liberar o dispositivo para reatribuição.

---

## Epic 1 — Notificações → Prontuário

### Problema
Backend retorna `{ cow: { id, tag, name, status }, readAt }`, mas o tipo frontend `Notification` declara `{ cowId?: string, read: boolean }`. O `cowId` nunca é preenchido, então `NotificationsPage` nunca navega.

### Solução

**Backend** — `backend/src/services/notificationsService.ts`
Adicionar `cowId: true` ao `select` do `getAllNotifications` (o campo já existe no modelo Prisma — faltava apenas selecionar). Adicionar campo computado `read` mapeado de `readAt`:

```ts
return records.map((n) => ({
  ...n,
  cowId: n.cowId,     // flat, já presente após adicionar ao select
  read: n.readAt !== null,
}));
```

**Frontend** — `frontend/src/features/notifications/pages/NotificationsPage.tsx`
No handler de clique da notificação, após marcar como lida, adicionar:

```ts
if (n.cowId) navigate(`/cows/${n.cowId}`);
```

O `useNavigate` já está disponível no arquivo (verificar — se não estiver, adicionar).

### Arquivos
- `backend/src/services/notificationsService.ts`
- `frontend/src/features/notifications/pages/NotificationsPage.tsx`

---

## Epic 2 — Prontuário Veterinário

### Schema (nova migration)

```prisma
enum MedicalRecordType {
  CONSULTA
  PROCEDIMENTO
  MEDICACAO
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

### Novas Permissões (adicionadas via seed/migration)

| Permissão | Veterinario | Zootecnista | Gerente de Fazenda | Produtor | Admin | SuperAdmin |
|---|---|---|---|---|---|---|
| `ViewAny MedicalRecord` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `View MedicalRecord` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `Create MedicalRecord` | ✅ | ✅ | — | — | ✅ | ✅ |
| `Update MedicalRecord` | ✅ | ✅ | — | — | ✅ | ✅ |
| `Delete MedicalRecord` | ✅ | — | — | — | ✅ | ✅ |

### Backend

**`backend/src/services/medicalRecordsService.ts`** — novo arquivo:
- `getMedicalRecords(cowId)` — lista todos os registros de uma vaca, com `user.name` incluído, ordenados por `recordedAt desc`
- `getMedicalRecord(recordId, cowId)` — busca individual, verifica pertencimento ao cowId
- `createMedicalRecord(cowId, userId, data)` — cria novo registro
- `updateMedicalRecord(recordId, cowId, data)` — atualiza (verifica pertencimento)
- `deleteMedicalRecord(recordId, cowId)` — exclui (verifica pertencimento)

**`backend/src/controllers/medicalRecordsController.ts`** — novo arquivo com 5 handlers usando o padrão `handleRequest` existente.

**`backend/src/routes/medicalRecordsRoutes.ts`** — novo arquivo com rotas nested dentro de cows:

```ts
router.get("/", requireAuth, requirePermission("ViewAny MedicalRecord"), listMedicalRecords);
router.get("/:recordId", requireAuth, requirePermission("View MedicalRecord"), showMedicalRecord);
router.post("/", requireAuth, requirePermission("Create MedicalRecord"), storeMedicalRecord);
router.put("/:recordId", requireAuth, requirePermission("Update MedicalRecord"), updateMedicalRecordController);
router.delete("/:recordId", requireAuth, requirePermission("Delete MedicalRecord"), destroyMedicalRecord);
```

Registrado em `backend/src/routes/cowsRoutes.ts` como sub-rota:
```ts
router.use("/:id/medical-records", medicalRecordsRouter);
// ou inline direto em cowsRoutes.ts para manter o padrão flat do projeto
```

Verificar se o projeto usa sub-routers ou rotas flat — usar o mesmo padrão.

### Frontend

**`frontend/src/types/cows.ts`** — adicionar:
```ts
export type MedicalRecordType = "CONSULTA" | "PROCEDIMENTO" | "MEDICACAO";

export interface MedicalRecord {
  id: number;
  cowId: number;
  userId: number;
  type: MedicalRecordType;
  title: string;
  notes?: string;
  recordedAt: string;
  createdAt: string;
  user: { id: number; name: string };
}

export interface CreateMedicalRecordInput {
  type: MedicalRecordType;
  title: string;
  notes?: string;
  recordedAt: string;
}
```

**`frontend/src/services/medicalRecordsService.ts`** — novo arquivo:
```ts
list: (cowId) => api.get(`/cows/${cowId}/medical-records`)
get: (cowId, recordId) => api.get(`/cows/${cowId}/medical-records/${recordId}`)
create: (cowId, input) => api.post(`/cows/${cowId}/medical-records`, input)
update: (cowId, recordId, input) => api.put(`/cows/${cowId}/medical-records/${recordId}`, input)
delete: (cowId, recordId) => api.delete(`/cows/${cowId}/medical-records/${recordId}`)
```

**`frontend/src/features/cows/hooks/useMedicalRecords.ts`** — novo arquivo:
- `useMedicalRecords(cowId)` — queryKey `["cows", cowId, "medical-records"]`
- `useCreateMedicalRecord()` — mutation, invalida queryKey acima
- `useUpdateMedicalRecord()` — mutation, invalida queryKey acima
- `useDeleteMedicalRecord()` — mutation, invalida queryKey acima

**`frontend/src/features/cows/pages/CowDetailPage.tsx`** — nova seção "Prontuário":

```tsx
// Seção com acesso condicional
const canCreate = useHasPermission("Create MedicalRecord");
const canDelete = useHasPermission("Delete MedicalRecord");
const { data: medicalRecords } = useMedicalRecords(id || "");

// Renderização:
<div>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
    <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-secondary)" }}>
      Prontuário
    </p>
    {canCreate && (
      <button className="btn-primary" onClick={() => setShowMedicalModal(true)}>
        + Registro
      </button>
    )}
  </div>
  {medicalRecords?.length ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {medicalRecords.map((r) => (
        <MedicalRecordCard key={r.id} record={r} canDelete={canDelete} onDelete={...} />
      ))}
    </div>
  ) : (
    <p style={{ color: "var(--text-muted)", fontSize: 12 }}>Sem registros clínicos.</p>
  )}
</div>
```

**`frontend/src/features/cows/components/MedicalRecordCard.tsx`** — novo componente:
- Badge de tipo (CONSULTA / PROCEDIMENTO / MEDICAÇÃO) com cores distintas
- Data formatada + nome do autor (user.name)
- Título em bold + notes colapsadas (expandível)
- Ícone de lixeira se `canDelete`

**`frontend/src/features/cows/components/MedicalRecordModal.tsx`** — modal de criação:
- Select de tipo (CONSULTA / PROCEDIMENTO / MEDICAÇÃO)
- Input de título (obrigatório)
- Textarea de notas (opcional)
- Date picker para `recordedAt` (default: hoje)
- Botões: Cancelar / Salvar

---

## Epic 3 — Baixa de Animal (Venda / Abate)

### Schema (mesma migration ou separada)

```prisma
// Adicionar ao enum CowStatus:
RETIRED

// Adicionar ao model Cow:
retiredAt     DateTime?    @map("retired_at")
retiredReason String?      @map("retired_reason")  // "VENDA" | "ABATE"
```

> **Estratégia de arquivo**: Soft-delete com status `RETIRED`. A vaca permanece no banco com status `RETIRED`, dados históricos de sensores e prontuário intactos (ligados via FK). Views normais filtram `status != RETIRED`. Não há segunda instância de banco — o isolamento é por filtro de status. Ver nota abaixo.

### Nova Permissão

| Permissão | Produtor | Gerente de Fazenda | Admin | SuperAdmin |
|---|---|---|---|---|
| `Retire Cow` | ✅ | ✅ | ✅ | ✅ |

### Backend

**`backend/src/services/cowsService.ts`** — nova função `retireCow(cowId, reason)`:
1. Buscar vaca — lançar erro se não encontrada ou já `RETIRED`
2. Atualizar vaca: `status = RETIRED`, `retiredAt = now()`, `retiredReason = reason`, `collarId = null`
3. Se tinha coleira: atualizar `collar.status = INACTIVE`
4. Retornar vaca atualizada

**`backend/src/controllers/cowsController.ts`** — `retireCowController`:
```ts
export const retireCowController = async (req, res) => {
  const { reason } = req.body; // "VENDA" | "ABATE"
  await handleRequest(res, () => retireCow(Number(req.params.id), reason), 200, 404);
};
```

**`backend/src/routes/cowsRoutes.ts`** — nova rota:
```ts
router.post("/:id/retire", requireAuth, requirePermission("Retire Cow"), retireCowController);
```

**Filtro nas listagens**: `getAllCows` deve adicionar filtro `status: { not: "RETIRED" }` por padrão (com opção de incluir retired via query param `includeRetired=true` para uso administrativo).

### Frontend

**`frontend/src/features/cows/pages/CowDetailPage.tsx`** — nova seção "Baixa do Animal":

```tsx
const canRetire = useHasPermission("Retire Cow");

// Exibir somente se canRetire e vaca não está já RETIRED:
{canRetire && cow.status !== "RETIRED" && (
  <div className="card" style={{ borderColor: "var(--danger)", borderWidth: 1 }}>
    <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Baixa do Animal</p>
    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
      Registrar saída definitiva do animal. A coleira será liberada automaticamente.
    </p>
    <button className="btn-danger" onClick={() => setShowRetireModal(true)}>
      Registrar Baixa
    </button>
  </div>
)}
```

**`frontend/src/features/cows/components/RetireAnimalModal.tsx`** — novo modal:
- Seleção de motivo: `VENDA` / `ABATE` (radio buttons ou segmented control)
- Aviso de irreversibilidade em destaque
- Confirmação com botão vermelho "Confirmar Baixa"
- Após sucesso: navegar para `/cows` (lista, pois a vaca some da view ativa)

**`frontend/src/types/cows.ts`** — adicionar ao `COW_STATUS_VALUES` e `CowStatus`:
```ts
RETIRED: "RETIRED"
```

**`frontend/src/features/cows/hooks/useCows.ts`** — novo hook `useRetireCow()`:
```ts
export const useRetireCow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: "VENDA" | "ABATE" }) =>
      cowsService.retire(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cows"] });
    },
  });
};
```

---

## Ordem de Implementação

1. **Migration** — schema com `MedicalRecord`, `RETIRED` status, campos de baixa
2. **Seed update** — novas permissões + atribuição a roles
3. **Epic 3 Backend** — retire endpoint (simples, sem novas tabelas além da migration)
4. **Epic 2 Backend** — medical records CRUD
5. **Epic 1 Fix** — correção do shape de notificações + navegação (2 arquivos)
6. **Epic 3 Frontend** — modal de baixa + hook
7. **Epic 2 Frontend** — seção prontuário na CowDetailPage + componentes + hook
8. **Documentação** — salvar plano em `docs/plan/`

---

## Estratégia de Arquivamento (confirmada)

**Soft-delete com status `RETIRED`** — escolha do usuário.

- Vaca recebe `status = RETIRED`, `retiredAt`, `retiredReason`, `collarId = null`
- Coleira associada recebe `status = INACTIVE`
- Todo o histórico (sensores, prontuário) permanece no banco principal, intacto, vinculado via FK
- Listagens normais filtram `status: { not: "RETIRED" }` automaticamente
- Admins podem acessar vacas arquivadas com query param `includeRetired=true`

---

## Verificação

1. **Epic 1**: Clicar em notificação com `cowId` → navega para `/cows/:id`
2. **Epic 2**: Usuário com `Create MedicalRecord` vê botão "+ Registro" no prontuário; usuário sem permissão não vê. POST/GET/DELETE retornam corretamente. `Gerente de Fazenda` pode ler mas não criar.
3. **Epic 3**: Usuário com `Retire Cow` vê seção de baixa; confirmar ABATE → coleira fica INACTIVE, vaca sai da lista ativa, dados históricos acessíveis via admin.

---

## Arquivos a Criar/Modificar

### Novos
- `backend/prisma/migrations/<timestamp>_prontuario_e_baixa/` (migration)
- `backend/src/services/medicalRecordsService.ts`
- `backend/src/controllers/medicalRecordsController.ts`
- `backend/src/routes/medicalRecordsRoutes.ts`
- `frontend/src/services/medicalRecordsService.ts`
- `frontend/src/features/cows/hooks/useMedicalRecords.ts`
- `frontend/src/features/cows/components/MedicalRecordCard.tsx`
- `frontend/src/features/cows/components/MedicalRecordModal.tsx`
- `frontend/src/features/cows/components/RetireAnimalModal.tsx`

### Modificados
- `backend/prisma/schema.prisma` — enum `MedicalRecordType`, model `MedicalRecord`, campo `RETIRED` em `CowStatus`, `retiredAt/retiredReason` em `Cow`
- `backend/prisma/seed.ts` — novas permissões + atribuição a roles
- `backend/src/services/cowsService.ts` — `retireCow()`, filtro RETIRED em `getAllCows`
- `backend/src/controllers/cowsController.ts` — `retireCowController`
- `backend/src/routes/cowsRoutes.ts` — rota `POST /:id/retire` + mount de medical records
- `backend/src/services/notificationsService.ts` — `cowId` no select + campo `read`
- `frontend/src/types/cows.ts` — `MedicalRecord`, `MedicalRecordType`, `CreateMedicalRecordInput`, `RETIRED` em `CowStatus`
- `frontend/src/features/cows/hooks/useCows.ts` — `useRetireCow()`
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — seção prontuário + seção baixa
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — navegação ao clicar
