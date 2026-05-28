# Arquitetura de Dados e Alertas — CowHealth IoT

## 1. Simulador IoT (`/PyCharmProject/cowhealth-iot-simulator`)

### Dados Gerados por Vaca

Cada vaca simulada envia periodicamente (padrão: a cada 15 segundos para batches):

```json
{
  "device_id": "COL-001",
  "datetime": "2026-05-28T14:30:45Z",
  "location": {
    "lat": -15.7801,
    "lng": -47.9292,
    "accuracy_m": 5
  },
  "sensors": {
    "max30102": {
      "heart_rate": 65  // bpm
    },
    "mlx": {
      "object_temp": 38.5  // °C
    },
    "mpu": {
      "acc": [0.1, -0.05, 9.8],    // [X, Y, Z] m/s²
      "gyro": [2.5, -1.2, 0.8]     // [X, Y, Z] °/s
    }
  }
}
```

### Simulação de Status

**Distribuição Inicial:**
- 80% HEALTHY
- 12% HEAT_STRESS
- 5% CALVING
- 3% ALERT

**Matriz de Transição** (probabilidades por ciclo):
- HEALTHY → HEAT_STRESS (0.5%), CALVING (0.2%), ALERT (0.3%)
- HEAT_STRESS → HEALTHY (2%)
- CALVING → HEALTHY (automático após 3h)
- ALERT → HEALTHY (5%)

**Modificações de Sensores por Status:**

| Status | Heart Rate | Temperatura | Acelerador | Giroscópio |
|--------|-----------|-------------|-----------|-----------|
| HEALTHY | +0 bpm (σ=5) | +0°C (σ=0.20) | Normal (σ=0.1) | Normal (σ=5) |
| HEAT_STRESS | +40 bpm (σ=8) | +0.8°C (σ=0.30) | Alto (σ=0.9) | Alto (σ=20) |
| CALVING | +30 bpm (σ=6) | -0.3°C (σ=0.15) | Baixo (σ=0.3) | Alto (σ=20) |
| ALERT | +20 bpm (σ=10) | +0.4°C (σ=0.40) | Normal | Normal |

---

## 2. Fluxo de Dados: Simulador → Worker → Backend

```
[Simulador Python]
       ↓ (MQTT)
  [Broker MQTT]
       ↓
[Worker Python]
       ↓ (HTTP POST /mqtt/ingest)
[Backend Node.js/TypeScript]
       ↓
[Banco de Dados PostgreSQL]
```

### Etapa 1: Simulador publica via MQTT
- **Tópico**: `cows/{device_id}`
- **QoS**: 1 (at least once)
- **Interval**: 15 segundos para lotes (batch_size customizável)

### Etapa 2: Worker consome e valida
- Valida campos obrigatórios: `device_id`, `datetime`, `sensors`
- Verifica subchaves: `max30102`, `mlx`, `mpu`
- Envia para API com Bearer token

### Etapa 3: Backend processa
- Localiza o Collar pelo `device_id`
- Localiza a Cow vinculada ao Collar
- Persiste dados de sensores em 4 tabelas separadas

---

## 3. Persistência de Dados no Banco

### Tabelas Criadas para Cada Payload

**1. `HeartRateData`**
```sql
{
  cowId: number,
  bpm: number,
  measuredAt: datetime
}
```

**2. `TemperatureData`**
```sql
{
  cowId: number,
  celsius: number,
  measuredAt: datetime
}
```

**3. `AccelerometerData`**
```sql
{
  cowId: number,
  accelX: number,
  accelY: number,
  accelZ: number,
  gyroX: number,
  gyroY: number,
  gyroZ: number,
  measuredAt: datetime
}
```

**4. `Cow` (atualizado com GPS)**
```sql
UPDATE Cow SET
  lastLat = location.lat,
  lastLng = location.lng
WHERE id = cowId
```

---

## 4. Classificação de Saúde e Geração de Alertas

### Etapa 1: Análise de Saúde (em cada ingest)

O backend coleta dados recentes:
- **últimas 1h**: accelZ (postura)
- **últimas 30 medições**: Heart Rate
- **últimas 12h**: Temperatura
- **últimos 30min**: accelX e accelY (movimento)
- **últimas 30 medições**: Temperatura (para média)

### Etapa 2: Construir Snapshot

```typescript
CowHealthSnapshot {
  posturalChanges: number,    // mudanças de accelZ > 0.5 em 1h
  avgHeartRate: number,       // média das últimas 30 medições
  tempDelta: number,          // última - primeira em 12h
  avgTemperature: number,     // média das últimas 30 medições
  restlessPeaks: number       // picos de movimento em 30min
}
```

### Etapa 3: Classificação

**CALVING** (Parto Iminente):
```
posturalChanges > 10 AND
avgHeartRate > 90 AND
tempDelta < 0  (queda de temperatura)
```

