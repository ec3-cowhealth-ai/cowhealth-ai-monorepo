import { useQuery } from "@tanstack/react-query";
import api from "@lib/api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  cowId?: string;
  createdAt: string;
}

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get<Notification[]>("/notifications");
      return response.data;
    },
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const response = await api.get<Notification[]>("/notifications?read=false");
      return response.data;
    },
  });
};

export const useMarkNotificationAsRead = () => {
  return {
    mutate: async (notificationId: string) => {
      await api.patch(`/notifications/${notificationId}/read`);
    },
  };
};

export const useMarkAllAsRead = () => {
  return {
    mutate: async () => {
      await api.patch("/notifications/read-all");
    },
  };
};
