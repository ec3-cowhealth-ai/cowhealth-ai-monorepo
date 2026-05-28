# Plano Mestre Unificado — Prontuário Clínico + Refatoração do Dashboard
**Versão:** 1.0 — 2026-05-26
**Autores:** JCFS (arquitetura), equipe de desenvolvimento
**Documentos-base:**
- `docs/plan/Master_Plan_DashboardRefactor.md`
- TO-DOs: Cow Clinical Record (fornecido pelo produto)
- Referência visual: `templates/HerdHealthInsight/src/routes/dashboard.tsx`

---

## 0. Visão Geral

Este plano unifica dois trabalhos paralelos:

1. **Refatoração do Dashboard** — redesenhar o painel principal para ficar visualmente idêntico ao template, com dados reais do banco.
2. **Prontuário Clínico da Vaca** — criar a tabela `cow_clinical_records` e todas as telas de CRUD para que veterinários possam registrar avaliações clínicas completas.

Os dois são interdependentes: o Dashboard exibe um resumo da vaca em destaque (CowProfile panel) cujos dados detalhados vivem no prontuário. O fluxo veterinário começa no Dashboard → alerta → perfil da vaca → prontuário.

---

## 1. Modelo de Dados Unificado

### 1.1 Princípio de separação de responsabilidades

| Dado | Onde vive | Por quê |
|---|---|---|
| Status atual da vaca (HEALTHY, ALERT…) | `cows.status` | Atualizado em tempo real pelo processador MQTT |
| Status reprodutivo atual | `cows.reproductive_status` | Resumo sempre atual, atualizado pelo backend quando um prontuário é salvo |
| Último parto, número de lactação, touro | `cows.*` | Campos de resumo na ficha da vaca para consulta rápida no dashboard |
| SpO2, score corporal, diagnóstico, plano de tratamento | `cow_clinical_records.*` | Avaliação veterinária pontual — histórico imutável |
| Sinais vitais automáticos (FC, temperatura) | `heart_rate_data`, `temperature_data` | Streaming contínuo do sensor RF10A |
| Sinais vitais registrados pelo vet na visita | `cow_clinical_records.heart_rate`, `.body_temperature` | Leitura manual ou confirmação do vet na consulta |
| Eventos de comportamento classificados | `activity_events` | Inferência automática sobre acelerômetro |
| Comportamento avaliado pelo vet | `cow_clinical_records.activity_level`, `.posture_notes` | Observação clínica qualitativa |

### 1.2 Alterações no modelo `Cow` (existente)

Adicionar ao schema Prisma:

```prisma
// Enum novo
enum ReproductiveStatus {
  OPEN          // Em aberto
  INSEMINATED   // Inseminada
  PREGNANT      // Gestante
  DRY           // Seca
  POSTPARTUM    // Recém-parida (< 30 dias pós-parto)
}

model Cow {
  // ... campos existentes mantidos ...

  // NOVOS — resumo reprodutivo/lactação (atualizado a cada prontuário salvo)
  lactationNumber    Int?              @map("lactation_number")
  lastCalvingDate    DateTime?         @map("last_calving_date")
  expectedCalvingDate DateTime?        @map("expected_calving_date")
  reproductiveStatus ReproductiveStatus? @map("reproductive_status")
  sire               String?           // nome do touro ou sêmen utilizado

  // Relações novas
  activityEvents     ActivityEvent[]
  clinicalRecords    CowClinicalRecord[]
}
```

> **Regra:** Quando um `CowClinicalRecord` é salvo, o backend deve atualizar automaticamente `Cow.reproductiveStatus`, `Cow.lastCalvingDate`, `Cow.expectedCalvingDate` e `Cow.lactationNumber` com os valores do prontuário — mantendo a consistência sem duplicação de lógica.

### 1.3 Alterações em `Notification` (existente)

```prisma
enum AlertSeverity {
  HIGH    // Alto
  MEDIUM  // Médio
  LOW     // Baixo
}

model Notification {
  // ... campos existentes mantidos ...
  severity  AlertSeverity @default(MEDIUM)
  alertType String?       @map("alert_type")
  // alertType values: "temperature" | "heart_rate" | "activity" | "scheduled" | "clinical"
}
```

### 1.4 Nova tabela `ActivityEvent`

