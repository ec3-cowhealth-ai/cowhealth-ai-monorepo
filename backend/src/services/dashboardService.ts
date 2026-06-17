import { prisma } from "../lib/prisma";

// Constrói o filtro de fazenda respeitando restrição do usuário
const buildFarmFilter = (farmId?: number, farmIds?: number[] | null) => {
  if (farmId) return { farmId };
  if (farmIds !== null && farmIds && farmIds.length > 0) return { farmId: { in: farmIds } };
  return {};
};

export const getDashboardOverview = async (
  farmId?: number,
  userId?: number,
  farmIds?: number[] | null,
) => {
  const farmFilter = buildFarmFilter(farmId, farmIds);
  const cowWhere = { ...farmFilter, status: { not: "RETIRED" as const } };

  const [
    totalCows,
    healthyCows,
    unhealthyCows,
    totalFarms,
    totalActiveCollars,
    unreadNotifications,
  ] = await Promise.all([
    prisma.cow.count({ where: cowWhere }),
    prisma.cow.count({ where: { ...cowWhere, status: "HEALTHY" } }),
    prisma.cow.count({
      where: { ...cowWhere, status: { in: ["ALERT", "HEAT_STRESS", "CALVING"] } },
    }),
    prisma.farm.count(),
    prisma.collar.count({ where: { status: "ACTIVE" } }),
    prisma.notification.count({ where: { readAt: null, userId } }),
  ]);

  const topFarm = farmId
    ? await prisma.farm.findUnique({
        where: { id: farmId },
        select: { id: true, name: true, _count: { select: { cows: true } } },
      })
    : await prisma.farm.findFirst({
        select: { id: true, name: true, _count: { select: { cows: true } } },
        orderBy: { cows: { _count: "desc" } },
      });

  return {
    totalCows,
    healthyCows,
    unhealthyCows,
    totalFarms,
    totalActiveCollars,
    unreadNotifications,
    topFarm: topFarm ? { id: topFarm.id, name: topFarm.name, cowCount: topFarm._count.cows } : null,
  };
};

export const getCowsPerStatus = async (
  farmId?: number,
  farmIds?: number[] | null,
) => {
  const farmFilter = buildFarmFilter(farmId, farmIds);
  const where = { ...farmFilter, status: { not: "RETIRED" as const } };

  const statusGroups = await prisma.cow.groupBy({
    by: ["status"],
    where,
    _count: { status: true },
  });

  return statusGroups.map((group: (typeof statusGroups)[number]) => ({
    label: group.status,
    value: group._count.status,
  }));
};

export const getCowsPerFarm = async (farmIds?: number[] | null) => {
  const where = farmIds !== null && farmIds && farmIds.length > 0 ? { id: { in: farmIds } } : {};

  const farms = await prisma.farm.findMany({
    where,
    select: { id: true, name: true, _count: { select: { cows: true } } },
    orderBy: { cows: { _count: "desc" } },
    take: 5,
  });

  return farms.map((farm: (typeof farms)[number]) => ({
    label: farm.name,
    value: farm._count.cows,
  }));
};

