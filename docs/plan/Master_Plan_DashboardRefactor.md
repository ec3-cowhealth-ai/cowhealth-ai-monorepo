# Plano Mestre — Refatoração do Dashboard
**Referência:** `templates/HerdHealthInsight/src/routes/dashboard.tsx`
**Alvo:** `frontend/src/features/dashboard/` + `backend/src/services/dashboardService.ts` + `backend/prisma/schema.prisma`

---

## 1. Diagnóstico: Estado Atual vs. Template

### Dashboard atual (produção)
- Tema **escuro** (app-shell CSS vars dark)
- 6 KPI cards simples: Total de Vacas, Com Colar, Em Alerta, Fazendas Ativas, Colares Ativos, Alertas Não Lidos
- 2 gráficos Recharts: pizza de vacas por status + barras de vacas por fazenda
- Sem painel de vaca individual
- Sem feed de alertas com severidade
- Sem linha do tempo de atividade
- Sem score de risco
- Sem temperatura agregada do rebanho

### Template (alvo visual)
- Tema **claro** (cream `#f5f1ea`, cards brancos, sidebar verde-escuro)
- Layout: `Sidebar fixa 256px` + `main` com scroll
- **TopBar**: título + nome da fazenda + qtd de cabeças + seletor de período + botão Filtrar
- **KPI Row** (5 cards): Saúde do rebanho (/100), Vacas em risco, Vacas recém-paridas, Vacas em aberto, Temperatura média — cada card com ícone colorido, sub-label percentual, delta 7 dias e sparkline
- **Grid 3 colunas** (col-span 3 / 6 / 3):
  - Esquerda: **CowProfile** — foto, nome, raça/idade, DIM, status reprodutivo, último parto, touro, brinco
  - Centro: **CenterPanel** — abas (Saúde / Atividade / Reprodução / Tratamentos / Notas), gráfico temperatura 7 dias (linhas + gradiente + limites febre/min), gráfico freq. cardíaca, gauge de risco score com 4 fatores
  - Direita: **AlertFeed** — lista de 6 alertas com ícone/título/vaca/tempo/badge de severidade, card promocional "Monitore em qualquer lugar"
- **ActivityTimeline**: barra de horas + 5 eventos classificados (Ruminação, Alimentação, Atividade baixa)

---

## 2. Gaps de Banco de Dados

### 2.1 Campos faltantes no modelo `Cow`

| Campo necessário | Situação atual | Ação |
|---|---|---|
| `lactationNumber` | Ausente | Adicionar `Int?` ao modelo `Cow` |
| `lastCalvingDate` | Ausente (só `birthDate`) | Adicionar `DateTime? @map("last_calving_date")` |
| `daysInMilk` | Ausente | Campo **calculado** no serviço (hoje - lastCalvingDate), não persistido |
| `reproductiveStatus` | Ausente | Adicionar enum `ReproductiveStatus` + campo `reproductiveStatus` |
| `sire` | Ausente | Adicionar `String?` (nome do touro/sêmen) |
| `riskScore` | Ausente | Campo **calculado** via algoritmo no serviço, sem persistência (pode evoluir para cache) |

### 2.2 Novo enum `ReproductiveStatus`

```prisma
enum ReproductiveStatus {
  OPEN          // Em aberto
  INSEMINATED   // Inseminada
  PREGNANT      // Gestante
  DRY           // Seca
  POSTPARTUM    // Recém-parida (< 30 dias pós-parto)
}
```

### 2.3 Campo `severity` em `Notification`

O modelo `Notification` não tem severidade — o feed de alertas do template exibe `Alto / Médio / Baixo`.

```prisma
enum AlertSeverity {
  HIGH    // Alto
  MEDIUM  // Médio
  LOW     // Baixo
}

model Notification {
  // ... campos existentes ...
  severity  AlertSeverity @default(MEDIUM)
  alertType String?       @map("alert_type") // "temperature" | "heart_rate" | "activity" | "scheduled"
}
```

### 2.4 Classificação de atividade (`ActivityEvent`)

O AccelerometerData tem dados brutos (accelX/Y/Z, gyroX/Y/Z) mas sem classificação de comportamento. O template exibe eventos classificados (Ruminação, Alimentação, Atividade baixa). Proposta: nova tabela de eventos classificados, populada pelo serviço de processamento MQTT ou por job de inferência.

