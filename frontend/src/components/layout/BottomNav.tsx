import { useLocation, useNavigate } from "react-router-dom";
import { useUnreadNotifications } from "@hooks/useNotifications";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: notifications } = useUnreadNotifications();

  const unreadCount = notifications?.length || 0;

  const navItems = [
    { label: "Home", path: "/home", icon: "🏠" },
    { label: "Vacas", path: "/cows", icon: "🐄" },
    {
      label: "Notif.",
      path: "/notifications",
      icon: "🔔",
      badge: unreadCount,
    },
    { label: "Perfil", path: "/profile", icon: "👤" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`bottom-nav__item ${
            isActive(item.path) ? "is-active" : ""
          }`}
        >
          <span className="bottom-nav__icon">{item.icon}</span>
          <span>{item.label}</span>
          {item.badge ? (
            <span className="bottom-nav__badge">{item.badge}</span>
          ) : null}
        </button>
      ))}
    </nav>
  );
};