```prisma
enum ActivityType {
  RUMINATION    // Ruminação
  FEEDING       // Alimentação
  RESTING       // Descanso
  LOW_ACTIVITY  // Atividade baixa (alerta)
  HIGH_ACTIVITY // Alta atividade
  WALKING       // Caminhada
}

model ActivityEvent {
  id          Int          @id @default(autoincrement())
  cowId       Int          @map("cow_id")
  type        ActivityType
  startedAt   DateTime     @map("started_at")
  durationMin Int          @map("duration_min")
  createdAt   DateTime     @default(now()) @map("created_at")

  cow Cow @relation(fields: [cowId], references: [id], onDelete: Cascade)

  @@index([cowId, startedAt])
  @@map("activity_events")
}
```

### 1.5 Nova tabela `CowClinicalRecord` (prontuário)

```prisma
enum ClinicalStatus {
  STABLE      // Estável
  MONITORING  // Em monitoramento
  CRITICAL    // Crítico
  RECOVERED   // Recuperada
  REFERRED    // Encaminhada
}

enum BreedingEligibility {
  ELIGIBLE    // Apta
  INELIGIBLE  // Inapta
  PENDING     // Aguardando avaliação
}

enum EstrusStatus {
  IN_ESTRUS    // Em cio
  NOT_IN_ESTRUS
  UNKNOWN
}

model CowClinicalRecord {
  id        Int      @id @default(autoincrement())
  cowId     Int      @map("cow_id")
  veterinarianId Int @map("veterinarian_id")
  recordDate DateTime @map("record_date")

  // ── Avaliação clínica geral ──────────────────────────────────────
  clinicalStatus      ClinicalStatus  @map("clinical_status")
  alertOrigin         String?         @map("alert_origin")  // "sensor" | "visual" | "scheduled" | "owner_report"

  // ── Sinais vitais (medidos/confirmados pelo veterinário na visita) ─
  heartRate           Int?            @map("heart_rate")         // bpm
  spo2                Float?          // % saturação de oxigênio
  bodyTemperature     Float?          @map("body_temperature")   // °C
  ambientTemperature  Float?          @map("ambient_temperature") // °C
  activityLevel       String?         @map("activity_level")     // "Normal" | "Baixa" | "Alta"
  postureNotes        String?         @map("posture_notes")      @db.Text

  // ── Biometria ────────────────────────────────────────────────────
  weight              Float?          // kg
  age                 Float?          // anos (calculado no backend, armazenado como snapshot)
  bodyConditionScore  Float?          @map("body_condition_score") // escala 1-5

  // ── Alimentação ──────────────────────────────────────────────────
  feedingNotes        String?         @map("feeding_notes")      @db.Text

  // ── Histórico e avaliação clínica ────────────────────────────────
  healthHistory       String?         @map("health_history")     @db.Text
  currentSymptoms     String?         @map("current_symptoms")   @db.Text
  diagnosis           String?         @db.Text
  treatmentPlan       String?         @map("treatment_plan")     @db.Text

  // ── Medicamentos, vacinas e procedimentos ────────────────────────
  medicationsAdministered String?     @map("medications_administered") @db.Text // JSON ou texto livre
  vaccinationHistory      String?     @map("vaccination_history")      @db.Text
  surgicalProcedures      String?     @map("surgical_procedures")      @db.Text
  allergyNotes            String?     @map("allergy_notes")            @db.Text

  // ── Status reprodutivo (snapshot no momento da consulta) ─────────
  reproductiveStatus      ReproductiveStatus? @map("reproductive_status")
  breedingEligibility     BreedingEligibility? @map("breeding_eligibility")
  estrusStatus            EstrusStatus?        @map("estrus_status")
  inseminationWindow      String?             @map("insemination_window")  // ex: "2026-06-01 a 2026-06-05"
  pregnancyStatus         Boolean?            @map("pregnancy_status")
  lastCalvingDate         DateTime?           @map("last_calving_date")
  expectedCalvingDate     DateTime?           @map("expected_calving_date")

  // ── Acompanhamento ───────────────────────────────────────────────
  veterinaryRecommendations String?           @map("veterinary_recommendations") @db.Text
  followUpRequired          Boolean           @default(false) @map("follow_up_required")
  followUpDate              DateTime?         @map("follow_up_date")

  // ── Notas gerais ─────────────────────────────────────────────────
  generalNotes            String?             @map("general_notes") @db.Text

  // ── Metadados ────────────────────────────────────────────────────
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt      @map("updated_at")
  deletedAt  DateTime?                 @map("deleted_at") // soft delete

  cow          Cow  @relation(fields: [cowId], references: [id], onDelete: Cascade)
  veterinarian User @relation(fields: [veterinarianId], references: [id])

  @@index([cowId, recordDate])
  @@index([veterinarianId])
  @@map("cow_clinical_records")
}
```

