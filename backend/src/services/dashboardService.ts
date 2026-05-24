import { prisma } from "../lib/prisma";

export const getDashboardOverview = async (farmId?: number) => {
    const cowWhere = farmId ? { farmId } : {};

    const [
        totalCows,
        cowsWithCollar,
        cowsInAlert,
        totalFarms,
        totalCollars,
        unreadNotifications,
    ] = await Promise.all([
        prisma.cow.count({ where: cowWhere }),
        prisma.cow.count({ where: { ...cowWhere, collarId: { not: null } } }),
        prisma.cow.count({ where: { ...cowWhere, status: { in: ["ALERT", "HEAT_STRESS", "CALVING"] } } }),
        prisma.farm.count(),
        prisma.collar.count({ where: { status: "ACTIVE" } }),
        prisma.notification.count({ where: { readAt: null } }),
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
        cowsWithCollar,
        cowsInAlert,
        totalFarms,
        totalActiveCollars: totalCollars,
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

    return statusGroups.map((group) => ({
        status: group.status,
        count:  group._count.status,
    }));
};

export const getCowsPerFarm = async () => {
    const farms = await prisma.farm.findMany({
        select: {
            id:   true,
            name: true,
            _count: { select: { cows: true } },
        },
        orderBy: { cows: { _count: "desc" } },
        take: 5,
    });

    return farms.map((farm) => ({
        id:       farm.id,
        name:     farm.name,
        cowCount: farm._count.cows,
    }));
};
