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
  _period?: "day" | "week" | "month",
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
    prisma.cow.count({ where: { ...cowWhere, collarId: { not: null } } }),
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

export const getCowsPerStatus = async (farmId?: number, farmIds?: number[] | null) => {
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

export const getCowActivityTimeline = async (_cowId: number, _date?: string) => {
  // Tabela activity_events ainda não é populada pelo MQTT
  return [];
};

export const getHealthTimeline = async (farmId?: number, farmIds?: number[] | null) => {
  const farmFilter = buildFarmFilter(farmId, farmIds);
  const baseWhere = { ...farmFilter, status: { not: "RETIRED" as const } };

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const results = await Promise.all(
    days.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const [healthy, alert, heatStress, calving] = await Promise.all([
        prisma.cow.count({
          where: { ...baseWhere, status: "HEALTHY", createdAt: { lte: nextDay } },
        }),
        prisma.cow.count({ where: { ...baseWhere, status: "ALERT", createdAt: { lte: nextDay } } }),
        prisma.cow.count({
          where: { ...baseWhere, status: "HEAT_STRESS", createdAt: { lte: nextDay } },
        }),
        prisma.cow.count({
          where: { ...baseWhere, status: "CALVING", createdAt: { lte: nextDay } },
        }),
      ]);

      return {
        date: day.toISOString().split("T")[0],
        healthy,
        alert,
        heatStress,
        calving,
      };
    }),
  );

  return results;
};