Adicionar relação em `User`:
```prisma
model User {
  // ... campos existentes ...
  clinicalRecords CowClinicalRecord[]
}
```

---

## 2. Migration SQL Completa

**Arquivo:** `backend/prisma/migrations/YYYYMMDD_clinical_and_dashboard/migration.sql`

```sql
-- ═══════════════════════════════════════════════════════════════
-- Fase 1: Novos campos em tabelas existentes
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE cows
  ADD COLUMN lactation_number      INT          NULL,
  ADD COLUMN last_calving_date     DATETIME     NULL,
  ADD COLUMN expected_calving_date DATETIME     NULL,
  ADD COLUMN reproductive_status   ENUM('OPEN','INSEMINATED','PREGNANT','DRY','POSTPARTUM') NULL,
  ADD COLUMN sire                  VARCHAR(191) NULL;

ALTER TABLE notifications
  ADD COLUMN severity   ENUM('HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN alert_type VARCHAR(64) NULL;

-- ═══════════════════════════════════════════════════════════════
-- Fase 2: Nova tabela activity_events
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE activity_events (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  cow_id       INT NOT NULL,
  type         ENUM('RUMINATION','FEEDING','RESTING','LOW_ACTIVITY','HIGH_ACTIVITY','WALKING') NOT NULL,
  started_at   DATETIME NOT NULL,
  duration_min INT NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_ae_cow FOREIGN KEY (cow_id) REFERENCES cows(id) ON DELETE CASCADE,
  INDEX idx_ae_cow_started (cow_id, started_at)
);

-- ═══════════════════════════════════════════════════════════════
-- Fase 3: Nova tabela cow_clinical_records (prontuário)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE cow_clinical_records (
  id                          INT AUTO_INCREMENT PRIMARY KEY,
  cow_id                      INT NOT NULL,
  veterinarian_id             INT NOT NULL,
  record_date                 DATETIME NOT NULL,

  -- Avaliação geral
  clinical_status             ENUM('STABLE','MONITORING','CRITICAL','RECOVERED','REFERRED') NOT NULL,
  alert_origin                VARCHAR(64) NULL,

  -- Sinais vitais
  heart_rate                  INT NULL,
  spo2                        DECIMAL(5,2) NULL,
  body_temperature            DECIMAL(5,2) NULL,
  ambient_temperature         DECIMAL(5,2) NULL,
  activity_level              VARCHAR(32) NULL,
  posture_notes               TEXT NULL,

  -- Biometria
  weight                      DECIMAL(8,2) NULL,
  age                         DECIMAL(5,2) NULL,
  body_condition_score        DECIMAL(3,1) NULL,

  -- Alimentação
  feeding_notes               TEXT NULL,

  -- Histórico clínico
  health_history              TEXT NULL,
  current_symptoms            TEXT NULL,
  diagnosis                   TEXT NULL,
  treatment_plan              TEXT NULL,

  -- Medicamentos e procedimentos
  medications_administered    TEXT NULL,
  vaccination_history         TEXT NULL,
  surgical_procedures         TEXT NULL,
  allergy_notes               TEXT NULL,

  -- Status reprodutivo
  reproductive_status         ENUM('OPEN','INSEMINATED','PREGNANT','DRY','POSTPARTUM') NULL,
  breeding_eligibility        ENUM('ELIGIBLE','INELIGIBLE','PENDING') NULL,
  estrus_status               ENUM('IN_ESTRUS','NOT_IN_ESTRUS','UNKNOWN') NULL,
  insemination_window         VARCHAR(191) NULL,
  pregnancy_status            TINYINT(1) NULL,
  last_calving_date           DATETIME NULL,
  expected_calving_date       DATETIME NULL,

  -- Acompanhamento
  veterinary_recommendations  TEXT NULL,
  follow_up_required          TINYINT(1) NOT NULL DEFAULT 0,
  follow_up_date              DATETIME NULL,

  -- Notas
  general_notes               TEXT NULL,

  -- Metadados
  created_at                  DATETIME NOT NULL DEFAULT NOW(),
  updated_at                  DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  deleted_at                  DATETIME NULL,

  CONSTRAINT fk_ccr_cow  FOREIGN KEY (cow_id)          REFERENCES cows(id)  ON DELETE CASCADE,
  CONSTRAINT fk_ccr_vet  FOREIGN KEY (veterinarian_id) REFERENCES users(id),
  INDEX idx_ccr_cow_date (cow_id, record_date),
  INDEX idx_ccr_vet      (veterinarian_id),
  INDEX idx_ccr_deleted  (deleted_at)
);
```

---

## 3. Backend — Endpoints e Serviços

