import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { AppBar } from "@components/layout";
import { LoadingSpinner } from "@components/common";
import { Check, AlertTriangle, Bell, Activity } from "lucide-react";
import {
  useNotifications,
  useUnreadNotifications,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
} from "@hooks/useNotifications";

const TYPE_COLOR: Record<string, string> = {
  ALERT: "var(--danger)",
  WARNING: "var(--warning)",
  INFO: "var(--info)",
};

const TYPE_ICON: Record<string, ReactNode> = {
  ALERT: <AlertTriangle size={14} />,
  WARNING: <Bell size={14} />,
  INFO: <Activity size={14} />,
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export const NotificationsPage = () => {
  const [tab, setTab] = useState<"all" | "unread">("all");

  const { data: all, isLoading } = useNotifications();
  const { data: unread } = useUnreadNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const unreadCount = unread?.length || 0;

  const notifications = useMemo(() => {
    if (tab === "unread") return unread || [];
    return all || [];
  }, [tab, all, unread]);

  return (
    <div className="app-page">
      <AppBar
        title="Alertas"
        subtitle={unreadCount > 0 ? `${unreadCount} não lidos` : "Tudo em dia"}
        actions={
          unreadCount > 0 ? (
            <button
              className="app-bar__action"
              onClick={() => markAllAsRead()}
              title="Marcar tudo como lido"
            >
              <Check size={20} />
            </button>
          ) : undefined
        }
      />

      <div className="app-content">
        {/* Filter chips */}
        <div className="filter-chips">
          <button
            className={`filter-chip${tab === "all" ? " is-active" : ""}`}
            onClick={() => setTab("all")}
          >
            Todos <span style={{ opacity: 0.6 }}>{all?.length || 0}</span>
          </button>
          <button
            className={`filter-chip${tab === "unread" ? " is-active" : ""}`}
            onClick={() => setTab("unread")}
          >
            Não lidos <span style={{ opacity: 0.6 }}>{unreadCount}</span>
          </button>
        </div>

        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "var(--s-8)",
            }}
          >
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="home-empty">
            <Check size={36} color="var(--success)" />
            <p>{tab === "unread" ? "Você está em dia!" : "Sem notificações"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.map((n) => {
              const color = (n.type && TYPE_COLOR[n.type]) ?? "var(--border-subtle)";
              return (
                <button
                  key={n.id}
                  className={`alert-card alert-card--danger${n.read ? " alert-card--read" : ""}`}
                  style={{
                    borderLeftColor: color,
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                  }}
                >
                  <span
                    style={{
                      color,
                      flexShrink: 0,
                      marginTop: 2,
                      display: "flex",
                    }}
                  >
                    {(n.type && TYPE_ICON[n.type]) ?? <Bell size={14} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 2px 0",
                        fontSize: 13,
                        fontWeight: n.read ? 400 : 600,
                      }}
                    >
                      {n.title}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      {n.message}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {timeAgo(n.createdAt)}
                  </span>
                  {!n.read && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
