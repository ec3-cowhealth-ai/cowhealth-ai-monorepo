import { prisma } from "../lib/prisma";

// O parâmetro period não filtra os totais gerais (que são sempre o estado atual),
// mas está disponível para extensões futuras como filtrar alertas por período.
type Period = "day" | "week" | "month";

export const getDashboardOverview = async (_period?: Period) => {
    const [
        totalCows,
        healthyCows,
        unhealthyCows,
        totalFarms,
        totalActiveCollars,
        unreadNotifications,
    ] = await Promise.all([
        prisma.cow.count(),
        prisma.cow.count({ where: { status: "HEALTHY" } }),
        prisma.cow.count({ where: { status: { in: ["ALERT", "HEAT_STRESS", "CALVING"] } } }),
        prisma.farm.count(),
        prisma.collar.count({ where: { status: "ACTIVE" } }),
        prisma.notification.count({ where: { readAt: null } }),
    ]);

    const topFarm = await prisma.farm.findFirst({
        select: {
            id:     true,
            name:   true,
            _count: { select: { cows: true } },
        },
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

export const getCowsPerStatus = async () => {
    const statusGroups = await prisma.cow.groupBy({
        by: ["status"],
        _count: { status: true },
    });

    return statusGroups.map((group) => ({
        label: group.status,
        value: group._count.status,
    }));
};

export const getCowsPerFarm = async () => {
    const farms = await prisma.farm.findMany({
        select: {
            id:     true,
            name:   true,
            _count: { select: { cows: true } },
        },
        orderBy: { cows: { _count: "desc" } },
        take: 5,
    });

    return farms.map((farm) => ({
        label: farm.name,
        value: farm._count.cows,
    }));
};