# CowHealth Frontend — Guia de Integração com o Backend

> **Contexto:** O simulador IoT está ativo publicando dados reais de 160 vacas via MQTT -> EMQX Cloud -> Worker -> MySQL. Os dados chegam no banco mas **nao aparecem nas telas** porque os tipos TypeScript do frontend estao errados em relacao ao que a API retorna. Este documento lista cada problema com precisao cirurgica e diz exatamente o que mudar.

---

## 1. Estrutura do Banco de Dados (MySQL)

Tabela: `cow`
| Coluna      | Tipo           | Notas                                    |
|-------------|----------------|------------------------------------------|
| id          | INT            | PK                                       |
| tag         | VARCHAR        | ex: `BR-0001`                            |
| name        | VARCHAR        | ex: `Mimosa`                             |
| breed       | VARCHAR        | ex: `Nelore`                             |
| birth_date  | DATE (null)    | campo no DB e na API: `birthDate`        |
| weight      | DECIMAL (null) |                                          |
| status      | ENUM           | `HEALTHY` `HEAT_STRESS` `ALERT` `CALVING`|
| farm_id     | INT FK         |                                          |
| collar_id   | INT FK (null)  |                                          |
| photos      | JSON           | array de filenames, ex: `["cow-123.jpg"]`|
| created_at  | DATETIME       |                                          |
| updated_at  | DATETIME       |                                          |

Tabela: `collar`
| Coluna         | Tipo   | Notas                                      |
|----------------|--------|--------------------------------------------|
| id             | INT    | PK                                         |
| name           | VARCHAR| ex: `collar-001` — **nao `identifier`**    |
| status         | ENUM   | `ACTIVE` `INACTIVE` `MAINTENANCE` `BATTERY`|
| data_frequency | ENUM   | `HIGHER` `DEFAULT` `LOWER`                 |
| created_at     | DATETIME|                                            |
| updated_at     | DATETIME|                                            |

> **IMPORTANTE:** Nao existe coluna `battery_percentage` nem `last_sync` na tabela `collar`. Esses campos nao existem no backend.

Tabela: `heart_rate_data`
| Coluna      | Tipo     | Notas                        |
|-------------|----------|------------------------------|
| id          | INT      | PK                           |
| cow_id      | INT FK   |                              |
| bpm         | DECIMAL  | batimentos por minuto        |
| measured_at | DATETIME | timestamp da medicao         |

Tabela: `temperature_data`
| Coluna      | Tipo     | Notas                   |
|-------------|----------|-------------------------|
| id          | INT      | PK                      |
| cow_id      | INT FK   |                         |
| celsius     | DECIMAL  | temperatura corporal    |
| measured_at | DATETIME |                         |

Tabela: `accelerometer_data`
| Coluna      | Tipo     | Notas       |
|-------------|----------|-------------|
| id          | INT      | PK          |
| cow_id      | INT FK   |             |
| accel_x     | DECIMAL  |             |
| accel_y     | DECIMAL  |             |
| accel_z     | DECIMAL  |             |
| gyro_x      | DECIMAL  |             |
| gyro_y      | DECIMAL  |             |
| gyro_z      | DECIMAL  |             |
| measured_at | DATETIME |             |

Tabela: `notification`
| Coluna     | Tipo     | Notas                              |
|------------|----------|------------------------------------|
| id         | INT      | PK                                 |
| type       | VARCHAR  | ex: `HEAT_STRESS`, `ALERT`         |
| title      | VARCHAR  |                                    |
| message    | TEXT     |                                    |
| cow_id     | INT FK   |                                    |
| read_at    | DATETIME | NULL = nao lida                    |
| created_at | DATETIME |                                    |

---

## 2. O Que Cada Endpoint Realmente Retorna

### `GET /cows` (lista)
```json
[
  {
    "id": 1,
    "tag": "BR-0001",
    "name": "Mimosa",
    "breed": "Nelore",
    "weight": 395.5,
    "status": "HEALTHY",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "farm": { "id": 1, "name": "Fazenda 1" },
    "collar": { "id": 1, "name": "collar-001", "status": "ACTIVE" }
  }
]
```

