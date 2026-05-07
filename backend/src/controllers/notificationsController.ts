import { Request, Response } from "express";
import {
    getAllNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../services/notificationsService";
import { handleRequest } from "../lib/controllerHelpers";

export const listNotifications = async (request: Request, response: Response): Promise<void> => {
    const notifications = await getAllNotifications(request.user!.sub);
    response.json(notifications);
};

export const markAsRead = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(
        response,
        () => markNotificationAsRead(Number(request.params.id), request.user!.sub)
    );
};

export const markAllAsRead = async (request: Request, response: Response): Promise<void> => {
    const result = await markAllNotificationsAsRead(request.user!.sub);
    response.json(result);
};