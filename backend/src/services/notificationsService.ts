import { prisma } from "../lib/prisma";

export const getAllNotifications = async (userId: number) => {
    return prisma.notification.findMany({
        where: { userId },
        select: {
            id:        true,
            title:     true,
            message:   true,
            readAt:    true,
            createdAt: true,
            cow: { select: { id: true, tag: true, name: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};

export const markNotificationAsRead = async (notificationId: number, userId: number) => {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification) throw new Error("Notificação não encontrada.");

    // Garante que o usuário só pode marcar suas próprias notificações
    if (notification.userId !== userId) {
        throw new Error("Sem permissão para esta ação.");
    }

    if (notification.readAt) throw new Error("Notificação já foi marcada como lida.");

    return prisma.notification.update({
        where: { id: notificationId },
        data:  { readAt: new Date() },
        select: { id: true, readAt: true },
    });
};

export const markAllNotificationsAsRead = async (userId: number) => {
    const { count } = await prisma.notification.updateMany({
        where: { userId, readAt: null },
        data:  { readAt: new Date() },
    });

    return { marked: count };
};