### 3.1 Dashboard (expandir `dashboardService.ts`)

**`GET /api/dashboard/overview?farmId=X`**
```typescript
// Retorno expandido
{
  totalCows: number,
  totalFarms: number,
  totalActiveCollars: number,
  unreadNotifications: number,
  herdHealthScore: number,         // 0–100, calculado (ver fórmula abaixo)
  cowsAtRisk: number,              // status ALERT + HEAT_STRESS
  cowsAtRiskPercent: number,
  cowsPostpartum: number,          // reproductiveStatus POSTPARTUM
  cowsPostpartumPercent: number,
  cowsOpen: number,                // reproductiveStatus OPEN
  cowsOpenPercent: number,
  avgTemperatureCelsius: number,   // média últimas 24h de temperature_data
  deltaHerdScore7d: number,        // variação vs. semana anterior
  deltaCowsAtRisk7d: number,
  deltaAvgTemp7d: number,
  topFarm: { id, name, cowCount } | null,
}

// Fórmula herdHealthScore (clamped 0–100):
// 100
//   - (cowsAtRisk / totalCows) * 40
//   - (cowsInHeatStress / totalCows) * 20
//   - (avgTempDeviationFromNormal * 5)   // desvio de 38.5°C
//   - (lowActivityRatio24h * 15)          // % vacas com atividade baixa
//   - (followUpRequired7d / totalCows) * 10  // prontuários com follow-up pendente
```

**`GET /api/dashboard/alerts/recent?farmId=X&limit=6`**
```typescript
{
  alerts: Array<{
    id: number,
    title: string,
    cowTag: string,
    cowName: string | null,
    severity: 'HIGH' | 'MEDIUM' | 'LOW',
    alertType: string,
    createdAt: string,
    timeAgo: string,   // "há 10 min" — formatado no backend com pt-BR
  }>
}
```

**`GET /api/dashboard/featured-cow?farmId=X`**
Retorna a vaca com maior risco (status ALERT ou HEAT_STRESS + maior temperatura recente). Inclui todos os campos da ficha + último prontuário resumido.
```typescript
{
  id, tag, name, breed, birthDate, photos,
  status, lactationNumber, lastCalvingDate, reproductiveStatus, sire, collarId,
  lastClinicalRecord: {
    id, recordDate, clinicalStatus, diagnosis, followUpDate
  } | null,
  ageYears: number,  // calculado
  daysInMilk: number // calculado: hoje - lastCalvingDate
}
```

**`GET /api/dashboard/cow/:id/vitals`**
```typescript
{
  cowId: number,
  temperature: {
    current: number,
    history7d: Array<{ date: string, avg: number, min: number, max: number }>,
    feverThreshold: 39.5,
    minThreshold: 37.5,
  },
  heartRate: {
    current: number,
    status: 'NORMAL' | 'HIGH' | 'LOW',
    history7d: Array<{ date: string, avg: number }>,
  },
  riskScore: {
    value: number,
    label: 'Risco baixo' | 'Risco médio' | 'Risco alto',
    factors: {
      temperature: 'NORMAL' | 'WARNING' | 'ALERT',
      heartRate:   'NORMAL' | 'WARNING' | 'ALERT',
      activity:    'NORMAL' | 'WARNING' | 'ALERT',
      rumination:  'NORMAL' | 'WARNING' | 'ALERT',
    }
  }
}
```

**`GET /api/dashboard/cow/:id/activity-timeline?date=YYYY-MM-DD`**
```typescript
{
  cowId: number,
  date: string,
  events: Array<{ startedAt: string, type: ActivityType, label: string, durationMin: number }>
}
```

### 3.2 Prontuário Clínico (novo `clinicalRecordService.ts`)

**Arquivo:** `backend/src/services/clinicalRecordService.ts`
**Controller:** `backend/src/controllers/clinicalRecordController.ts`
**Router:** registrar em `backend/src/routes/` e montar em `app.ts`

#### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/cattle/:cowId/clinical-records` | Listar prontuários da vaca (paginado, excluindo soft-deleted) |
| `GET` | `/api/cattle/:cowId/clinical-records/:id` | Detalhe de um prontuário |
| `POST` | `/api/cattle/:cowId/clinical-records` | Criar novo prontuário |
| `PUT` | `/api/cattle/:cowId/clinical-records/:id` | Editar prontuário |
| `DELETE` | `/api/cattle/:cowId/clinical-records/:id` | Soft delete (seta `deleted_at`) |

#### Regra de negócio ao criar/editar prontuário

