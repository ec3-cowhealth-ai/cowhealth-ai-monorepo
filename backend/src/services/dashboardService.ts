import { prisma } from "../lib/prisma";

export const getDashboardOverview = async (farmId?: number) => {
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
        prisma.cow.count({ where: { ...cowWhere, status: { in: ["ALERT", "HEAT_STRESS", "CALVING"] } } }),
        prisma.farm.count(),
        prisma.collar.count({ where: { status: "ACTIVE" } }),
        // TODO[RENATO] Bug de segurança: conta notificações de TODOS os usuários do sistema.
        // Corrigir para: prisma.notification.count({ where: { readAt: null, userId } })
        // onde userId vem do token JWT (request.user.id) repassado até aqui via parâmetro.
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

    return statusGroups.map((group) => ({
        label: group.status,
        value: group._count.status,
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
        label: farm.name,
        value: farm._count.cows,
    }));
};
