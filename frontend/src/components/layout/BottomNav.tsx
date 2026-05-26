import { useLocation, useNavigate } from "react-router-dom";
import { useUnreadNotifications } from "@hooks/useNotifications";
import { Home, List, Bell, Map, User } from "lucide-react";
import type { ReactNode } from "react";

const NAV_ITEMS: {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: boolean;
}[] = [
  { label: "Início", path: "/home", icon: <Home size={20} /> },
  { label: "Rebanho", path: "/cows", icon: <List size={20} /> },
  {
    label: "Alertas",
    path: "/notifications",
    icon: <Bell size={20} />,
    badge: true,
  },
  { label: "Mapa", path: "/map", icon: <Map size={20} /> },
  { label: "Perfil", path: "/profile", icon: <User size={20} /> },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: notifications } = useUnreadNotifications();
  const unreadCount = notifications?.length || 0;

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        const badgeCount = item.badge ? unreadCount : 0;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`bottom-nav__item${active ? " is-active" : ""}`}
          >
            <span className="bottom-nav__indicator" />
            <span style={{ position: "relative" }}>
              {item.icon}
              {badgeCount > 0 && (
                <span className="bottom-nav__badge">{badgeCount > 9 ? "9+" : badgeCount}</span>
              )}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