### `GET /cows/:id` (detalhe)
```json
{
  "id": 1,
  "tag": "BR-0001",
  "name": "Mimosa",
  "breed": "Nelore",
  "birthDate": "2016-06-15T00:00:00.000Z",
  "weight": 395.5,
  "photos": [],
  "status": "HEALTHY",
  "createdAt": "...",
  "updatedAt": "...",
  "farm": { "id": 1, "name": "Fazenda 1", "city": "...", "state": "..." },
  "collar": { "id": 1, "name": "collar-001", "status": "ACTIVE", "dataFrequency": "DEFAULT" }
}
```

### `GET /cows/:id/heart-rate/daily` e `GET /cows/:id/temperature/daily`
```json
[
  { "date": "17/05", "average": 68.4 },
  { "date": "18/05", "average": 71.2 },
  { "date": "19/05", "average": 69.8 }
]
```
> **`date` e `average` — NAO `timestamp` e `value`**. O campo `date` ja vem formatado como `"dd/MM"` (pt-BR), pronto para exibir no eixo X do grafico.

### `GET /collars` (lista)
```json
[
  {
    "id": 1,
    "name": "collar-001",
    "status": "ACTIVE",
    "dataFrequency": "DEFAULT",
    "createdAt": "...",
    "cow": { "id": 1, "tag": "BR-0001", "name": "Mimosa", "status": "HEALTHY" }
  }
]
```

### `GET /collars/:id` (detalhe)
```json
{
  "id": 1,
  "name": "collar-001",
  "status": "ACTIVE",
  "dataFrequency": "DEFAULT",
  "createdAt": "...",
  "updatedAt": "...",
  "cow": {
    "id": 1,
    "tag": "BR-0001",
    "name": "Mimosa",
    "breed": "Nelore",
    "status": "HEALTHY",
    "farm": { "id": 1, "name": "Fazenda 1" }
  }
}
```

### `GET /dashboard/overview`
```json
{
  "totalCows": 160,
  "cowsWithCollar": 160,
  "cowsInAlert": 16,
  "totalFarms": 5,
  "totalActiveCollars": 160,
  "unreadNotifications": 12,
  "topFarm": { "id": 1, "name": "Fazenda 1", "cowCount": 32 }
}
```

### `GET /dashboard/cows-per-status`
```json
[
  { "status": "HEALTHY", "count": 110 },
  { "status": "HEAT_STRESS", "count": 20 },
  { "status": "ALERT", "count": 20 },
  { "status": "CALVING", "count": 10 }
]
```

### `GET /dashboard/cows-per-farm`
```json
[
  { "id": 1, "name": "Fazenda 1", "cowCount": 32 },
  { "id": 2, "name": "Fazenda 2", "cowCount": 32 }
]
```

### `GET /notifications`
```json
[
  {
    "id": "1",
    "type": "HEAT_STRESS",
    "title": "Estresse Termico Detectado",
    "message": "Vaca BR-0023 com temperatura elevada.",
    "read": false,
    "cowId": "23",
    "createdAt": "..."
  }
]
```
> O campo da API e `read_at` no DB (null = nao lida). O backend mapeia para `read: boolean` no response.

---

## 3. Erros nos Tipos TypeScript — O Que Corrigir

### Arquivo: `src/types/cows.ts`

**Problemas encontrados:**

| Campo atual (ERRADO)      | Campo correto (BACKEND)               | Notas                                      |
|---------------------------|---------------------------------------|--------------------------------------------|
| `dateOfBirth: string`     | `birthDate: string`                   | Nome do campo na API e no DB               |
| `farmId: string`          | `farm: { id: number; name: string }`  | Backend retorna objeto aninhado, nunca ID plano |
| `collarId?: string`       | `collar?: { id: number; name: string; status: string }` | Idem |
| `avatar?: string`         | `photos: string[]`                    | Renomear; so vem no endpoint de detalhe    |
| `HeartRateDailyPoint { timestamp, value }` | `{ date: string; average: number }` | Ver secao 2 acima |
| `TemperatureDailyPoint { timestamp, value }` | `{ date: string; average: number }` | Idem |

