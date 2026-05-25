# Plano: Gráficos de Sinais Vitais na CowDetailPage

## Contexto

A `CowDetailPage` exibe dados de saúde da vaca com apenas dois gráficos (Temperatura e Freq. Cardíaca) em formato de **abas dentro de um único card**. No desktop isso é ruim: só um gráfico visível por vez, e o `LineChart` tem altura fixa de 140px. O banco tem 3 tabelas de sensor (HeartRateData, TemperatureData, AccelerometerData) mas só 2 endpoints diários existem. SpO2 não está no schema ainda (dependência futura do plano de heurísticas).

**Objetivo**: mostrar todos os sinais disponíveis simultaneamente em grid responsivo — side-by-side no desktop, coluna única no mobile — com gráficos maiores.

---

## Sinais disponíveis

| Sinal | Fonte no banco | Endpoint diário | Status |
|---|---|---|---|
| Temperatura | `TemperatureData.celsius` | `GET /cows/:id/temperature/daily` | ✅ Pronto |
| Freq. Cardíaca | `HeartRateData.bpm` | `GET /cows/:id/heart-rate/daily` | ✅ Pronto |
| Atividade (acelerômetro) | `AccelerometerData` (magnitude √X²+Y²+Z²) | `GET /cows/:id/accelerometer/daily` | ✅ Implementado |
| SpO2 | — | — | 🔮 Futuro (fora do escopo) |

---

## Arquivos modificados

### Backend
- `backend/src/services/cowsService.ts` — nova função `getCowAccelerometerDaily`
- `backend/src/controllers/cowsController.ts` — novo controller `listAccelerometerDaily`
- `backend/src/routes/cowsRoutes.ts` — nova rota `GET /:id/accelerometer/daily`

### Frontend
- `frontend/src/types/cows.ts` — alias `AccelerometerDailyPoint`
- `frontend/src/services/cowsService.ts` — método `getAccelerometerDaily`
- `frontend/src/features/cows/hooks/useCows.ts` — hook `useCowAccelerometerDaily`
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — substituir tabs por grid

---

## Implementação detalhada

### 1. Backend — service: `getCowAccelerometerDaily`

**`backend/src/services/cowsService.ts`**

Calcula magnitude por leitura, agrupa por dia:

```typescript
export const getCowAccelerometerDaily = async (cowId: number) => {
  const cow = await prisma.cow.findUnique({ where: { id: cowId } });
  if (!cow) throw new Error("Vaca não encontrada.");

  const records = await prisma.accelerometerData.findMany({
    where: { cowId, measuredAt: { gte: sevenDaysAgo() } },
    select: { accelX: true, accelY: true, accelZ: true, measuredAt: true },
    orderBy: { measuredAt: "asc" },
  });

  const dailyGroups = new Map<string, number[]>();
  for (const r of records) {
    const label = r.measuredAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const mag = Math.sqrt(r.accelX ** 2 + r.accelY ** 2 + r.accelZ ** 2);
    if (!dailyGroups.has(label)) dailyGroups.set(label, []);
    dailyGroups.get(label)!.push(mag);
  }

  return Array.from(dailyGroups.entries()).map(([date, values]) => ({
    date,
    average: parseFloat((values.reduce((s, v) => s + v, 0) / values.length).toFixed(3)),
  }));
};
```

### 2. Backend — controller

**`backend/src/controllers/cowsController.ts`**

```typescript
export const listAccelerometerDaily = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getCowAccelerometerDaily(Number(request.params.id)), 200, 404);
};
```

### 3. Backend — rota

**`backend/src/routes/cowsRoutes.ts`**

```typescript
router.get("/:id/accelerometer/daily", requireAuth, requirePermission("View Cow"), listAccelerometerDaily);
```

### 4. Frontend — tipo

**`frontend/src/types/cows.ts`**

```typescript
export type AccelerometerDailyPoint = SensorDailyPoint;
```

### 5. Frontend — service

**`frontend/src/services/cowsService.ts`**

```typescript
getAccelerometerDaily: async (cowId: string, days: number = 7) => {
  const response = await api.get<AccelerometerDailyPoint[]>(`/cows/${cowId}/accelerometer/daily`, {
    params: { days },
  });
  return response.data;
},
```

### 6. Frontend — hook

**`frontend/src/features/cows/hooks/useCows.ts`**

```typescript
export const useCowAccelerometerDaily = (cowId: string, days: number = 7) => {
  return useQuery({
    queryKey: ["cows", cowId, "accelerometer-daily", days],
    queryFn: () => cowsService.getAccelerometerDaily(cowId, days),
    refetchInterval: 30000,
  });
};
```

### 7. Frontend — CowDetailPage: tabs → grid

**`frontend/src/features/cows/pages/CowDetailPage.tsx`**

- Adicionar import: `Activity` de `lucide-react`
- Adicionar import: `useCowAccelerometerDaily` do hook
- Remover estado `sensorTab` (useState removido)
- Adicionar chamada: `const { data: accelerometer } = useCowAccelerometerDaily(id || "");`
- Substituir bloco de abas com grid responsivo

Novo layout de grid:

```tsx
{(temperature?.length || heartRate?.length || accelerometer?.length) ? (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>
    {temperature?.length ? (
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Thermometer size={14} color="var(--warning)" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Temperatura</span>
        </div>
        <LineChart data={temperature} h={200} color="var(--warning)" unit="°C"
          thresholds={[{ v: 39.5, c: "var(--danger)" }, { v: 38.0, c: "var(--info)" }]} />
      </div>
    ) : null}

    {heartRate?.length ? (
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Heart size={14} color="var(--danger)" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Freq. Cardíaca</span>
        </div>
        <LineChart data={heartRate} h={200} color="var(--danger)" unit=" bpm"
          thresholds={[{ v: 120, c: "var(--danger)" }, { v: 40, c: "var(--info)" }]} />
      </div>
    ) : null}

    {accelerometer?.length ? (
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Activity size={14} color="var(--accent)" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Atividade</span>
        </div>
        <LineChart data={accelerometer} h={200} color="var(--accent)" unit=" g" />
      </div>
    ) : null}
  </div>
) : null}
```

---

## Comportamento visual esperado

- **Desktop (>600px)**: 2–3 colunas side-by-side (auto-fit minmax 280px)
- **Mobile (<560px)**: 1 coluna, cards empilhados, altura 200px cada
- Cards só aparecem se houver dados (sem dados = sem card)
- Sem abas — todos os sinais visíveis simultaneamente

---

## Verificação

1. Backend: `GET /cows/:id/accelerometer/daily` retorna `[{date, average}]` ✅
2. Abrir `/cows/:id` em desktop — 3 gráficos side-by-side, altura 200px ✅
3. Redimensionar para mobile — 1 coluna ✅
4. Vaca sem dados de acelerômetro — card de Atividade não aparece (sem erro) ✅

---

## Fora do escopo (planejado para futuro)

- **Múltiplas granularidades** (horária/semanal/mensal/semestral/anual): documentado separadamente em `/Users/jafte/.claude/projects/-Users-jafte-WebstormProjects-cowhealth-ai-monorepo/memory/plano_multiplas_granularidades.md`
- **Ícones animados beat-sync** (Heart pulsando com BPM real)
- **SpO2** (depende de sensor e schema futuro)