Após salvar, atualizar automaticamente a ficha da vaca:
```typescript
// Em clinicalRecordService.create() e .update()
await prisma.cow.update({
  where: { id: cowId },
  data: {
    reproductiveStatus: record.reproductiveStatus ?? undefined,
    lastCalvingDate:    record.lastCalvingDate    ?? undefined,
    expectedCalvingDate: record.expectedCalvingDate ?? undefined,
    // lactationNumber: incrementar se lastCalvingDate mudou e é nova lactação
  }
})
```

#### Listagem — campos retornados (resumo)
```typescript
{
  id, recordDate, clinicalStatus, diagnosis,
  veterinarian: { id, name },
  followUpRequired, followUpDate,
  createdAt
}
```

#### Detalhe — todos os campos do modelo

#### Payload de criação/edição (campos obrigatórios na v1)
```typescript
{
  recordDate: string,         // ISO
  clinicalStatus: ClinicalStatus,
  veterinarianId: number,     // vem do token JWT — validar que é o usuário logado
  // Campos prioritários v1:
  heartRate?: number,
  spo2?: number,
  bodyTemperature?: number,
  activityLevel?: string,
  postureNotes?: string,
  currentSymptoms?: string,
  diagnosis?: string,
  treatmentPlan?: string,
  medicationsAdministered?: string,
  vaccinationHistory?: string,
  surgicalProcedures?: string,
  reproductiveStatus?: ReproductiveStatus,
  breedingEligibility?: BreedingEligibility,
  generalNotes?: string,
  // Campos opcionais (v1 — podem ser null):
  alertOrigin?, ambientTemperature?, weight?, age?, bodyConditionScore?,
  feedingNotes?, healthHistory?, allergyNotes?, estrusStatus?,
  inseminationWindow?, pregnancyStatus?, lastCalvingDate?,
  expectedCalvingDate?, veterinaryRecommendations?,
  followUpRequired?, followUpDate?,
}
```

---

## 4. Frontend — Estrutura de Arquivos

### 4.1 Dashboard (refatoração)

```
frontend/src/features/dashboard/
  components/
    DashboardTopBar.tsx          (NOVO) título, fazenda, seletor de período, filtro
    DashboardKPIRow.tsx          (NOVO) wrapper dos 5 cards
    DashboardKPICard.tsx         (REFATORAR) + ícone + sparkline + delta + tone
    CowProfilePanel.tsx          (NOVO) painel esquerdo — vaca em destaque
    CenterPanel/
      CenterPanel.tsx            (NOVO) abas: Saúde / Atividade / Reprodução / Tratamentos / Notas
      TemperatureChart.tsx       (NOVO) Recharts AreaChart 7 dias + reference lines
      HeartRateChart.tsx         (NOVO) Recharts LineChart 7 dias
      RiskScoreGauge.tsx         (NOVO) SVG gauge + 4 fatores
    AlertFeedPanel.tsx           (NOVO) feed de alertas com severidade
    ActivityTimeline.tsx         (NOVO) barra de horas + eventos classificados
    CowsPerStatusChart.tsx       (MANTER — move para aba "Distribuição")
    CowsPerFarmChart.tsx         (MANTER — move para aba "Distribuição")
  hooks/
    useDashboard.ts              (EXPANDIR)
    useCowVitals.ts              (NOVO) → GET /dashboard/cow/:id/vitals
    useActivityTimeline.ts       (NOVO) → GET /dashboard/cow/:id/activity-timeline
    useRecentAlerts.ts           (NOVO) → GET /dashboard/alerts/recent
    useFeaturedCow.ts            (NOVO) → GET /dashboard/featured-cow
  pages/
    DashboardPage.tsx            (REFATORAR — novo layout 12 colunas + tema claro)
  types/
    index.ts                     (EXPANDIR com todos os novos tipos)
```

### 4.2 Prontuário Clínico (novo feature)

```
frontend/src/features/clinicalRecord/
  components/
    ClinicalRecordList.tsx       lista paginada com resumo de cada prontuário
    ClinicalRecordCard.tsx       card de item da lista (data, vet, status, diagnóstico)
    ClinicalRecordForm.tsx       formulário completo em seções (ver §5.1)
    ClinicalRecordDetail.tsx     visualização somente-leitura de um prontuário
    SensorDataPrefill.tsx        componente auxiliar: botão "Preencher com dados do sensor"
  hooks/
    useClinicalRecords.ts        (list + get + create + update + delete)
  pages/
    ClinicalRecordListPage.tsx   rota: /cattle/:cowId/clinical-records
    ClinicalRecordDetailPage.tsx rota: /cattle/:cowId/clinical-records/:id
    ClinicalRecordFormPage.tsx   rota: /cattle/:cowId/clinical-records/new
                                       /cattle/:cowId/clinical-records/:id/edit
  services/
    clinicalRecordService.ts     (em frontend/src/services/)
  types/
    index.ts
```