```prisma
enum ActivityType {
  RUMINATION     // Ruminação
  FEEDING        // Alimentação
  RESTING        // Descanso
  LOW_ACTIVITY   // Atividade baixa (alerta)
  HIGH_ACTIVITY  // Alta atividade
  WALKING        // Caminhada
}

model ActivityEvent {
  id          Int          @id @default(autoincrement())
  cowId       Int          @map("cow_id")
  type        ActivityType
  startedAt   DateTime     @map("started_at")
  durationMin Int          @map("duration_min") // duração em minutos
  createdAt   DateTime     @default(now()) @map("created_at")

  cow Cow @relation(fields: [cowId], references: [id], onDelete: Cascade)

  @@index([cowId, startedAt])
  @@map("activity_events")
}
```

Adicionar relação em `Cow`:
```prisma
activityEvents ActivityEvent[]
```

### 2.5 Score de saúde do rebanho

Calculado no backend, não persistido inicialmente. Fórmula sugerida:

```
herdHealthScore = 100
  - (cowsInAlert / totalCows) * 40
  - (cowsInHeatStress / totalCows) * 30
  - (avgTempDeviation * 5)   // desvio médio da temperatura normal (38,5°C)
  - (lowActivityRatio * 15)  // % de vacas com atividade baixa nas últimas 24h
  - (highRiskCows / totalCows) * 15
```

Resultado clampado em [0, 100], arredondado.

---

## 3. Alterações no Backend

### 3.1 Migration Prisma

Arquivo: `backend/prisma/migrations/YYYYMMDD_dashboard_fields/migration.sql`

```sql
-- Enum ReproductiveStatus
ALTER TABLE cows
  ADD COLUMN lactation_number   INT          NULL,
  ADD COLUMN last_calving_date  DATETIME     NULL,
  ADD COLUMN reproductive_status ENUM('OPEN','INSEMINATED','PREGNANT','DRY','POSTPARTUM') NULL DEFAULT 'OPEN',
  ADD COLUMN sire               VARCHAR(191) NULL;

-- Severity em notifications
ALTER TABLE notifications
  ADD COLUMN severity   ENUM('HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN alert_type VARCHAR(64) NULL;

-- Nova tabela activity_events
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
```

### 3.2 Novo endpoint: `GET /dashboard/overview`

Expandir `dashboardService.getDashboardOverview()` para retornar:

```typescript
{
  // Existentes
  totalCows: number,
  totalFarms: number,
  totalActiveCollars: number,
  unreadNotifications: number,

  // Novos KPIs
  herdHealthScore: number,          // 0-100 calculado
  cowsAtRisk: number,               // ALERT + HEAT_STRESS
  cowsAtRiskPercent: number,        // % do rebanho
  cowsPostpartum: number,           // reproductiveStatus === POSTPARTUM
  cowsPostpartumPercent: number,
  cowsOpen: number,                 // reproductiveStatus === OPEN
  cowsOpenPercent: number,
  avgTemperatureCelsius: number,    // média das últimas leituras de temperatura (últimas 24h)
  avgTemperatureFahrenheit: number, // conversão (celsius * 9/5 + 32)

  // Delta 7 dias (comparação com semana anterior)
  deltaHerdScore7d: number,
  deltaCowsAtRisk7d: number,
  deltaPostpartum7d: number,
  deltaOpen7d: number,
  deltaAvgTemp7d: number,

  // Fazenda de contexto
  topFarm: { id, name, cowCount } | null,
}
```

### 3.3 Novo endpoint: `GET /dashboard/alerts/recent`

```typescript
// dashboardService.getRecentAlerts(farmId?, limit = 6)
// Retorna as últimas `limit` notificações com vaca associada

{
  alerts: Array<{
    id: number,
    title: string,
    cowTag: string,        // vaca.tag
    cowName: string | null,
    severity: 'HIGH' | 'MEDIUM' | 'LOW',
    alertType: string,     // 'temperature' | 'heart_rate' | 'activity' | 'scheduled'
    createdAt: string,     // ISO timestamp
    timeAgo: string,       // formatado no backend: "há 10 min"
  }>
}
```

### 3.4 Novo endpoint: `GET /dashboard/cow/:id/vitals`

Para o CenterPanel da vaca em destaque:

```typescript
{
  cowId: number,
  temperature: {
    current: number,      // celsius
    history7d: Array<{ date: string, value: number }>,
    feverThreshold: 39.5,
    minThreshold: 37.5,
  },
  heartRate: {
    current: number,       // bpm
    status: 'NORMAL' | 'HIGH' | 'LOW',
    history7d: Array<{ date: string, value: number }>,
  },
  riskScore: {
    value: number,         // 0-100
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

### 3.5 Novo endpoint: `GET /dashboard/cow/:id/activity-timeline`

```typescript
{
  cowId: number,
  date: string,
  events: Array<{
    startedAt: string,
    type: ActivityType,
    label: string,          // "Ruminação", "Alimentação", etc.
    durationMin: number,
  }>
}
```

### 3.6 Rota de vaca em destaque: `GET /dashboard/featured-cow`

Retorna a vaca com **maior risco** na fazenda selecionada para popular o CowProfile. Inclui todos os campos do modelo expandido.

---

## 4. Alterações no Frontend

### 4.1 Tema do Dashboard

O dashboard autenticado **mantém o tema escuro** do app-shell como padrão de sistema. O template usa tema claro para fins de apresentação. A decisão de implementação é:

**Opção A (recomendada):** Criar um wrapper `data-theme="light"` apenas para a rota `/dashboard`, sobrepondo as CSS vars para o conjunto cream/white do template. O `app-shell` mantém dark; o conteúdo interno da dashboard usa light.

**Opção B:** Adicionar toggle de tema por rota no `FarmContext` ou via `localStorage`.

O plano adota **Opção A** — menos disruptivo.

### 4.2 Estrutura de arquivos nova

```
frontend/src/features/dashboard/
  components/
    DashboardTopBar.tsx          -- título, fazenda, data range, filtro
    DashboardKPIRow.tsx          -- linha dos 5 KPI cards
    DashboardKPICard.tsx         -- card individual (REFATORAR com ícone + sparkline + delta)
    CowProfilePanel.tsx          -- painel esquerdo vaca em destaque (NOVO)
    CenterPanel/
      CenterPanel.tsx            -- container com abas
      TemperatureChart.tsx       -- gráfico linha 7 dias (NOVO)
      HeartRateChart.tsx         -- gráfico linha 7 dias (NOVO)
      RiskScoreGauge.tsx         -- gauge SVG + 4 fatores (NOVO)
    AlertFeedPanel.tsx           -- feed de alertas com severidade (NOVO)
    ActivityTimeline.tsx         -- linha do tempo de atividade (NOVO)
    CowsPerStatusChart.tsx       -- manter (pode ser aba futura)
    CowsPerFarmChart.tsx         -- manter (pode ser aba futura)
  hooks/
    useDashboard.ts              -- expandir com novos queries
    useCowVitals.ts              -- NOVO
    useActivityTimeline.ts       -- NOVO
    useRecentAlerts.ts           -- NOVO
  pages/
    DashboardPage.tsx            -- REFATORAR layout completo
  services/
    dashboardService.ts          -- expandir com novos endpoints (em frontend/src/services/)
  types/
    index.ts                     -- expandir com novos tipos
```

### 4.3 DashboardPage.tsx — novo layout

```tsx
<div data-theme="light" className="min-h-screen bg-[#f5f1ea] text-[#1a1f1c] font-sans">
  {/* Sidebar já está no AppShell — usar apenas o conteúdo */}
  <main className="flex-1 min-w-0 p-6 lg:p-8 space-y-6">
    <DashboardTopBar />
    <DashboardKPIRow />
    <div className="grid grid-cols-12 gap-6">
      <CowProfilePanel className="col-span-12 lg:col-span-3" />
      <CenterPanel className="col-span-12 lg:col-span-6" />
      <AlertFeedPanel className="col-span-12 lg:col-span-3" />
    </div>
    <ActivityTimeline />
  </main>