export const getFeaturedCow = async (farmId?: number, farmIds?: number[] | null) => {
  const farmFilter = buildFarmFilter(farmId, farmIds);

  const cow = await prisma.cow.findFirst({
    where: {
      ...farmFilter,
      status: { in: ["ALERT", "HEAT_STRESS"] },
    },
    select: {
      id: true,
      tag: true,
      name: true,
      breed: true,
      weight: true,
      status: true,
      birthDate: true,
      lastLat: true,
      lastLng: true,
      createdAt: true,
      farm: { select: { id: true, name: true } },
      collar: { select: { id: true, name: true, status: true } },
      temperatureData: {
        orderBy: { measuredAt: "desc" },
        take: 1,
        select: { celsius: true },
      },
    },
    orderBy: { temperatureData: { _count: "desc" } },
  });

  if (!cow) return null;

  const ageYears = cow.birthDate
    ? Math.floor((Date.now() - new Date(cow.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null;

  return {
    id: cow.id,
    tag: cow.tag,
    name: cow.name,
    breed: cow.breed,
    weight: cow.weight,
    status: cow.status,
    birthDate: cow.birthDate,
    lastLat: cow.lastLat,
    lastLng: cow.lastLng,
    createdAt: cow.createdAt,
    farm: cow.farm,
    collar: cow.collar,
    ageYears,
    latestTemperature: cow.temperatureData[0]?.celsius ?? null,
  };
};

export const getRecentAlerts = async (farmId?: number, limit: number = 6) => {
  const cowWhere = farmId ? { farmId } : {};

  const notifications = await prisma.notification.findMany({
    where: farmId
      ? { cow: { is: cowWhere } }
      : {},
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      message: true,
      createdAt: true,
      cow: { select: { tag: true, name: true } },
    },
  });

  const now = new Date();

  return notifications.map((n) => {
    const diffMs = now.getTime() - new Date(n.createdAt).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    let timeAgo: string;
    if (diffMin < 1) timeAgo = "agora";
    else if (diffMin < 60) timeAgo = `há ${diffMin} min`;
    else if (diffHr < 24) timeAgo = `há ${diffHr}h`;
    else timeAgo = `há ${diffDay}d`;

    return {
      id: n.id,
      title: n.title,
      message: n.message,
      cowTag: n.cow?.tag ?? null,
      cowName: n.cow?.name ?? null,
      createdAt: n.createdAt,
      timeAgo,
    };
  });
};

export const getCowVitals = async (cowId: number) => {
  const cow = await prisma.cow.findUnique({
    where: { id: cowId },
    select: { id: true, status: true, birthDate: true },
  });
  if (!cow) throw new Error("Vaca não encontrada.");

  const sevenDays = new Date();
  sevenDays.setDate(sevenDays.getDate() - 6);
  sevenDays.setHours(0, 0, 0, 0);

  const [temperatures, heartRates] = await Promise.all([
    prisma.temperatureData.findMany({
      where: { cowId, measuredAt: { gte: sevenDays } },
      select: { celsius: true, measuredAt: true },
      orderBy: { measuredAt: "asc" },
    }),
    prisma.heartRateData.findMany({
      where: { cowId, measuredAt: { gte: sevenDays } },
      select: { bpm: true, measuredAt: true },
      orderBy: { measuredAt: "asc" },
    }),
  ]);

  const avgTemp = temperatures.length
    ? temperatures.reduce((s, r) => s + r.celsius, 0) / temperatures.length
    : null;
  const avgBpm = heartRates.length
    ? heartRates.reduce((s, r) => s + r.bpm, 0) / heartRates.length
    : null;

  const isAlert = cow.status === "ALERT" || cow.status === "HEAT_STRESS";
  const highTemp = avgTemp != null && avgTemp > 39.5;
  const highBpm = avgBpm != null && avgBpm > 100;
  const riskScore = Math.min(
    100,
    (isAlert ? 40 : 0) + (highTemp ? 30 : 0) + (highBpm ? 20 : 0) + 10,
  );

  return {
    temperatures: temperatures.map((r) => ({
      measuredAt: r.measuredAt.toISOString(),
      value: r.celsius,
    })),
    heartRates: heartRates.map((r) => ({
      measuredAt: r.measuredAt.toISOString(),
      value: r.bpm,
    })),
    riskScore,
  };
};

// Thresholds calibrados com base nos dados reais do DB:
// accelXY médio ≈ 0 (sem movimento), gyro até ±47 °/s
// accelZ ≈ 9.42 = gravidade (sensor em m/s²)
const classifyActivity = (avgXY: number, avgGyro: number) => {
  if (avgXY > 0.55 || avgGyro > 20)  return { label: "Atividade",    icon: "activity",   color: "#f57f17" };
  if (avgXY > 0.25 || avgGyro > 10)  return { label: "Alimentação",  icon: "feeding",    color: "#6bb4e8" };
  if (avgGyro > 4)                    return { label: "Ruminação",    icon: "rumination", color: "#339989" };
  return                                     { label: "Repouso",      icon: "rest",       color: "#888" };
};

export const getCowActivityTimeline = async (cowId: number, date?: string) => {
  // Append T00:00:00 (no Z) so the string is parsed as local time, not UTC.
  // new Date("2026-06-17") → UTC midnight; new Date("2026-06-17T00:00:00") → local midnight.
  const base = date ? new Date(date + "T00:00:00") : new Date();
  const start = new Date(base); start.setHours(0, 0, 0, 0);
  const end   = new Date(base); end.setHours(23, 59, 59, 999);

  const records = await prisma.accelerometerData.findMany({
    where: { cowId, measuredAt: { gte: start, lte: end } },
    select: { accelX: true, accelY: true, gyroX: true, gyroY: true, gyroZ: true, measuredAt: true },
    orderBy: { measuredAt: "asc" },
  });

  if (records.length === 0) return [];

  // Agrupar por hora
  const byHour = new Map<number, typeof records>();
  for (const r of records) {
    const h = new Date(r.measuredAt).getHours();
    if (!byHour.has(h)) byHour.set(h, []);
    byHour.get(h)!.push(r);
  }

  const hourlyEvents = Array.from(byHour.entries()).map(([hour, recs]) => {
    const avgXY   = recs.reduce((s, r) => s + Math.sqrt(r.accelX ** 2 + r.accelY ** 2), 0) / recs.length;
    const avgGyro = recs.reduce((s, r) => s + Math.sqrt(r.gyroX ** 2 + r.gyroY ** 2 + r.gyroZ ** 2), 0) / recs.length;
    const { label, icon, color } = classifyActivity(avgXY, avgGyro);
    return {
      time:        `${String(hour).padStart(2, "0")}:00`,
      label,
      icon,
      color,
      durationMin: 60,
    };
  });

  hourlyEvents.sort((a, b) => a.time.localeCompare(b.time));

  // Mesclar horas consecutivas com a mesma atividade para reduzir ruído
  const merged: typeof hourlyEvents = [];
  for (const ev of hourlyEvents) {
    const prev = merged[merged.length - 1];
    if (prev && prev.label === ev.label) {
      prev.durationMin += ev.durationMin;
    } else {
      merged.push({ ...ev });
    }
  }

  return merged;
};

type Bucket = { start: Date; end: Date; label: string };

const buildBuckets = (period: string, from?: string, to?: string): Bucket[] => {
  const now = new Date();

  if (period === "hourly") {
    return Array.from({ length: 24 }, (_, i) => {
      const start = new Date(now);
      start.setMinutes(0, 0, 0);
      start.setHours(start.getHours() - (23 - i));
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      const label = `${String(start.getHours()).padStart(2, "0")}h`;
      return { start, end, label };
    });
  }

  if (period === "weekly") {
    return Array.from({ length: 8 }, (_, i) => {
      const end = new Date(now);
      end.setDate(end.getDate() - (7 - i) * 7);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const label = `Sem ${i + 1}`;
      return { start, end, label };
    });
  }

  if (period === "biweekly") {
    return Array.from({ length: 6 }, (_, i) => {
      const end = new Date(now);
      end.setDate(end.getDate() - (5 - i) * 15);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - 14);
      start.setHours(0, 0, 0, 0);
      const label = `Quin ${i + 1}`;
      return { start, end, label };
    });
  }

  if (period === "monthly") {
    const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = MONTHS[d.getMonth()];
      return { start, end, label };
    });
  }

  if (period === "yearly") {
    const year = now.getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const y = year - (4 - i);
      const start = new Date(y, 0, 1);
      const end = new Date(y, 11, 31, 23, 59, 59, 999);
      return { start, end, label: String(y) };
    });
  }

  if (period === "custom" && from && to) {
    const buckets: Bucket[] = [];
    const cur = new Date(from + "T00:00:00");
    cur.setHours(0, 0, 0, 0);
    const toDate = new Date(to + "T00:00:00");
    toDate.setHours(23, 59, 59, 999);
    while (cur <= toDate) {
      const start = new Date(cur);
      const end = new Date(cur);
      end.setHours(23, 59, 59, 999);
      const label = `${String(cur.getDate()).padStart(2, "0")}/${String(cur.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({ start, end, label });
      cur.setDate(cur.getDate() + 1);
    }
    return buckets;
  }

  // default: daily — últimos 7 dias
  return Array.from({ length: 7 }, (_, i) => {
    const start = new Date(now);
    start.setDate(start.getDate() - (6 - i));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    const label = start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return { start, end, label };
  });
};

// Limiares fisiológicos para classificação histórica por bucket
const THRESH = { tempHeatStress: 39.5, tempAlert: 39.0, bpmHigh: 100 };

export const getHealthTimeline = async (
  farmId?: number,
  farmIds?: number[] | null,
  period: string = "daily",
  from?: string,
  to?: string,
) => {
  const farmFilter = buildFarmFilter(farmId, farmIds);
  const cowWhere = { ...farmFilter, status: { not: "RETIRED" as const } };
  const buckets = buildBuckets(period, from, to);

  // IDs das vacas ativas no escopo da fazenda
  const activeCows = await prisma.cow.findMany({ where: cowWhere, select: { id: true } });
  const cowIds = activeCows.map((c) => c.id);

  if (cowIds.length === 0) {
    return buckets.map(({ label }) => ({ label, healthy: 0, alert: 0, heatStress: 0, calving: 0 }));
  }

  return Promise.all(
    buckets.map(async ({ start, end, label }) => {
      const dateFilter = { gte: start, lte: end };

      // Pico de temperatura e FC por vaca no bucket — MAX detecta anomalias que a média esconde
      const [tempGroups, bpmGroups, calvingNotifs] = await Promise.all([
        prisma.temperatureData.groupBy({
          by: ["cowId"],
          where: { cowId: { in: cowIds }, measuredAt: dateFilter },
          _max: { celsius: true },
        }),
        prisma.heartRateData.groupBy({
          by: ["cowId"],
          where: { cowId: { in: cowIds }, measuredAt: dateFilter },
          _max: { bpm: true },
        }),
        prisma.notification.findMany({
          where: { cowId: { in: cowIds }, alertType: "CALVING", createdAt: dateFilter },
          select: { cowId: true },
        }),
      ]);

      const bpmMap = new Map(bpmGroups.map((g) => [g.cowId, g._max.bpm ?? 0]));
      const calvingIds = new Set(calvingNotifs.map((n) => n.cowId));
      const classified = new Set<number>();

      let healthy = 0, alert = 0, heatStress = 0;
      const calving = calvingIds.size;

      for (const tg of tempGroups) {
        classified.add(tg.cowId);
        if (calvingIds.has(tg.cowId)) continue;

        const maxTemp = tg._max.celsius ?? 0;
        const maxBpm = bpmMap.get(tg.cowId) ?? 0;

        if (maxTemp > THRESH.tempHeatStress && maxBpm > THRESH.bpmHigh) heatStress++;
        else if (maxTemp > THRESH.tempAlert || maxBpm > THRESH.bpmHigh) alert++;
        else healthy++;
      }

      // Vacas com FC mas sem leitura de temperatura no bucket
      for (const bg of bpmGroups) {
        if (classified.has(bg.cowId) || calvingIds.has(bg.cowId)) continue;
        classified.add(bg.cowId);
        if ((bg._max.bpm ?? 0) > THRESH.bpmHigh) alert++;
        else healthy++;
      }

      return { label, healthy, alert, heatStress, calving };
    }),
  );
};
