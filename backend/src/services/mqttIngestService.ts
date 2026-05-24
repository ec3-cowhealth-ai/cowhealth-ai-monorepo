import { CowStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

// ─── Tipos do payload MQTT ────────────────────────────────────────────────────

interface MqttPayload {
    device_id: string;
    datetime:  string;
    sensors: {
        max30102?: { heart_rate: number };
        mlx?:      { object_temp: number };
        mpu?: {
            acc:  [number, number, number];
            gyro: [number, number, number];
        };
    };
}

// ─── Validação do payload ─────────────────────────────────────────────────────

export const validatePayload = (body: unknown): MqttPayload => {
    const data = body as Record<string, unknown>;

    if (!data.device_id || typeof data.device_id !== "string") {
        throw new Error("Campo obrigatório ausente: device_id.");
    }
    if (!data.datetime || typeof data.datetime !== "string") {
        throw new Error("Campo obrigatório ausente: datetime.");
    }
    if (!data.sensors || typeof data.sensors !== "object") {
        throw new Error("Campo obrigatório ausente: sensors.");
    }

    const measuredAt = new Date(data.datetime);
    if (isNaN(measuredAt.getTime())) {
        throw new Error("Campo datetime inválido — use ISO 8601.");
    }

    return data as unknown as MqttPayload;
};

// ─── Persistência dos dados de sensores ──────────────────────────────────────

const persistSensorData = async (cowId: number, payload: MqttPayload) => {
    const measuredAt = new Date(payload.datetime);
    const { sensors } = payload;

    if (sensors.max30102?.heart_rate !== undefined) {
        await prisma.heartRateData.create({
            data: { cowId, bpm: Math.round(sensors.max30102.heart_rate), measuredAt },
        });
    }

    if (sensors.mlx?.object_temp !== undefined) {
        await prisma.temperatureData.create({
            data: { cowId, celsius: sensors.mlx.object_temp, measuredAt },
        });
    }

    if (sensors.mpu?.acc && sensors.mpu?.gyro) {
        const [accelX, accelY, accelZ] = sensors.mpu.acc;
        const [gyroX,  gyroY,  gyroZ ] = sensors.mpu.gyro;
        await prisma.accelerometerData.create({
            data: { cowId, accelX, accelY, accelZ, gyroX, gyroY, gyroZ, measuredAt },
        });
    }
};

// ─── Análise de saúde ─────────────────────────────────────────────────────────

const analyzeHealth = async (cowId: number): Promise<CowStatus | null> => {
    const now = new Date();

    // --- Parto iminente (CALVING) ---
    const oneHourAgo   = new Date(now.getTime() - 60 * 60 * 1000);
    const twelveHrsAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    const [recentAccel, recentHr, recentTemps] = await Promise.all([
        prisma.accelerometerData.findMany({
            where:   { cowId, measuredAt: { gte: oneHourAgo } },
            select:  { accelZ: true },
            orderBy: { measuredAt: "asc" },
        }),
        prisma.heartRateData.findMany({
            where:   { cowId },
            select:  { bpm: true },
            orderBy: { measuredAt: "desc" },
            take: 30,
        }),
        prisma.temperatureData.findMany({
            where:   { cowId, measuredAt: { gte: twelveHrsAgo } },
            select:  { celsius: true },
            orderBy: { measuredAt: "asc" },
        }),
    ]);

    const posturalChanges = recentAccel.reduce((count, reading, i) => {
        if (i === 0) return count;
        return Math.abs(reading.accelZ - recentAccel[i - 1].accelZ) > 0.5 ? count + 1 : count;
    }, 0);

    const avgHr = recentHr.length > 0
        ? recentHr.reduce((sum, r) => sum + r.bpm, 0) / recentHr.length
        : 0;

    const tempDelta = recentTemps.length >= 2
        ? recentTemps[recentTemps.length - 1].celsius - recentTemps[0].celsius
        : 0;

    if (posturalChanges > 10 && avgHr > 90 && tempDelta < 0) {
        return CowStatus.CALVING;
    }

    // --- Estresse térmico (HEAT_STRESS) ---
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const [recentAccelXY, recentTemp30] = await Promise.all([
        prisma.accelerometerData.findMany({
            where:   { cowId, measuredAt: { gte: thirtyMinAgo } },
            select:  { accelX: true, accelY: true },
            orderBy: { measuredAt: "asc" },
        }),
        prisma.temperatureData.findMany({
            where:   { cowId },
            select:  { celsius: true },
            orderBy: { measuredAt: "desc" },
            take: 30,
        }),
    ]);

    const restlessPeaks = recentAccelXY.reduce((count, reading, i) => {
        if (i === 0) return count;
        const deltaX = Math.abs(reading.accelX - recentAccelXY[i - 1].accelX);
        const deltaY = Math.abs(reading.accelY - recentAccelXY[i - 1].accelY);
        return deltaX > 0.8 || deltaY > 0.8 ? count + 1 : count;
    }, 0);

    const avgTemp = recentTemp30.length > 0
        ? recentTemp30.reduce((sum, r) => sum + r.celsius, 0) / recentTemp30.length
        : 0;

    if (avgTemp > 39.0 && avgHr > 100 && restlessPeaks > 15) {
        return CowStatus.HEAT_STRESS;
    }

    return null;
};

// ─── Envio de notificações ────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
    CALVING:    "parto iminente",
    HEAT_STRESS: "estresse térmico",
};

const notifyUsers = async (cowId: number, cowName: string | null, cowTag: string, status: CowStatus) => {
    const label      = STATUS_LABELS[status] ?? status;
    const identifier = cowName ?? cowTag;
    const title      = "Alerta de Saúde Animal";
    const message    = `A vaca ${identifier} apresenta indícios de ${label}. Verificação imediata necessária.`;

    const adminsAndManagers = await prisma.user.findMany({
        where:  { active: true, profile: { in: ["ADMIN", "MANAGER"] } },
        select: { id: true },
    });

    if (adminsAndManagers.length === 0) return;

    await prisma.notification.createMany({
        data: adminsAndManagers.map((user) => ({
            userId: user.id,
            cowId,
            title,
            message,
        })),
    });
};

// ─── Ponto de entrada do serviço ──────────────────────────────────────────────

export const ingestMqttPayload = async (body: unknown) => {
    const payload = validatePayload(body);

    const collar = await prisma.collar.findUnique({
        where:   { name: payload.device_id },
        include: { cow: true },
    });

    if (!collar) throw new Error(`Colar não encontrado: ${payload.device_id}`);

    const cow = collar.cow;
    if (!cow) throw new Error(`Nenhuma vaca vinculada ao colar ${payload.device_id}`);

    await persistSensorData(cow.id, payload);

    const detectedStatus = await analyzeHealth(cow.id);

    if (detectedStatus && cow.status !== detectedStatus) {
        await prisma.cow.update({
            where: { id: cow.id },
            data:  { status: detectedStatus },
        });
        await notifyUsers(cow.id, cow.name, cow.tag, detectedStatus);
    }

    return { received: true, cowId: cow.id, collarId: collar.id };
};