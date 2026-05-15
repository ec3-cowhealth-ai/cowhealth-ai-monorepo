import { useLocation, useNavigate } from "react-router-dom";
import { useMe } from "@hooks/useAuth";
import { useUnreadNotifications } from "@hooks/useNotifications";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useMe();
  const { data: notifications } = useUnreadNotifications();

  const unreadCount = notifications?.length || 0;
  const isAdmin = user?.profile === "ADMIN";

  const navItems = [
    { label: "Home", path: "/home", icon: "🏠" },
    { label: "Fazendas", path: "/farms", icon: "🏡" },
    { label: "Coleiras", path: "/collars", icon: "⌚" },
    { label: "Vacas", path: "/cows", icon: "🐄" },
    {
      label: "Notificações",
      path: "/notifications",
      icon: "🔔",
      badge: unreadCount,
    },
    ...(isAdmin
      ? [{ label: "Acesso", path: "/access/users", icon: "🔐" }]
      : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="sidebar">
      <div className="sidebar__nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`sidebar__nav-item ${
              isActive(item.path) ? "is-active" : ""
            }`}
          >
            <span className="ic">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge ? (
              <span className="badge">{item.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__user" onClick={() => navigate("/profile")}>
          <div className="sidebar__avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{user?.name}</p>
            <p className="sidebar__user-role">{user?.profile}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar__logout"
          title="Logout"
        >
          🚪
        </button>
      </div>
    </nav>
  );
};
