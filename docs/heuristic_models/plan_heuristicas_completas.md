# Plan: Implementation of Complete Heuristics (ANNEX VII)

Planned date: 2026-05-24

---

## Context

ANNEX VII defines 8 diagnostic heuristics. Today, only 2 (CALVING and HEAT_STRESS) were implemented in `mqttIngestService.ts`. The remaining 6 are documented but without code.

---

## Step 1 — Database (Prisma)

**File:** `backend/prisma/schema.prisma`

Add the 6 new values to the `CowStatus` enum:

```
BRD          # Bovine Respiratory Disease
MASTITIS     # Systemic Mastitis
KETOSIS      # Ketosis
LAMENESS     # Lameness
SHOCK        # Dehydration / Shock
AT_RISK      # Severity scale (score >= 3)
```

After editing the schema, run:
```bash
npx prisma migrate dev --name add_health_statuses
```

---

## Step 2 — Backend: Expand `analyzeHealth()`

**File:** `backend/src/services/mqttIngestService.ts`

Add 6 new analysis blocks inside `analyzeHealth()`, in order of severity (most serious first):

### 2.1 Dehydration / Shock (SHOCK) — highest priority
```
SpO2 < 88 AND HR > 120 AND extremity_temp < 35.0 AND activity = "lethargic"
Lethargy: < 10 movements/hour (count of accelerometer readings with variation > 0.1g)
```
Note: SpO2 sensor (MAX30102 also measures SpO2) — check if the field already exists in the schema or add `spo2` to `HeartRateData`.

### 2.2 Bovine Respiratory Disease (BRD)
```
avg_temp_30 > 39.3 AND avg_hr_30 > 90 AND SpO2 < 92 AND activity = "low"
Low activity: 10-30 movements/hour
```

### 2.3 Systemic Mastitis (MASTITIS)
```
temp > 39.5 AND hr > 110 AND z_axis < 0.3g for more than 2 hours (abnormal posture)
```

### 2.4 Ketosis (KETOSIS)
```
hr_std_dev_30 > 12 AND activity = "low" AND temp < 38.0
```

### 2.5 Lameness (LAMENESS)
```
accel_x_asymmetry > threshold AND hr > 90
Asymmetry: difference between alternating peaks of accel_x (gait pattern)
Note: requires individual animal calibration — use 0.4g global threshold initially
```

### 2.6 Severity Scale / High Risk (AT_RISK)
```
score = 0
score += 1 if avg_temp > 39.3
score += 1 if avg_hr > 90
score += 1 if SpO2 < 92
score += 1 if activity = "low"
If score >= 3 -> AT_RISK
```

---

## Step 3 — Backend: Update `STATUS_LABELS`

**File:** `backend/src/services/mqttIngestService.ts`

Add new labels for notifications:

```typescript
const STATUS_LABELS: Record<string, string> = {
    CALVING:    "imminent calving",
    HEAT_STRESS: "heat stress",
    BRD:        "bovine respiratory disease",
    MASTITIS:   "systemic mastitis",
    KETOSIS:    "ketosis",
    LAMENESS:   "lameness",
    SHOCK:      "dehydration or shock",
    AT_RISK:    "high risk of infection",
};
```

---

## Step 4 — Backend: SpO2 field

**File:** `backend/prisma/schema.prisma`

Check if `HeartRateData` already has an `spo2` field. If not, add:
```
spo2  Float?   # oxygen saturation (%)
```

**File:** `backend/src/services/mqttIngestService.ts`

Update `persistSensorData()` to save `spo2` if present in payload:
```typescript
// payload.sensors.max30102 may have { heart_rate, spo2 }
```

**File:** `/Users/jafte/PyCharmProject/cowhealth-iot-simulator` (IoT repo)

Update simulator to generate `spo2` in MAX30102 payload (normal range: 95-100%).

---

## Step 5 — Frontend: Badges and labels

**File:** `frontend/src/types/cows.ts`

Add the 6 new values to the `CowStatus` type.

**File:** `frontend/src/features/cows/components/CowStatusBadge.tsx`

Add colors and labels for each new status:
- `BRD` -> orange badge ("Bov. Resp.")
- `MASTITIS` -> dark red badge ("Mastitis")
- `KETOSIS` -> purple badge ("Ketosis")
- `LAMENESS` -> yellow badge ("Lameness")
- `SHOCK` -> critical red badge ("Shock")
- `AT_RISK` -> dark orange badge ("High Risk")

**File:** `frontend/src/features/dashboard/components/CowsPerStatusChart.tsx`

Add new slices/bars to the status chart.

---

## Step 6 — Manual tests

Test each heuristic via `POST /mqtt/ingest` with fabricated payloads:

| Condition | temp | hr | accel | spo2 |
|---|---|---|---|---|
| BRD | 39.5 | 95 | low | 90 |
| MASTITIS | 40.0 | 115 | z_axis < 0.3 x 2h | - |
| KETOSIS | 37.5 | variable | low | - |
| LAMENESS | - | 95 | asymmetric | - |
| SHOCK | 34.0 | 125 | lethargic | 86 |
| AT_RISK | 39.5 | 95 | low | 90 |

---

## Recommended execution order

1. Prisma Schema (enum + spo2 field) + migrate
2. `persistSensorData` — save spo2
3. `analyzeHealth` — add the 6 blocks
4. `STATUS_LABELS` — add new labels
5. Frontend: `CowStatus` type + `CowStatusBadge`
6. Frontend: `CowsPerStatusChart`
7. IoT simulator: add spo2 to payload
8. Manual tests per heuristic

---

## Files to modify (summary)

| File | Change |
|---|---|
| `backend/prisma/schema.prisma` | CowStatus enum + HeartRateData.spo2 |
| `backend/src/services/mqttIngestService.ts` | persistSensorData + analyzeHealth + STATUS_LABELS |
| `frontend/src/types/cows.ts` | CowStatus enum |
| `frontend/src/features/cows/components/CowStatusBadge.tsx` | new badges |
| `frontend/src/features/dashboard/components/CowsPerStatusChart.tsx` | new status in chart |
| `/Users/jafte/PyCharmProject/cowhealth-iot-simulator` | spo2 in payload |
