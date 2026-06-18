# Plano Mestre — Quadro Vacinal Bovino
**Versão:** 1.0 — 2026-06-17
**Autor:** JCFS

---

## 0. Objetivo

Implementar um quadro vacinal estruturado por animal, passando por todas as camadas do sistema: schema Prisma → migration → seed → backend (Zod, service, controller, rotas, permissões) → frontend (types, service, hook, componentes, integração em `CowDetailPage` e `ClinicalRecordListPage`).

Hoje o campo `CowClinicalRecord.vaccinationHistory` armazena texto livre. Esta feature substitui esse padrão por registros estruturados e consultáveis.

---

## 1. Schema Prisma

**Arquivo:** `backend/prisma/schema.prisma`

### 1.1 Novo model `Vaccination`

```prisma
model Vaccination {
  id          Int       @id @default(autoincrement())
  cowId       Int       @map("cow_id")
  appliedById Int       @map("applied_by_id")
  vaccine     String                        // nome da vacina
  appliedAt   DateTime  @map("applied_at")
  nextDueAt   DateTime? @map("next_due_at") // próxima dose / reforço
  batchNumber String?   @map("batch_number")
  notes       String?   @db.Text
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  cow       Cow  @relation(fields: [cowId], references: [id], onDelete: Cascade)
  appliedBy User @relation("VaccinationAppliedBy", fields: [appliedById], references: [id])

  @@index([cowId, appliedAt])
  @@map("vaccinations")
}
```

### 1.2 Relação inversa em `Cow`

```prisma
model Cow {
  // ... campos existentes ...
  vaccinations Vaccination[]
}
```

### 1.3 Relação inversa em `User`

```prisma
model User {
  // ... campos existentes ...
  vaccinations Vaccination[] @relation("VaccinationAppliedBy")
}
```

---

## 2. Migration

Após editar o schema, rodar:

```bash
cd backend && npx prisma migrate dev --name add_vaccinations
```

A migration criará:
- Tabela `vaccinations` com todos os campos acima
- Índice composto `(cow_id, applied_at)` para queries por período
- FK `cow_id → cows.id` com `CASCADE` e `applied_by_id → users.id`

---

## 3. Permissões

**Arquivo:** `backend/prisma/seed.ts`

Adicionar ao array `permissionNames`:

```ts
"ViewAny Vaccination",
"View Vaccination",
"Create Vaccination",
"Update Vaccination",
"Delete Vaccination",
```

Distribuição por papel:

| Papel | Permissões |
|---|---|
| SuperAdmin | todas |
| Administrador | todas |
| Veterinário | ViewAny, View, Create, Update, Delete |
| Zootecnista | ViewAny, View, Create, Update |
| Gerente de Fazenda | ViewAny, View |
| Operador de Campo | ViewAny, View |
| Financeiro | — |
| Observador | ViewAny, View |
| Produtor | ViewAny, View |

Também adicionar um `PermissionGroup` `"Vacinas"` com as 5 permissões.

---

## 4. Seed

**Arquivo:** `backend/prisma/seed.ts`

Vacinas comuns do calendário bovino brasileiro para usar nos dados mockados:

```ts
const VACCINES = [
  { name: "Febre Aftosa",      intervalMonths: 6  },
  { name: "Brucelose",         intervalMonths: 0  }, // dose única em bezerras
  { name: "Raiva",             intervalMonths: 12 },
  { name: "IBR / BVD",         intervalMonths: 12 },
  { name: "Clostridioses",     intervalMonths: 12 },
  { name: "Carbúnculo",        intervalMonths: 12 },
  { name: "Leptospirose",      intervalMonths: 6  },
];
```

Regra de seed: cada vaca recebe 2–4 registros vacinais determinísticos (PRNG por `cow.id`), com `appliedAt` nos últimos 18 meses e `nextDueAt` calculado com base em `intervalMonths`. `appliedById` aponta para `vetUser` ou `zootUser`.

---

## 5. Backend

### 5.1 Zod schema

**Arquivo:** `backend/src/schemas/vaccinationSchemas.ts`