### 4.3 Integração no perfil da vaca (`/cattle/:id`)

Adicionar **aba "Prontuário"** à página de perfil da vaca existente:

```
[ Visão Geral ]  [ Sensores ]  [ Prontuário ]  [ Mapa ]
```

A aba "Prontuário" renderiza o `ClinicalRecordList` filtrado pelo `cowId` e botão "Novo Prontuário".

---

## 5. Frontend — Especificações de UI

### 5.1 Formulário de Prontuário — Seções

O formulário usa seções expansíveis (accordion ou tabs) para não sobrecarregar a tela:

#### Seção 1: Identificação da Vaca (somente leitura — preenchida automaticamente)
- Tag / nome da vaca
- Raça, idade, número de lactação, dias em lactação
- Fazenda

#### Seção 2: Dados Automáticos do Sensor
- Campo "Preencher com dados do sensor" (botão): busca as leituras mais recentes via `GET /api/cattle/:id/vitals` e preenche automaticamente os campos de FC, temperatura corporal e nível de atividade
- O vet pode ajustar os valores pré-preenchidos
- SpO2, temperatura ambiente e postura são sempre manuais

| Campo UI | Campo DB | Tipo | Obrigatório v1 |
|---|---|---|---|
| Data/hora da consulta | `record_date` | datetime picker | sim |
| Status clínico | `clinical_status` | select | sim |
| Origem do alerta | `alert_origin` | select | não |
| Freq. cardíaca (bpm) | `heart_rate` | number | sim |
| SpO2 (%) | `spo2` | number decimal | sim |
| Temperatura corporal (°C) | `body_temperature` | number decimal | sim |
| Temperatura ambiente (°C) | `ambient_temperature` | number decimal | não |
| Nível de atividade | `activity_level` | select: Normal/Baixa/Alta | sim |
| Notas de postura | `posture_notes` | textarea | não |

#### Seção 3: Avaliação Clínica
| Campo UI | Campo DB | Obrigatório v1 |
|---|---|---|
| Peso (kg) | `weight` | não |
| Score corporal (1–5) | `body_condition_score` | não |
| Notas de alimentação | `feeding_notes` | não |
| Histórico de saúde | `health_history` | não |
| Sintomas atuais | `current_symptoms` | textarea | sim |
| Diagnóstico | `diagnosis` | textarea | sim |
| Plano de tratamento | `treatment_plan` | textarea | sim |

#### Seção 4: Medicamentos e Vacinas
| Campo UI | Campo DB | Obrigatório v1 |
|---|---|---|
| Medicamentos administrados | `medications_administered` | textarea (ou lista dinâmica) | sim |
| Histórico de vacinação | `vaccination_history` | textarea | sim |
| Procedimentos cirúrgicos | `surgical_procedures` | textarea | não |
| Observações de alergia | `allergy_notes` | textarea | não |

#### Seção 5: Status Reprodutivo
| Campo UI | Campo DB | Obrigatório v1 |
|---|---|---|
| Status reprodutivo | `reproductive_status` | select | sim |
| Elegibilidade de reprodução | `breeding_eligibility` | select | não |
| Status de cio | `estrus_status` | select | não |
| Janela de inseminação | `insemination_window` | text | não |
| Gestante? | `pregnancy_status` | toggle | não |
| Último parto | `last_calving_date` | date picker | não |
| Próximo parto estimado | `expected_calving_date` | date picker | não |

#### Seção 6: Acompanhamento
| Campo UI | Campo DB | Obrigatório v1 |
|---|---|---|
| Recomendações veterinárias | `veterinary_recommendations` | textarea | não |
| Requer retorno? | `follow_up_required` | toggle | não |
| Data do retorno | `follow_up_date` | date picker | condicional |
| Notas gerais | `general_notes` | textarea | não |

### 5.2 Dashboard — Layout novo

