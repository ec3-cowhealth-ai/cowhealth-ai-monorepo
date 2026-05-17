import { useState, useMemo } from "react";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState } from "@components/common";
import { NotificationCard } from "../components/NotificationCard";
import {
  useNotifications,
  useUnreadNotifications,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
} from "@hooks/useNotifications";

export const NotificationsPage = () => {
  const [tab, setTab] = useState<"all" | "unread">("all");

  const { data: allNotifications, isLoading: allLoading } = useNotifications();
  const { data: unreadNotifications } = useUnreadNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const notifications = useMemo(() => {
    if (tab === "unread") return unreadNotifications || [];
    return allNotifications || [];
  }, [tab, allNotifications, unreadNotifications]);

  const unreadCount = unreadNotifications?.length || 0;

  if (allLoading) {
    return (
      <div className="app-page">
        <AppBar title="Notificações" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppBar
        title="Notificações"
        actions={
          unreadCount > 0 && (
            <button className="btn btn-sm btn-secondary" onClick={() => markAllAsRead()}>
              Marcar tudo como lido
            </button>
          )
        }
      />

      <div className="app-page__section">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tabs__tab ${tab === "all" ? "is-active" : ""}`}
            onClick={() => setTab("all")}
          >
            Todos ({allNotifications?.length || 0})
          </button>
          <button
            className={`tabs__tab ${tab === "unread" ? "is-active" : ""}`}
            onClick={() => setTab("unread")}
          >
            Não Lidos ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <EmptyState
            icon="📭"
            title={tab === "unread" ? "Sem notificações não lidas" : "Sem notificações"}
            description={tab === "unread" ? "Você está em dia!" : "Você não tem notificações."}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
