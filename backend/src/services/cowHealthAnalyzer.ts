import { CowStatus } from "@prisma/client";

// ─── Thresholds nomeados ──────────────────────────────────────────────────────

export const HEALTH_THRESHOLDS = {
    calving: {
        posturalChanges:  10,   // variações de accelZ em 1h
        avgHeartRate:     90,   // bpm médio (últimas 30 leituras)
        tempDeltaMax:      0,   // queda de temperatura nas últimas 12h
    },
    heatStress: {
        avgTemperature:  39.0,  // °C médio (últimas 30 leituras)
        avgHeartRate:   100,    // bpm médio (últimas 30 leituras)
        restlessPeaks:   15,    // picos de agitação em 30min
    },
} as const;

// ─── Snapshot de sensores ─────────────────────────────────────────────────────

export interface CowHealthSnapshot {
    posturalChanges: number;  // mudanças posturais em 1h
    avgHeartRate:    number;  // média de BPM (últimas 30 leituras)
    tempDelta:       number;  // última temp − primeira temp nas últimas 12h
    avgTemperature:  number;  // média de temp (últimas 30 leituras)
    restlessPeaks:   number;  // picos de agitação em 30min
}

// ─── Classificador puro — sem Prisma, sem I/O ─────────────────────────────────

export const classifyHealth = (snapshot: CowHealthSnapshot): CowStatus | null => {
    const { calving, heatStress } = HEALTH_THRESHOLDS;

    if (
        snapshot.posturalChanges > calving.posturalChanges &&
        snapshot.avgHeartRate    > calving.avgHeartRate    &&
        snapshot.tempDelta       < calving.tempDeltaMax
    ) {
        return CowStatus.CALVING;
    }

    if (
        snapshot.avgTemperature > heatStress.avgTemperature &&
        snapshot.avgHeartRate   > heatStress.avgHeartRate   &&
        snapshot.restlessPeaks  > heatStress.restlessPeaks
    ) {
        return CowStatus.HEAT_STRESS;
    }

    return null;
};

// ─── Funções de agregação para montar o snapshot ──────────────────────────────

export const buildHealthSnapshot = (
    recentAccelZ:  { accelZ: number }[],
    recentHr:      { bpm: number }[],
    recentTemps12: { celsius: number }[],
    recentAccelXY: { accelX: number; accelY: number }[],
    recentTemps30: { celsius: number }[],
): CowHealthSnapshot => {
    const posturalChanges = recentAccelZ.reduce((count, r, i) => {
        if (i === 0) return count;
        return Math.abs(r.accelZ - recentAccelZ[i - 1].accelZ) > 0.5 ? count + 1 : count;
    }, 0);

    const avgHeartRate = recentHr.length > 0
        ? recentHr.reduce((sum, r) => sum + r.bpm, 0) / recentHr.length
        : 0;

    const tempDelta = recentTemps12.length >= 2
        ? recentTemps12[recentTemps12.length - 1].celsius - recentTemps12[0].celsius
        : 0;

    const restlessPeaks = recentAccelXY.reduce((count, r, i) => {
        if (i === 0) return count;
        const deltaX = Math.abs(r.accelX - recentAccelXY[i - 1].accelX);
        const deltaY = Math.abs(r.accelY - recentAccelXY[i - 1].accelY);
        return deltaX > 0.8 || deltaY > 0.8 ? count + 1 : count;
    }, 0);

    const avgTemperature = recentTemps30.length > 0
        ? recentTemps30.reduce((sum, r) => sum + r.celsius, 0) / recentTemps30.length
        : 0;

    return { posturalChanges, avgHeartRate, tempDelta, avgTemperature, restlessPeaks };
};