**Como deve ficar `src/types/cows.ts`:**
```typescript
export interface Cow {
  id: number;
  tag: string;
  name: string;
  status: CowStatus;
  breed: string;
  weight: number;
  birthDate?: string;       // era dateOfBirth
  photos?: string[];        // era avatar?: string
  farm: { id: number; name: string; city?: string; state?: string };   // era farmId: string
  collar?: { id: number; name: string; status: string; dataFrequency?: string }; // era collarId?: string
  createdAt: string;
  updatedAt?: string;
}

// Para a lista, o backend NAO retorna birthDate nem photos
export type CowListItem = Omit<Cow, 'birthDate' | 'photos' | 'updatedAt'>;

export interface SensorDailyPoint {
  date: string;    // formato "dd/MM" ex: "17/05"
  average: number;
}

// Manter retrocompat — aliases
export type HeartRateDailyPoint = SensorDailyPoint;
export type TemperatureDailyPoint = SensorDailyPoint;

export interface CreateCowInput {
  tag: string;
  name: string;
  breed: string;
  weight: number;
  birthDate: string;   // era dateOfBirth
  farmId: number;      // era string
  collarId?: number;   // era string
}
```

---

### Arquivo: `src/types/collars.ts`

**Problemas encontrados:**

| Campo atual (ERRADO)      | Campo correto (BACKEND)               | Notas                                       |
|---------------------------|---------------------------------------|---------------------------------------------|
| `identifier: string`      | `name: string`                        | Campo no DB e na API e `name`               |
| `batteryPercentage: number` | (remover)                           | NAO existe no DB nem na API                 |
| `lastSync: string`        | (remover)                             | NAO existe no DB nem na API                 |
| `cowId?: string`          | `cow?: { id: number; tag: string; name: string; status: string }` | Backend retorna objeto aninhado |

**Como deve ficar `src/types/collars.ts`:**
```typescript
export interface Collar {
  id: number;
  name: string;           // era identifier
  status: CollarStatus;
  dataFrequency: DataFrequency;
  createdAt: string;
  updatedAt?: string;
  // batteryPercentage NAO EXISTE — remover
  // lastSync NAO EXISTE — remover
  cow?: {                  // era cowId?: string
    id: number;
    tag: string;
    name: string;
    breed?: string;
    status: string;
    farm?: { id: number; name: string };
  };
}

export interface CreateCollarInput {
  name: string;            // era identifier
  status?: CollarStatus;
  dataFrequency?: DataFrequency;
}

export type UpdateCollarInput = Partial<Omit<CreateCollarInput, 'name'>>;
```

---

## 4. Erros nos Services — O Que Corrigir

### Arquivo: `src/services/cowsService.ts`

Os metodos `getCowHeartRateDaily` e `getCowTemperatureDaily` provavelmente tem o tipo de retorno errado. Corrija para:

```typescript
// Tipo correto do retorno do backend
export interface SensorDailyPoint {
  date: string;
  average: number;
}

// No servico:
getHeartRateDaily: async (cowId: string): Promise<SensorDailyPoint[]> => {
  const response = await api.get<SensorDailyPoint[]>(`/cows/${cowId}/heart-rate/daily`);
  return response.data;
},

getTemperatureDaily: async (cowId: string): Promise<SensorDailyPoint[]> => {
  const response = await api.get<SensorDailyPoint[]>(`/cows/${cowId}/temperature/daily`);
  return response.data;
},
```

### Arquivo: `src/services/collarsService.ts`

Qualquer referencia a `identifier` deve virar `name`:
```typescript
// Era:
create: async (data: CreateCollarInput) => { ... }
// Onde CreateCollarInput.identifier

// Deve ser:
// CreateCollarInput.name (ver tipos acima)
```

---

## 5. Erros nas Paginas — O Que Corrigir em Cada Arquivo

### `src/features/cows/pages/CowDetailPage.tsx`

**Problema 1: Queries desnecessarias de farm e collar (linhas 22-32)**

O backend ja retorna `farm` e `collar` aninhados dentro do objeto `cow`. As queries separadas para `farmsService.get(cow.farmId)` e `collarsService.get(cow.collarId)` devem ser removidas.

```tsx
// REMOVER estas queries:
const { data: farm } = useQuery({
  queryKey: ["farms", cow?.farmId],
  queryFn: () => (cow?.farmId ? farmsService.get(cow.farmId) : null),
  enabled: !!cow?.farmId,
});

const { data: collar } = useQuery({
  queryKey: ["collars", cow?.collarId],
  queryFn: () => (cow?.collarId ? collarsService.get(cow.collarId) : null),
  enabled: !!cow?.collarId,
});

// SUBSTITUIR por:
const farm = cow?.farm;     // ja vem no objeto cow
const collar = cow?.collar; // ja vem no objeto cow
```

