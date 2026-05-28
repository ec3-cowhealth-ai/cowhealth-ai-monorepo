import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@lib/api";

export interface Notification {
  id: number;
  type?: string;
  title: string;
  message: string;
  read: boolean;
  cowId?: number | null;
  severity?: string;
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) => api.patch(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