</div>
```

### 4.4 DashboardKPICard refatorado

Novos props:
```typescript
interface DashboardKPICardProps {
  label: string
  value: string
  unit?: string
  sub?: string          // "7,3% do rebanho"
  delta: string         // "↑ 3 nos últimos 7 dias"
  deltaPositive: boolean
  icon: 'shield' | 'heart' | 'cow' | 'circle' | 'temp'
  tone: 'good' | 'warn'
  sparklineVariant: 'a' | 'b'
}
```

### 4.5 Sidebar — novos itens de menu

A sidebar atual tem: Início, Rebanho, Mapa, Alertas, Configurações.

O template mostra: Visão geral, Rebanho, Alertas (badge), Saúde, Relatórios, Tratamentos, Reprodução, Inventário, Configurações.

**Plano:** Adicionar ao sidebar as rotas que ainda não existem como rotas-alvo (podem navegar para páginas em branco `Em breve`):
- Saúde (`/health`) — futura tela de análise de saúde
- Relatórios (`/reports`)
- Tratamentos (`/treatments`)
- Reprodução (`/reproduction`)

O **badge de alertas** (contador de não lidos) já existe via `unreadNotifications`.

### 4.6 CowProfilePanel

- Busca `GET /dashboard/featured-cow?farmId=X` via `useFeaturedCow(farmId)`
- Foto: usa `cow.photos[0]` se existir, senão placeholder
- Campos exibidos: Nome/tag, Raça + Idade + Lact. número, Dias em lactação (DIM), Status reprodutivo, Último parto, Touro, Brinco
- Botão "Ver perfil completo" → navega para `/cattle/:id`

### 4.7 TemperatureChart

- Recharts `AreaChart` com gradiente verde
- 2 `ReferenceLine` horizontais: limite febre (39,5°C / 103,1°F) em vermelho, limite mínimo (37,5°C / 99,5°F) em azul
- Eixo X: últimos 7 dias (datas formatadas pt-BR)
- Eixo Y: faixa 36–41°C
- Tooltip customizado com valor + data

### 4.8 RiskScoreGauge

- SVG circle stroke-dasharray idêntico ao template
- Valor 0–100 com label ("Risco baixo" / "Risco médio" / "Risco alto")
- 4 linhas de fatores: Temperatura, Freq. cardíaca, Atividade, Ruminação
- Cada fator com ícone check (verde) ou warn (laranja)

### 4.9 AlertFeedPanel

- Hook `useRecentAlerts(farmId)` → `GET /dashboard/alerts/recent`
- Badge de contagem no header
- Cada item: ícone colorido por severidade, título, tag da vaca, "há X min", badge `Alto/Médio/Baixo`
- "Ver tudo" → navega para `/alerts`

### 4.10 ActivityTimeline

- Hook `useActivityTimeline(cowId, date)` → `GET /dashboard/cow/:id/activity-timeline`
- Barra de horas (00h–20h)
- Eventos com ícone, horário, label, duração
- Enquanto `ActivityEvent` não for populado pelo MQTT, exibir dados simulados com flag `isSimulated`

---

## 5. Ordem de Execução Recomendada

### Fase 1 — DB + Backend (sem breaking changes)
1. Adicionar campos ao modelo `Cow`: `lactationNumber`, `lastCalvingDate`, `reproductiveStatus`, `sire`
2. Adicionar `severity` e `alertType` à `Notification`
3. Criar `ActivityEvent` e enum `ActivityType`
4. Criar migration e rodar `prisma migrate dev`
5. Atualizar seed com dados de exemplo para os novos campos
6. Expandir `dashboardService` com os novos cálculos e endpoints
7. Registrar rotas no `dashboardController` e `router`

### Fase 2 — Frontend: KPIs e layout
8. Refatorar `DashboardKPICard` com ícone + sparkline + delta
9. Criar `DashboardTopBar` com fazenda e período
10. Refatorar `DashboardPage` com layout 12-colunas e tema claro
11. Conectar novos KPIs ao endpoint expandido

### Fase 3 — Frontend: painéis
12. Criar `CowProfilePanel` conectado ao `/dashboard/featured-cow`
13. Criar `TemperatureChart` e `HeartRateChart` com Recharts
14. Criar `RiskScoreGauge` com SVG nativo
15. Criar `CenterPanel` com abas
16. Criar `AlertFeedPanel` conectado ao `/dashboard/alerts/recent`

### Fase 4 — Atividade e polimento
17. Criar `ActivityTimeline` (inicialmente com dados simulados)
18. Integrar classificação de atividade no worker MQTT para popular `ActivityEvent`
19. Adicionar sidebar items novos (rotas placeholder)
20. Testes E2E e ajustes de responsividade mobile

---

## 6. Notas de Compatibilidade

- O `AppShell` e `Sidebar` existentes **não são tocados** — o tema claro é aplicado via `data-theme="light"` no wrapper do `main` content do dashboard.
- Os componentes `CowsPerStatusChart` e `CowsPerFarmChart` são **mantidos** — podem virar abas na CenterPanel ou em uma seção "Distribuição do rebanho" abaixo do grid principal.
- A temperatura no backend está em **Celsius**. O template usa Fahrenheit (`101,2°F`). Incluir conversão no serviço ou deixar configurável por fazenda (campo futuro `Farm.temperatureUnit`).
- O campo `cowsWithCollar` atual (que conta vacas com `collarId != null`) vira informação secundária — não é KPI principal no template, mas pode aparecer no CowProfile como indicador.