**Problema 2: `cow.farmId` e `cow.collarId` nao existem**

Onde o codigo usa `cow.farmId` e `cow.collarId`, usar:
- `cow.farm.id` e `cow.farm.name`
- `cow.collar?.id` e `cow.collar?.name`

**Problema 3: `cow.dateOfBirth` nao existe**

```tsx
// Era:
{cow.dateOfBirth && (
  <p>{new Date(cow.dateOfBirth).toLocaleDateString("pt-BR")}</p>
)}

// Deve ser:
{cow.birthDate && (
  <p>{new Date(cow.birthDate).toLocaleDateString("pt-BR")}</p>
)}
```

**Problema 4: `collar.identifier` nao existe**

```tsx
// Era:
<p>{collar.identifier}</p>

// Deve ser:
<p>{collar.name}</p>
```

**Problema 5: `SensorChart` recebe dados no formato errado**

O `SensorChart` espera `Array<{ timestamp: string; value: number }>` mas o backend retorna `Array<{ date: string; average: number }>`.

**Opcao A (recomendada): Corrigir o SensorChart para aceitar o formato real:**

Arquivo: `src/features/cows/components/SensorChart.tsx`

```tsx
// Mudar a interface:
interface SensorChartProps {
  data: Array<{ date: string; average: number }>; // era { timestamp, value }
  title: string;
  unit: string;
  minThreshold?: number;
  maxThreshold?: number;
}

// Mudar o calculo de avgValue, minValue, maxValue:
const avgValue = data.length > 0
  ? (data.reduce((sum, p) => sum + p.average, 0) / data.length).toFixed(1) // era p.value
  : "N/A";

const minValue = data.length > 0
  ? Math.min(...data.map((p) => p.average)).toFixed(1) // era p.value
  : "N/A";

const maxValue = data.length > 0
  ? Math.max(...data.map((p) => p.average)).toFixed(1) // era p.value
  : "N/A";

// Mudar o chartData:
const chartData = data.map((p) => ({
  label: p.date,        // ja vem formatado como "dd/MM" — nao precisa de new Date()
  value: p.average,     // era p.value (de p.timestamp)
}));
```

**Opcao B (alternativa): Transformar antes de passar pro componente em CowDetailPage:**

```tsx
const heartRateChartData = (heartRate ?? []).map((p) => ({
  timestamp: p.date,
  value: p.average,
}));

// E no SensorChart:
<SensorChart data={heartRateChartData} ... />
```

A Opcao A e mais limpa pois elimina a conversao desnecessaria.

---

### `src/features/collars/pages/CollarDetailPage.tsx`

**Problema 1: `collar.identifier` nao existe**

```tsx
// Era (linha 57 e 64):
<AppBar title={collar.identifier} />
<h3>{collar.identifier}</h3>

// Deve ser:
<AppBar title={collar.name} />
<h3>{collar.name}</h3>
```

**Problema 2: `collar.batteryPercentage` nao existe — remover o bloco inteiro**

```tsx
// REMOVER este bloco (linhas 72-80):
<div>
  <p>Bateria</p>
  <p>{collar.batteryPercentage}%</p>
</div>
```

**Problema 3: `collar.lastSync` nao existe — remover o bloco inteiro**

```tsx
// REMOVER este bloco (linhas 81-98 aprox):
<div>
  <p>Ultima Sincronizacao</p>
  <p>{new Date(collar.lastSync).toLocaleString()}</p>
</div>
```

**Problema 4: busca de vaca vinculada esta errada**

```tsx
// Era (lento — busca TODAS as vacas so pra achar uma):
const { data: cows } = useQuery({
  queryKey: ["cows"],
  queryFn: () => cowsService.list(),
  enabled: !!id,
});
const linkedCow = cows?.find((c) => c.collarId === id); // collarId nao existe

// Deve ser — o collar ja vem com a vaca aninhada:
const linkedCow = collar?.cow; // ja esta no objeto collar retornado por getCollarById
```

Remover completamente o `useQuery` de cows e usar `collar.cow` diretamente.

---

### `src/features/dashboard/pages/DashboardPage.tsx`

**Problema: KPIs faltando**

O endpoint `/dashboard/overview` retorna `totalActiveCollars` e `unreadNotifications` mas a pagina nao os exibe. Adicionar dois KPI cards:

