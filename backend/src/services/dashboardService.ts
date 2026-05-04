import { prisma } from "../lib/prisma";

export const getDashboardOverview = async () => {
    const [
        totalCows,
        cowsWithCollar,
        cowsInAlert,
        totalFarms,
        totalCollars,
        unreadNotifications,
    ] = await Promise.all([
        prisma.cow.count(),
        prisma.cow.count({ where: { collarId: { not: null } } }),
        prisma.cow.count({ where: { status: { in: ["ALERT", "HEAT_STRESS", "CALVING"] } } }),
        prisma.farm.count(),
        prisma.collar.count({ where: { status: "ACTIVE" } }),
        prisma.notification.count({ where: { readAt: null } }),
    ]);

    // Fazenda com mais vacas monitoradas (com colar ativo)
    const topFarm = await prisma.farm.findFirst({
        select: {
        id:   true,
        name: true,
        _count: { select: { cows: true } },
        },
        orderBy: {
        cows: { _count: "desc" },
        },
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

export const getCowsPerStatus = async () => {
    const statusGroups = await prisma.cow.groupBy({
        by: ["status"],
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
        orderBy: {
        cows: { _count: "desc" },
        },
        take: 5, // Top 5 fazendas
    });

    return farms.map((farm) => ({
        id:       farm.id,
        name:     farm.name,
        cowCount: farm._count.cows,
    }));
};