import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@components/common";
import { Check, AlertTriangle, Bell, Activity, CheckCheck } from "lucide-react";
import {
  useNotifications,
  useUnreadNotifications,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
  type Notification,
} from "@hooks/useNotifications";
import { C, cardStyle } from "@features/dashboard/constants/colors";

const TYPE_COLOR: Record<string, string> = {
  ALERT: C.red,
  WARNING: C.orange,
  INFO:    "#6bb4e8",
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

type SeverityFilter = "all" | "HIGH" | "MEDIUM" | "LOW";

const SEVERITY_LABEL: Record<SeverityFilter, string> = {
  all: "Todos",
  HIGH: "Críticos",
  MEDIUM: "Avisos",
  LOW: "Resolvidos",
};

const SEVERITY_COLOR: Record<string, string> = {
  HIGH: C.red,
  MEDIUM: C.orange,
  LOW: "#6bb4e8",
};

export const NotificationsPage = () => {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const navigate = useNavigate();

  const { data: all, isLoading } = useNotifications();
  const { data: unread } = useUnreadNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const unreadCount = unread?.length || 0;

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.cowId) navigate(`/cows/${n.cowId}`);
  };

  const notifications = useMemo(() => {
    const base = tab === "unread" ? unread || [] : all || [];
    if (severity === "all") return base;
    return base.filter((n) => n.severity === severity);
  }, [tab, severity, all, unread]);

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Header */}
        <header
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Bell size={34} color={C.green} />
            <div>
              <h1
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: 34,
                  lineHeight: 1,
                  margin: 0,
                  color: C.text,
                  fontWeight: 400,
                }}
              >
                Alertas
              </h1>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: 13,
                  color: unreadCount > 0 ? C.orange : C.muted,
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount} não lido${unreadCount !== 1 ? "s" : ""}`
                  : "Tudo em dia"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${C.border}`,
                background: C.card,
                color: C.muted,
                cursor: "pointer",
              }}
              title="Marcar tudo como lido"
            >
              <CheckCheck size={14} /> Marcar tudo
            </button>
          )}
        </header>

        {/* Filter pills — read status */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(
            [
              ["all", "Todos", all?.length || 0],
              ["unread", "Não lidos", unreadCount],
            ] as [string, string, number][]
          ).map(([val, label, count]) => {
            const active = tab === val;
            return (
              <button
                key={val}
                onClick={() => setTab(val as "all" | "unread")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 16px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  border: `1px solid ${active ? C.green : C.border}`,
                  background: active ? C.green : C.card,
                  color: active ? "var(--primary-on)" : C.muted,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {label}
                <span style={{ opacity: active ? 0.75 : 0.55, fontSize: 11 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Filter pills — severity */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["all", "HIGH", "MEDIUM", "LOW"] as SeverityFilter[]).map((sev) => {
            const active = severity === sev;
            const accentColor = sev === "all" ? C.muted : SEVERITY_COLOR[sev];
            return (
              <button
                key={sev}
                onClick={() => setSeverity(sev)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  border: `1px solid ${active ? accentColor : C.border}`,
                  background: active ? `${accentColor}22` : C.card,
                  color: active ? accentColor : C.muted,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {sev !== "all" && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: accentColor,
                      flexShrink: 0,
                    }}
                  />
                )}
                {SEVERITY_LABEL[sev]}
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
          <div
            style={{
              ...cardStyle,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              padding: 48,
              textAlign: "center",
            }}
          >
            <Check size={36} color={C.green} />
            <p style={{ margin: 0, fontSize: 14, color: C.muted }}>
              {tab === "unread" ? "Você está em dia!" : "Sem notificações"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map((n) => {
              const color = (n.type && TYPE_COLOR[n.type]) ?? "var(--border-subtle)";
              return (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    ...cardStyle,
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: 16, cursor: n.cowId ? "pointer" : "default", textAlign: "left",
                    borderLeft: `4px solid ${color}`,
                    opacity: n.read ? 0.65 : 1,
                    borderRadius: 12,
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
                        color: C.text,
                      }}
                    >
                      {n.title}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{n.message}</p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 10, color: C.muted }}>{timeAgo(n.createdAt)}</span>
                    {!n.read && (
                      <span
                        style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }}
                      />
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