```ts
import { z } from "zod";

export const createVaccinationSchema = z.object({
  vaccine:     z.string().min(2).max(100),
  appliedAt:   z.iso.datetime({ offset: true }),
  nextDueAt:   z.iso.datetime({ offset: true }).optional(),
  batchNumber: z.string().max(50).optional(),
  notes:       z.string().optional(),
});

export const updateVaccinationSchema = createVaccinationSchema.partial();
```

### 5.2 Service

**Arquivo:** `backend/src/services/vaccinationsService.ts`

Funções a implementar (padrão idêntico ao `medicalRecordsService.ts`):

| Função | Descrição |
|---|---|
| `getVaccinations(cowId)` | Lista todas as vacinas da vaca, `deletedAt: null`, `orderBy: appliedAt desc` |
| `getVaccination(cowId, vaccinationId)` | Retorna uma vacina com validação de pertencimento |
| `createVaccination(cowId, userId, data)` | Cria registro; `appliedById = userId` |
| `updateVaccination(cowId, vaccinationId, data)` | Atualiza com validação de pertencimento |
| `deleteVaccination(cowId, vaccinationId)` | Soft delete (`deletedAt: new Date()`) |

Select padrão a retornar:
```ts
{
  id, vaccine, appliedAt, nextDueAt, batchNumber, notes, createdAt,
  appliedBy: { id, name }
}
```

### 5.3 Controller

**Arquivo:** `backend/src/controllers/vaccinationsController.ts`

Seguir exatamente o padrão de `medicalRecordsController.ts`:
- `listVaccinations` — chama `getVaccinations`
- `showVaccination` — chama `getVaccination`
- `storeVaccination` — extrai `req.user.id`, chama `createVaccination`
- `updateVaccinationController` — chama `updateVaccination`
- `destroyVaccination` — chama `deleteVaccination`

### 5.4 Rotas

**Arquivo:** `backend/src/routes/cowsRoutes.ts`

Adicionar bloco após as rotas de `clinical-records`:

```ts
// Quadro Vacinal
router.get(
  "/:id/vaccinations",
  requireAuth,
  requirePermission("ViewAny Vaccination"),
  listVaccinations,
);
router.get(
  "/:id/vaccinations/:vaccinationId",
  requireAuth,
  requirePermission("View Vaccination"),
  showVaccination,
);
router.post(
  "/:id/vaccinations",
  requireAuth,
  requirePermission("Create Vaccination"),
  validateSchema(createVaccinationSchema),
  storeVaccination,
);
router.put(
  "/:id/vaccinations/:vaccinationId",
  requireAuth,
  requirePermission("Update Vaccination"),
  validateSchema(updateVaccinationSchema),
  updateVaccinationController,
);
router.delete(
  "/:id/vaccinations/:vaccinationId",
  requireAuth,
  requirePermission("Delete Vaccination"),
  destroyVaccination,
);
```

---

## 6. Frontend

### 6.1 Types

**Arquivo:** `frontend/src/types/vaccinations.ts`

```ts
export interface Vaccination {
  id: number;
  vaccine: string;
  appliedAt: string;
  nextDueAt: string | null;
  batchNumber: string | null;
  notes: string | null;
  createdAt: string;
  appliedBy: { id: number; name: string };
}

export interface CreateVaccinationInput {
  vaccine: string;
  appliedAt: string;
  nextDueAt?: string;
  batchNumber?: string;
  notes?: string;
}
```

Adicionar ao `@config/permissions.ts`:
```ts
VIEW_ANY_VACCINATION:    "ViewAny Vaccination",
VIEW_VACCINATION:        "View Vaccination",
CREATE_VACCINATION:      "Create Vaccination",
UPDATE_VACCINATION:      "Update Vaccination",
DELETE_VACCINATION:      "Delete Vaccination",
```

### 6.2 API Service

**Arquivo:** `frontend/src/services/vaccinationsService.ts`

```ts
import { api } from "@lib/axios";
import type { Vaccination, CreateVaccinationInput } from "@/types/vaccinations";

export const getVaccinations = (cowId: number) =>
  api.get<Vaccination[]>(`/cows/${cowId}/vaccinations`).then(r => r.data);

export const createVaccination = (cowId: number, data: CreateVaccinationInput) =>
  api.post<Vaccination>(`/cows/${cowId}/vaccinations`, data).then(r => r.data);

export const updateVaccination = (cowId: number, id: number, data: Partial<CreateVaccinationInput>) =>
  api.put<Vaccination>(`/cows/${cowId}/vaccinations/${id}`, data).then(r => r.data);

export const deleteVaccination = (cowId: number, id: number) =>
  api.delete(`/cows/${cowId}/vaccinations/${id}`);
```

