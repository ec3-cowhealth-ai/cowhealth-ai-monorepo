import api from "../lib/api";
import type { Notification } from "@hooks/useNotifications";

export const notificationsService = {
  list: async () => {
    const response = await api.get<Notification[]>("/notifications");
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    await api.patch("/notifications/read-all");
  },
};
