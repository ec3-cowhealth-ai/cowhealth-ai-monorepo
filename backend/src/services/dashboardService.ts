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
