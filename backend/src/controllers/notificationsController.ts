import { Request, Response } from "express";
import {
    getAllNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../services/notificationsService";

export const listNotifications = async (request: Request, response: Response): Promise<void> => {
    const userId      = request.user!.sub;
    const notifications = await getAllNotifications(userId);
    response.json(notifications);
};

export const markAsRead = async (request: Request, response: Response): Promise<void> => {
    try {
        const userId       = request.user!.sub;
        const notification = await markNotificationAsRead(Number(request.params.id), userId);
        response.json(notification);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const markAllAsRead = async (request: Request, response: Response): Promise<void> => {
    const userId = request.user!.sub;
    const result = await markAllNotificationsAsRead(userId);
    response.json(result);
};