### 6.3 Hook

**Arquivo:** `frontend/src/features/cows/hooks/useVaccinations.ts`

Seguir padrão de `useMedicalRecords.ts`:
- `useVaccinations(cowId)` — query `["vaccinations", cowId]`
- `useCreateVaccination(cowId)` — mutation com invalidação
- `useUpdateVaccination(cowId)` — mutation com invalidação
- `useDeleteVaccination(cowId)` — mutation com invalidação

### 6.4 Componente VaccinationCard

**Arquivo:** `frontend/src/features/cows/components/VaccinationCard.tsx`

Exibir por card:
- Nome da vacina (destaque)
- Data de aplicação (`appliedAt`)
- Próxima dose (`nextDueAt`) — com indicador visual de vencimento próximo (< 30 dias = amarelo, vencida = vermelho)
- Lote (`batchNumber`) se preenchido
- Aplicado por (`appliedBy.name`)
- Botão de delete para quem tem `DELETE_VACCINATION`

### 6.5 Componente VaccinationModal

**Arquivo:** `frontend/src/features/cows/components/VaccinationModal.tsx`

Usar `FormModal` (já existe). Campos:
- `vaccine` — text input (obrigatório)
- `appliedAt` — date input (obrigatório)
- `nextDueAt` — date input (opcional)
- `batchNumber` — text input (opcional)
- `notes` — textarea (opcional)

### 6.6 Integração em CowDetailPage

**Arquivo:** `frontend/src/features/cows/pages/CowDetailPage.tsx`

Adicionar:
1. `const { data: vaccinations } = useVaccinations(Number(id))`
2. `const canCreateVaccination = useHasPermission(PERMISSIONS.CREATE_VACCINATION)`
3. Seção **"Quadro Vacinal"** após "Registros médicos", com:
   - Botão `+ Vacina` (condicional por permissão) que abre `VaccinationModal`
   - Lista de `VaccinationCard`
   - Estado vazio: `"Nenhuma vacina registrada."`

### 6.7 Integração em ClinicalRecordListPage

**Arquivo:** `frontend/src/features/clinicalRecord/pages/ClinicalRecordListPage.tsx`

Adicionar seção "Quadro Vacinal" abaixo de "Registros médicos", seguindo o mesmo padrão já implementado para registros médicos (divisor + título + lista de cards). Somente leitura neste contexto (sem botão de criação).

---

## 7. Ordem de execução

```
1. schema.prisma         — adicionar model Vaccination + relações
2. prisma migrate dev    — gerar e aplicar migration
3. seed.ts               — permissões + grupo + dados vacinais por vaca
4. prisma migrate reset  — recriar banco com seed completo
5. vaccinationSchemas.ts — Zod
6. vaccinationsService.ts (backend)
7. vaccinationsController.ts
8. cowsRoutes.ts         — adicionar rotas
9. types/vaccinations.ts (frontend)
10. permissions.ts       — novas constantes
11. vaccinationsService.ts (frontend)
12. useVaccinations.ts
13. VaccinationCard.tsx
14. VaccinationModal.tsx
15. CowDetailPage.tsx    — integração
16. ClinicalRecordListPage.tsx — integração (somente leitura)
```

---

## 8. Checklist de verificação

- [ ] `GET /cows/:id/vaccinations` retorna lista ordenada por `appliedAt desc`
- [ ] `POST /cows/:id/vaccinations` cria registro com `appliedById = req.user.id`
- [ ] Soft delete funciona (registro não aparece após delete)
- [ ] `nextDueAt` nulo não quebra o card no frontend
- [ ] Indicador visual de reforço vencido/próximo funciona
- [ ] Permissões bloqueiam criação/deleção para papéis sem acesso
- [ ] `VaccinationModal` fecha e invalida cache após submit
- [ ] Seção aparece em `CowDetailPage` e em `ClinicalRecordListPage`