**HEAT_STRESS** (Estresse Térmico):
```
avgTemperature > 39.0°C AND
avgHeartRate > 100 bpm AND
restlessPeaks > 15
```

**ALERT** (Status atual - se não for CALVING/HEAT_STRESS):
- Mantém status anterior ou classifica como HEALTHY

### Etapa 4: Criar Notificações

Se o status calculado **diferente do status atual** da vaca:

1. **Atualizar vaca**:
```sql
UPDATE Cow SET status = 'CALVING' WHERE id = cowId
```

2. **Criar notificações** para todos os usuários com role que tem permissão `ViewAny Notification`:
```sql
INSERT INTO Notification (userId, cowId, title, message)
SELECT user.id, cowId,
  'Alerta de Saúde Animal',
  'A vaca TAG apresenta indícios de parto iminente. Verificação imediata necessária.'
FROM User
WHERE active = true AND role_has_permission('ViewAny Notification')
```

---

## 5. Como os Alertas Aparecem no Dashboard

### Fluxo no Frontend

**DashboardAlertFeed** (`/src/features/dashboard/components/DashboardAlertFeed.tsx`):

```typescript
1. Hook `useUnreadNotifications()` (linha 5, DashboardPage)
   ↓ Chama API GET `/notifications?unread=true`

2. Backend retorna Notifications recentes
   ↓

3. Mapeia e exibe no card (máx 6 últimos)
   - Icon baseado no tipo (temp, heart, activity, clock)
   - Severity badge (Alto/Médio/Baixo)
   - Horário relativo ("há 5 min")
   - Clicável para abrir detalhe da vaca
```

### Componentes Envolvidos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `DashboardAlertFeed.tsx` | Exibe notificações em card |
| `useNotifications.ts` | Hook para buscar notificações |
| `mqttIngestService.ts` | Cria notificações ao detectar status |
| `cowHealthAnalyzer.ts` | Classifica saúde com base em sensores |

---

## 6. Exemplo Completo: Detecção de Parto Iminente

```
Tempo: T0
├─ [MQTT] Simulador publica: accelZ variações altas, HR=95, Temp=37.8°C
├─ [Worker] Consome e envia para /mqtt/ingest
├─ [Backend] Processa:
│  ├─ Salva: HeartRateData(95 bpm)
│  ├─ Salva: TemperatureData(37.8°C)
│  ├─ Salva: AccelerometerData(accelZ com variações)
│  └─ Analisa:
│     posturalChanges=15 ✓
│     avgHeartRate=92 ✓
│     tempDelta=-0.2 ✓
│     → Status: CALVING (mudou de HEALTHY)
│
├─ [DB Update] Cow status = CALVING
│
├─ [Notifications] INSERT INTO Notification
│  └─ userId=1,2,3 (admins)
│  └─ message="A vaca Aurora apresenta indícios de parto iminente..."
│
└─ [Frontend] DashboardAlertFeed refetch
   └─ Exibe alerta com badge "ALTO"
```

---

## 7. Endpoints Relevantes

### Backend

| Endpoint | Método | Entrada | Saída |
|----------|--------|---------|-------|
| `/mqtt/ingest` | POST | MqttPayload (JSON) | `{ received: true, cowId, collarId }` |
| `/notifications` | GET | `?unread=true` | Notification[] |
| `/dashboard/overview` | GET | `?farmId=X` | KPIs |

### Frontend Hooks

| Hook | Query Key | Intervalo |
|------|-----------|-----------|
| `useUnreadNotifications()` | `["notifications"]` | Refetch on mount |
| `useDashboardOverview()` | `["dashboard", "overview"]` | Automático |
| `useCowsPerStatus()` | `["dashboard", "cows-per-status"]` | Automático |

---

## 8. Testes Manuais

### Ativar estado CALVING simulado:
```bash
# No simulador, forçar status na próxima iteração
→ Vaca entra em CALVING por 3 horas
→ Temperatura cai em simulação
→ Heart rate sobe
→ accelZ aumenta em variações
→ Backend detecta em ~5-10 segundos
→ Notificação aparece no dashboard em <1 segundo (React Query refetch)
```

### Verificar dados no banco:
```sql
SELECT * FROM HeartRateData WHERE cowId = 1 ORDER BY measuredAt DESC LIMIT 5;
SELECT * FROM TemperatureData WHERE cowId = 1 ORDER BY measuredAt DESC LIMIT 5;
SELECT * FROM AccelerometerData WHERE cowId = 1 ORDER BY measuredAt DESC LIMIT 5;
SELECT status FROM Cow WHERE id = 1;
SELECT * FROM Notification WHERE cowId = 1 ORDER BY createdAt DESC LIMIT 5;
```