```
┌──────────────────────────────────────────────────────────────────────┐
│ DashboardTopBar: "Visão geral do rebanho" | Fazenda Vale Verde · 247 │
│                                            [20 mai–26 mai] [Filtrar] │
├──────────────────────────────────────────────────────────────────────┤
│ KPI Row (5 cards):                                                    │
│  [Saúde 84/100] [Vacas em Risco 18] [Recém-paridas 24]              │
│  [Em aberto 32] [Temp. média 38,6°C]                                 │
├───────────────┬───────────────────────────────┬───────────────────────┤
│ CowProfilePanel│        CenterPanel            │   AlertFeedPanel      │
│  col-span-3   │         col-span-6             │    col-span-3         │
│               │  [Abas: Saúde Ativ. Reprod.]   │  Feed de 6 alertas    │
│  Foto         │                               │  + card "Monitore"    │
│  Vaca 1247    │  Temp 7 dias (AreaChart)       │                       │
│  Holandesa    │  FC 7 dias  (LineChart)        │                       │
│  5,2 anos     │  Risk Score (SVG Gauge)        │                       │
│  143 DIM      │                               │                       │
│  Em aberto    │                               │                       │
│  [Ver perfil] │                               │                       │
├───────────────┴───────────────────────────────┴───────────────────────┤
│ ActivityTimeline: barra 00h–20h + 5 eventos classificados             │
└──────────────────────────────────────────────────────────────────────┘
```

**Tema:** claro, aplicado via wrapper `data-theme="light"` apenas no conteúdo do dashboard (não afeta AppShell/Sidebar que permanecem escuros).

**Cores (hardcoded como no template, não usar CSS vars dark):**
- Fundo: `#f5f1ea`
- Cards: `#ffffff`
- Borda cards: `#ece6d8`
- Texto primário: `#1a1f1c`
- Texto secundário: `#5e6b62`
- Verde principal: `#1f7a4a`
- Laranja alerta: `#d97a2c`
- Vermelho crítico: `#d7553a`

---

## 6. Fluxo Veterinário (navegação entre telas)

```
Dashboard (visão geral do rebanho)
  │
  ├─ KPI "Vacas em risco" → clica → Herd Alert (lista de vacas em ALERT/HEAT_STRESS)
  │
  ├─ AlertFeedPanel → clica em alerta → Cow Profile (/cattle/:id)
  │
  └─ CowProfilePanel → "Ver perfil completo" → Cow Profile (/cattle/:id)
                            │
                            ├─ Aba "Sensores" → gráficos de FC / temperatura / acelerômetro
                            │
                            └─ Aba "Prontuário" → ClinicalRecordList
                                                      │
                                                      ├─ "Novo Prontuário" → ClinicalRecordFormPage
                                                      │     → preenche seções
                                                      │     → salva → volta para lista
                                                      │
                                                      └─ Clica em prontuário → ClinicalRecordDetailPage
                                                                                  └─ "Editar" → ClinicalRecordFormPage (modo edição)
```

---

## 7. Ordem de Execução por Desenvolvedor

### Fase 1 — Database + Backend (Renato / Backend)
**Responsável:** Renato (rpgouveia)

- [ ] 1. Executar migration unificada (campos em `cows`, `notifications`, novas tabelas `activity_events`, `cow_clinical_records`)
- [ ] 2. Atualizar `schema.prisma` com todos os modelos e enums novos
- [ ] 3. Rodar `npx prisma migrate dev --name clinical_and_dashboard`
- [ ] 4. Regenerar client: `npx prisma generate`
- [ ] 5. Atualizar seed com dados de exemplo:
  - Vacas com `lactationNumber`, `lastCalvingDate`, `reproductiveStatus`, `sire`
  - Notificações com `severity` e `alertType`
  - 2–3 `ActivityEvent` por vaca
  - 2–3 `CowClinicalRecord` por vaca (com campos prioritários preenchidos)
- [ ] 6. Criar `clinicalRecordService.ts` com CRUD completo + regra de sync com `Cow`
- [ ] 7. Criar `clinicalRecordController.ts`
- [ ] 8. Registrar rotas: `GET/POST /api/cattle/:cowId/clinical-records`, `GET/PUT/DELETE /api/cattle/:cowId/clinical-records/:id`
- [ ] 9. Expandir `dashboardService.ts` com os 5 endpoints do dashboard
- [ ] 10. Corrigir bug de segurança em `unreadNotifications` (filtrar por `userId` do JWT)

### Fase 2 — Dashboard Frontend (Ian / Frontend)
**Responsável:** Ian (DevIanBraz)

