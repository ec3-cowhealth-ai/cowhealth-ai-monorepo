import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@lib/api";

export interface Notification {
  id: string;
  type?: string;
  title: string;
  message: string;
  readAt: string | null;
  read: boolean;
  cowId: number | null;
  severity?: "HIGH" | "MEDIUM" | "LOW";
  cow?: { id: number; tag: string; name?: string | null; status: string };
  createdAt: string;
}

const mapRead = (n: Omit<Notification, "read">): Notification => ({
  ...n,
  read: n.readAt !== null,
});

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get<Omit<Notification, "read">[]>("/notifications");
      return response.data.map(mapRead);
    },
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const response = await api.get<Omit<Notification, "read">[]>("/notifications");
      return response.data.map(mapRead).filter((n) => !n.read);
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => api.patch(`/notifications/${notificationId}/read`),
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