```tsx
<DashboardKPICard title="Colares Ativos" value={overview?.totalActiveCollars ?? 0} />
<DashboardKPICard title="Alertas Nao Lidos" value={overview?.unreadNotifications ?? 0} />
```

**Problema: `DashboardOverviewChart` recebe dados de status (categorico) mas e um LineChart**

O componente `DashboardOverviewChart` e um `LineChart` (serie temporal) mas esta recebendo `statusData` que e uma distribuicao categorica. Isso gera um grafico sem sentido.

**Solucao:** O backend nao tem endpoint de serie temporal historica por enquanto. Substituir `DashboardOverviewChart` por mais um `CowsPerStatusChart` ou simplesmente remover o componente ate que o backend implemente o endpoint `/dashboard/history`.

```tsx
// Remover ou comentar por ora:
// <DashboardOverviewChart data={statusData} title="..." period="week" />
```

---

### `src/hooks/useNotifications.ts`

**Problema: `useMarkNotificationAsRead` e `useMarkAllAsRead` nao invalidam o cache**

Os hooks retornam um objeto fake com `mutate` em vez de usar `useMutation`. Isso significa que apos marcar como lida, o React Query nao refaz o fetch e a UI nao atualiza.

```typescript
// Era:
export const useMarkNotificationAsRead = () => {
  return {
    mutate: async (notificationId: string) => {
      await api.patch(`/notifications/${notificationId}/read`);
    },
  };
};

// Deve ser:
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      api.patch(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
```

Apos essa correcao, atualizar `NotificationsPage.tsx` pois `useMutation` retorna `{ mutate }` da mesma forma — a chamada `markAsRead(notification.id)` continua funcionando.

---

## 6. Ordem de Implementacao Recomendada

Implemente nesta sequencia para ter o menor risco de quebrar coisas:

1. **`src/types/cows.ts`** — corrigir todos os tipos (nao afeta runtime, so TypeScript)
2. **`src/types/collars.ts`** — idem
3. **`src/features/cows/components/SensorChart.tsx`** — corrigir interface e uso de `date`/`average`
4. **`src/features/cows/pages/CowDetailPage.tsx`** — remover queries redundantes, corrigir campos
5. **`src/features/collars/pages/CollarDetailPage.tsx`** — remover campos inexistentes, usar `collar.cow`
6. **`src/hooks/useNotifications.ts`** — converter para `useMutation` com invalidacao
7. **`src/features/dashboard/pages/DashboardPage.tsx`** — adicionar KPIs, remover/substituir `DashboardOverviewChart`

---

## 7. Verificacao Rapida — Checklist

Apos cada correcao, verifique:

- [ ] `/home` — cards de status mostram contagens reais (nao 0)
- [ ] `/cows` — lista com 160 vacas aparece (BR-0001 a BR-0160)
- [ ] `/cows/:id` — detalhe mostra fazenda e colar sem erro de runtime
- [ ] `/cows/:id` — graficos de frequencia cardiaca e temperatura mostram dados dos ultimos 7 dias
- [ ] `/collars` — lista com 160 colares aparece (collar-001 a collar-160)
- [ ] `/collars/:id` — detalhe sem erro (sem `collar.identifier`, sem `collar.batteryPercentage`)
- [ ] `/dashboard` — KPIs com numeros reais, graficos de status e fazendas renderizados
- [ ] `/notifications` — lista de notificacoes; marcar como lida atualiza a badge sem recarregar pagina

---

## 8. Dados Disponiveis em Tempo Real

O simulador publica a cada 30 segundos para as 160 vacas:

| Dado              | Tabela             | Campo       | Faixa Normal          |
|-------------------|--------------------|-------------|-----------------------|
| Frequencia cardiaca | `heart_rate_data` | `bpm`       | 40-80 bpm (saudavel)  |
| Temperatura       | `temperature_data` | `celsius`   | 38.0-39.5 °C          |
| Acelerometro      | `accelerometer_data` | `accel_x/y/z` | movimento ativo    |
| Giroscopio        | `accelerometer_data` | `gyro_x/y/z`  | orientacao         |

Os endpoints `/daily` agregam a media por dia dos ultimos 7 dias e ja retornam `date` formatado como `"dd/MM"` — use diretamente no eixo X dos graficos sem transformacao adicional.
