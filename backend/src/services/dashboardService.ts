import { prisma } from "../lib/prisma";

export const getDashboardOverview = async (farmId?: number, userId?: number) => {
  const cowWhere = farmId ? { farmId } : {};

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
      where: {
        ...cowWhere,
        status: { in: ["ALERT", "HEAT_STRESS", "CALVING"] },
      },
    }),
    prisma.farm.count(),
    prisma.collar.count({ where: { status: "ACTIVE" } }),
    prisma.notification.count({ where: { readAt: null, userId } }),
  ]);

  // Se filtrou por fazenda, retorna ela; senão, a com mais vacas
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
    topFarm: topFarm
      ? { id: topFarm.id, name: topFarm.name, cowCount: topFarm._count.cows }
      : null,
  };
};

export const getCowsPerStatus = async (farmId?: number) => {
  const where = farmId ? { farmId } : {};
  const statusGroups = await prisma.cow.groupBy({
    by: ["status"],
    where,
    _count: { status: true },
  });

  return statusGroups.map((group: typeof statusGroups[number]) => ({
    label: group.status,
    value: group._count.status,
  }));
};

export const getCowsPerFarm = async () => {
  const farms = await prisma.farm.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { cows: true } },
    },
    orderBy: { cows: { _count: "desc" } },
    take: 5,
  });

  return farms.map((farm: typeof farms[number]) => ({
    label: farm.name,
    value: farm._count.cows,
  }));
};

export const getHealthTimeline = async (farmId?: number) => {
  const where = farmId ? { farmId } : {};

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const results = await Promise.all(
    days.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const [healthy, alert, heatStress, calving] = await Promise.all([
        prisma.cow.count({
          where: { ...where, status: "HEALTHY", createdAt: { lte: nextDay } },
        }),
        prisma.cow.count({
          where: { ...where, status: "ALERT", createdAt: { lte: nextDay } },
        }),
        prisma.cow.count({
          where: { ...where, status: "HEAT_STRESS", createdAt: { lte: nextDay } },
        }),
        prisma.cow.count({
          where: { ...where, status: "CALVING", createdAt: { lte: nextDay } },
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
