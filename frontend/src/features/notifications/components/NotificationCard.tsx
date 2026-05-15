import { useNavigate } from "react-router-dom";
import type { Notification } from "@hooks/useNotifications";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: () => void;
}

const getTimeAgo = (date: string) => {
  const now = new Date();
  const created = new Date(date);
  const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (seconds < 60) return "agora";
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
  return `há ${Math.floor(seconds / 86400)}d`;
};

const getIcon = (type: string) => {
  const icons: Record<string, string> = {
    alert: "⚠️",
    warning: "🔔",
    info: "ℹ️",
    error: "❌",
  };
  return icons[type] || "📢";
};

export const NotificationCard = ({
  notification,
  onMarkAsRead,
}: NotificationCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead();
    }
    if (notification.cowId) {
      navigate(`/cows/${notification.cowId}`);
    }
  };

  return (
    <div
      className="card"
      style={{
        cursor: notification.cowId ? "pointer" : "default",
        opacity: notification.read ? 0.7 : 1,
        borderLeft: `4px solid ${notification.read ? "var(--border)" : "var(--primary)"}`,
      }}
      onClick={handleClick}
    >
      <div style={{ display: "flex", gap: "var(--s-3)" }}>
        <div style={{ fontSize: "24px", flexShrink: 0 }}>
          {getIcon(notification.type)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-body)", fontWeight: 600 }}>
            {notification.title}
          </h4>
          <p style={{ margin: "0 0 var(--s-2) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
            {notification.message}
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
            {getTimeAgo(notification.createdAt)}
            {notification.cowId && " • Clique para ver vaca"}
          </p>
        </div>

        {!notification.read && (
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--primary)",
              flexShrink: 0,
              marginTop: "var(--s-2)",
            }}
          />
        )}
      </div>
    </div>
  );
};
