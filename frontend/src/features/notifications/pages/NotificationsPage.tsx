import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { LoadingSpinner } from "@components/common";
import { Check, AlertTriangle, Bell, Activity, CheckCheck } from "lucide-react";
import {
  useNotifications,
  useUnreadNotifications,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
} from "@hooks/useNotifications";
import { C, cardStyle } from "@features/dashboard/constants/colors";

const TYPE_COLOR: Record<string, string> = {
  ALERT:   C.red,
  WARNING: C.orange,
  INFO:    "#6bb4e8",
};

const TYPE_BG: Record<string, string> = {
  ALERT:   "#fde8e4",
  WARNING: "#fbe9d8",
  INFO:    "#e4f0fb",
};

const TYPE_ICON: Record<string, ReactNode> = {
  ALERT:   <AlertTriangle size={14} />,
  WARNING: <Bell size={14} />,
  INFO:    <Activity size={14} />,
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

  const { data: all, isLoading }  = useNotifications();
  const { data: unread }          = useUnreadNotifications();
  const { mutate: markAsRead }    = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const unreadCount = unread?.length || 0;

  const notifications = useMemo(() => {
    if (tab === "unread") return unread || [];
    return all || [];
  }, [tab, all, unread]);

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Bell size={34} color={C.green} />
            <div>
              <h1 style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 34, lineHeight: 1, margin: 0, color: C.text, fontWeight: 400,
              }}>
                Alertas
              </h1>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: unreadCount > 0 ? C.orange : C.muted }}>
                {unreadCount > 0 ? `${unreadCount} não lido${unreadCount !== 1 ? "s" : ""}` : "Tudo em dia"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                border: `1px solid ${C.border}`, background: "#fff",
                color: C.muted, cursor: "pointer",
              }}
              title="Marcar tudo como lido"
            >
              <CheckCheck size={14} /> Marcar tudo
            </button>
          )}
        </header>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8 }}>
          {([["all", "Todos", all?.length || 0], ["unread", "Não lidos", unreadCount]] as [string, string, number][]).map(([val, label, count]) => {
            const active = tab === val;
            return (
              <button
                key={val}
                onClick={() => setTab(val as "all" | "unread")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 16px", borderRadius: 999, fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  border: `1px solid ${active ? C.green : C.border}`,
                  background: active ? C.green : "#fff",
                  color: active ? "#fff" : C.muted,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {label}
                <span style={{ opacity: active ? 0.75 : 0.55, fontSize: 11 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, textAlign: "center" }}>
            <Check size={36} color={C.green} />
            <p style={{ margin: 0, fontSize: 14, color: C.muted }}>
              {tab === "unread" ? "Você está em dia!" : "Sem notificações"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map((n) => {
              const nColor = TYPE_COLOR[n.type] ?? C.muted;
              const nBg    = TYPE_BG[n.type]    ?? "#f0f0ee";
              return (
                <button
                  key={n.id}
                  onClick={() => { if (!n.read) markAsRead(n.id); }}
                  style={{
                    ...cardStyle,
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: 16, cursor: "pointer", textAlign: "left",
                    borderLeft: `4px solid ${nColor}`,
                    opacity: n.read ? 0.65 : 1,
                    borderRadius: 12,
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: nBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: nColor,
                  }}>
                    {TYPE_ICON[n.type] ?? <Bell size={14} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px 0", fontSize: 13, fontWeight: n.read ? 400 : 600, color: C.text }}>
                      {n.title}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{n.message}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: C.muted }}>{timeAgo(n.createdAt)}</span>
                    {!n.read && (
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