- [ ] 11. Criar tipos TypeScript em `frontend/src/features/dashboard/types/index.ts`
- [ ] 12. Expandir `frontend/src/services/dashboardService.ts` com os novos endpoints
- [ ] 13. Criar hooks `useFeaturedCow`, `useCowVitals`, `useActivityTimeline`, `useRecentAlerts`
- [ ] 14. Refatorar `DashboardKPICard` com ícone SVG + sparkline + delta + tone
- [ ] 15. Criar `DashboardTopBar`
- [ ] 16. Criar `CowProfilePanel`
- [ ] 17. Criar `TemperatureChart` e `HeartRateChart` (Recharts AreaChart/LineChart)
- [ ] 18. Criar `RiskScoreGauge` (SVG nativo)
- [ ] 19. Criar `CenterPanel` com abas
- [ ] 20. Criar `AlertFeedPanel`
- [ ] 21. Criar `ActivityTimeline` (com `isSimulated` flag enquanto MQTT não popula `ActivityEvent`)
- [ ] 22. Refatorar `DashboardPage.tsx` com novo layout + `data-theme="light"` wrapper

### Fase 3 — Prontuário Clínico Frontend (Angelo / Frontend)
**Responsável:** Angelo (PJorgeto)

- [ ] 23. Criar tipos em `frontend/src/features/clinicalRecord/types/index.ts`
- [ ] 24. Criar `frontend/src/services/clinicalRecordService.ts`
- [ ] 25. Criar hook `useClinicalRecords`
- [ ] 26. Criar `ClinicalRecordList` e `ClinicalRecordCard`
- [ ] 27. Criar `ClinicalRecordDetail` (visualização somente leitura)
- [ ] 28. Criar `ClinicalRecordForm` com todas as 6 seções (usar accordion do shadcn/ui ou seções simples)
- [ ] 29. Criar `SensorDataPrefill` (botão que pré-preenche com dados mais recentes do sensor)
- [ ] 30. Criar as 3 páginas: List, Detail, Form (new e edit)
- [ ] 31. Registrar rotas em `AppRoutes.tsx`:
  - `/cattle/:cowId/clinical-records`
  - `/cattle/:cowId/clinical-records/new`
  - `/cattle/:cowId/clinical-records/:id`
  - `/cattle/:cowId/clinical-records/:id/edit`
- [ ] 32. Adicionar aba "Prontuário" na página de perfil da vaca (`/cattle/:id`)

### Fase 4 — Polimento e Integração (todos)
- [ ] 33. Sidebar: adicionar itens Saúde, Relatórios, Tratamentos, Reprodução (rotas placeholder "Em breve")
- [ ] 34. Sidebar: badge de alertas não lidos via `unreadNotifications`
- [ ] 35. Integração do worker MQTT para popular `ActivityEvent` automaticamente
- [ ] 36. Testes de integração backend (clinical records + dashboard endpoints)
- [ ] 37. Responsividade mobile: dashboard em < 768px deve empilhar os 3 painéis verticalmente

---

## 8. Pontos de Decisão / Perguntas em Aberto

| # | Questão | Decisão sugerida | Responsável |
|---|---|---|---|
| 1 | Temperatura: exibir em °C ou °F? | °C para o Brasil; adicionar `Farm.temperatureUnit` futuramente | JCFS |
| 2 | `medications_administered` como texto livre ou lista estruturada? | Texto livre na v1 (campo `TEXT`); evoluir para tabela `treatments` na v2 | Produto |
| 3 | Quem pode criar prontuário? Apenas perfil MANAGER? | Qualquer `MANAGER` ou `ADMIN`; VIEWER só leitura | Angelo (RBAC) |
| 4 | `age` no prontuário: calcular no backend (hoje - birthDate) ou deixar o vet preencher? | Calcular no backend e enviar pré-preenchido; vet confirma | Renato |
| 5 | SpO2: o collar RF10A mede SpO2? | Não — campo apenas para medição manual pelo vet | Hardware team |
| 6 | Soft delete: prontuários deletados devem ser visíveis para ADMIN? | Sim — endpoint separado `GET /clinical-records/deleted` na v2 | Produto |
| 7 | `activity_events` populado pelo MQTT ou por job separado? | Job de classificação que roda a cada N minutos sobre `accelerometer_data` | Renato |

---

## 9. Compatibilidade e Riscos

- **Zero breaking changes na v1:** todos os campos novos em `Cow` são `NULL`-able; `Notification.severity` tem default `MEDIUM`. O sistema continua funcionando sem dados de prontuário.
- **AppShell/Sidebar inalterados:** o tema claro do dashboard é localizado via `data-theme="light"` no wrapper do `main`. O dark mode do resto do app não é afetado.
- **`CowsPerStatusChart` e `CowsPerFarmChart`:** mantidos — migrar para aba "Distribuição do Rebanho" dentro do `CenterPanel`.
- **Formulário grande:** o `ClinicalRecordForm` tem muitos campos. Usar validação progressiva — só os campos da seção 1 são obrigatórios para salvar; o resto pode ficar em branco e ser preenchido depois (edição).
