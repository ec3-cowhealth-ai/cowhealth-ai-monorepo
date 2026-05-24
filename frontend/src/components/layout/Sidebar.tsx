import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMe } from "@hooks/useAuth";
import { useUnreadNotifications } from "@hooks/useNotifications";
import { Home, Warehouse, Tag, Bell, ShieldCheck, LogOut } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: number;
}

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useMe();
  const { data: notifications } = useUnreadNotifications();

  const unreadCount = notifications?.length || 0;
  const isAdmin = user?.profile === "ADMIN";

  const navItems: NavItem[] = [
    { label: "Home", path: "/home", icon: <Home size={18} /> },
    { label: "Fazendas", path: "/farms", icon: <Warehouse size={18} /> },
    { label: "Coleiras", path: "/collars", icon: <Tag size={18} /> },
    { label: "Vacas", path: "/cows", icon: <CowHead size={18} /> },
    {
      label: "Notificações",
      path: "/notifications",
      icon: <Bell size={18} />,
      badge: unreadCount,
    },
    ...(isAdmin
      ? [
          {
            label: "Acesso",
            path: "/access/users",
            icon: <ShieldCheck size={18} />,
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
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
            {item.badge ? <span className="badge">{item.badge}</span> : null}
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
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};
