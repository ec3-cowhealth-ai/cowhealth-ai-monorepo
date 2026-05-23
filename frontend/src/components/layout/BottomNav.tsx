import { useLocation, useNavigate } from "react-router-dom";
import { useUnreadNotifications } from "@hooks/useNotifications";
import { Icon } from "@components/ui/Icon";

const NAV_ITEMS = [
  { label: "Início", path: "/home", icon: "home" as const },
  { label: "Rebanho", path: "/cows", icon: "list" as const },
  { label: "Alertas", path: "/notifications", icon: "bell" as const, badge: true },
  { label: "Mapa", path: "/map", icon: "map" as const },
  { label: "Perfil", path: "/profile", icon: "user" as const },
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
              <Icon n={item.icon} s={20} />
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
