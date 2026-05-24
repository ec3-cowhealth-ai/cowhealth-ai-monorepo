# Plano: Implementacao das Heuristicas Completas (ANEXO VII)

Data planejada: 2026-05-24

---

## Contexto

O ANEXO VII define 8 heuristicas de diagnostico. Hoje foram implementadas apenas 2 (CALVING e HEAT_STRESS) no `mqttIngestService.ts`. As 6 restantes estao documentadas mas sem codigo.

---

## Etapa 1 — Banco de dados (Prisma)

**Arquivo:** `backend/prisma/schema.prisma`

Adicionar os 6 novos valores ao enum `CowStatus`:

```
BRD          # Doenca Respiratoria Bovina
MASTITIS     # Mastite Sistemica
KETOSIS      # Cetose
LAMENESS     # Claudicacao
SHOCK        # Desidratacao / Choque
AT_RISK      # Escala de severidade (score >= 3)
```

Apos editar o schema, rodar:
```bash
npx prisma migrate dev --name add_health_statuses
```

---

## Etapa 2 — Backend: expandir `analyzeHealth()`

**Arquivo:** `backend/src/services/mqttIngestService.ts`

Adicionar 6 novos blocos de analise dentro de `analyzeHealth()`, em ordem de severidade (mais grave primeiro):

### 2.1 Desidratacao / Choque (SHOCK) — prioridade maxima
```
SpO2 < 88 AND HR > 120 AND temp_extremidades < 35.0 AND atividade = "letargica"
Letargia: < 10 movimentos/hora (contagem de leituras acelerometro com variacao > 0.1g)
```
Observacao: sensor SpO2 (MAX30102 tambem mede SpO2) — verificar se o campo ja existe no schema ou adicionar `spo2` em `HeartRateData`.

### 2.2 Doenca Respiratoria Bovina (BRD)
```
avg_temp_30 > 39.3 AND avg_hr_30 > 90 AND SpO2 < 92 AND atividade = "baixa"
Atividade baixa: 10-30 movimentos/hora
```

### 2.3 Mastite Sistemica (MASTITIS)
```
temp > 39.5 AND hr > 110 AND eixo_z < 0.3g por mais de 2 horas (postura anormal)
```

### 2.4 Cetose (KETOSIS)
```
desvio_padrao_hr_30 > 12 AND atividade = "baixa" AND temp < 38.0
```

### 2.5 Claudicacao (LAMENESS)
```
assimetria_accel_x > limiar AND hr > 90
Assimetria: diferenca entre picos alternados de accel_x (padrao de marcha)
Nota: requer calibracao por animal — usar limiar global 0.4g inicialmente
```

### 2.6 Escala de Severidade / Risco Elevado (AT_RISK)
```
score = 0
score += 1 se avg_temp > 39.3
score += 1 se avg_hr > 90
score += 1 se SpO2 < 92
score += 1 se atividade = "baixa"
Se score >= 3 -> AT_RISK
```

---

## Etapa 3 — Backend: atualizar `STATUS_LABELS`

**Arquivo:** `backend/src/services/mqttIngestService.ts`

Adicionar os novos labels para as notificacoes:

```typescript
const STATUS_LABELS: Record<string, string> = {
    CALVING:    "parto iminente",
    HEAT_STRESS: "estresse termico",
    BRD:        "doenca respiratoria bovina",
    MASTITIS:   "mastite sistemica",
    KETOSIS:    "cetose",
    LAMENESS:   "claudicacao",
    SHOCK:      "desidratacao ou choque",
    AT_RISK:    "risco elevado de infeccao",
};
```

---

## Etapa 4 — Backend: campo SpO2

**Arquivo:** `backend/prisma/schema.prisma`

Verificar se `HeartRateData` ja tem campo `spo2`. Se nao tiver, adicionar:
```
spo2  Float?   # saturacao de oxigenio (%)
```

**Arquivo:** `backend/src/services/mqttIngestService.ts`

Atualizar `persistSensorData()` para salvar `spo2` se presente no payload:
```typescript
// payload.sensors.max30102 pode ter { heart_rate, spo2 }
```

**Arquivo:** `/Users/jafte/PyCharmProject/cowhealth-iot-simulator` (IoT repo)

Atualizar o simulador para gerar `spo2` no payload do MAX30102 (range normal: 95-100%).

---

## Etapa 5 — Frontend: badges e labels

**Arquivo:** `frontend/src/types/cows.ts`

Adicionar os 6 novos valores ao tipo `CowStatus`.

**Arquivo:** `frontend/src/features/cows/components/CowStatusBadge.tsx`

Adicionar cores e labels para cada novo status:
- `BRD` -> badge laranja ("Resp. Bovina")
- `MASTITIS` -> badge vermelho escuro ("Mastite")
- `KETOSIS` -> badge roxo ("Cetose")
- `LAMENESS` -> badge amarelo ("Claudicacao")
- `SHOCK` -> badge vermelho critico ("Choque")
- `AT_RISK` -> badge laranja escuro ("Risco Elevado")

**Arquivo:** `frontend/src/features/dashboard/components/CowsPerStatusChart.tsx`

Adicionar as novas fatias/barras ao grafico de status.

---

## Etapa 6 — Testes manuais

Testar cada heuristica via `POST /mqtt/ingest` com payloads fabricados:

| Condicao | temp | hr | accel | spo2 |
|---|---|---|---|---|
| BRD | 39.5 | 95 | baixa | 90 |
| MASTITIS | 40.0 | 115 | eixo_z < 0.3 x 2h | - |
| KETOSIS | 37.5 | variavel | baixa | - |
| LAMENESS | - | 95 | assimetrico | - |
| SHOCK | 34.0 | 125 | letargica | 86 |
| AT_RISK | 39.5 | 95 | baixa | 90 |

---

## Ordem de execucao recomendada

1. Schema Prisma (enum + campo spo2) + migrate
2. `persistSensorData` — salvar spo2
3. `analyzeHealth` — adicionar os 6 blocos
4. `STATUS_LABELS` — adicionar novos labels
5. Frontend: `CowStatus` type + `CowStatusBadge`
6. Frontend: `CowsPerStatusChart`
7. IoT simulator: adicionar spo2 ao payload
8. Testes manuais por heuristica

---

## Arquivos a modificar (resumo)

| Arquivo | Mudanca |
|---|---|
| `backend/prisma/schema.prisma` | enum CowStatus + HeartRateData.spo2 |
| `backend/src/services/mqttIngestService.ts` | persistSensorData + analyzeHealth + STATUS_LABELS |
| `frontend/src/types/cows.ts` | CowStatus enum |
| `frontend/src/features/cows/components/CowStatusBadge.tsx` | novos badges |
| `frontend/src/features/dashboard/components/CowsPerStatusChart.tsx` | novos status no grafico |
| `/Users/jafte/PyCharmProject/cowhealth-iot-simulator` | spo2 no payload |
