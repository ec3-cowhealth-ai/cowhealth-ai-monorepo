import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { List, Warehouse, Tag, User, ChevronRight, LogOut } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { useMe, useLogout } from "@hooks/useAuth";

const menuItems: { icon: ReactNode; label: string; path: string }[] = [
  { icon: <List size={18} color="var(--text-secondary)" />, label: "Rebanho", path: "/cows" },
  { icon: <Warehouse size={18} color="var(--text-secondary)" />, label: "Fazendas", path: "/farms" },
  { icon: <Tag size={18} color="var(--text-secondary)" />, label: "Coleiras", path: "/collars" },
  { icon: <User size={18} color="var(--text-secondary)" />, label: "Usuários", path: "/access/users" },
];

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const { logout } = useLogout();

  return (
    <div className="app-page">
      <AppBar title="Perfil" />

      <div className="app-content">
        {/* Avatar card */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "var(--bg-elev-2)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <CowHead size={30} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{user?.name ?? "—"}</p>
            <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "var(--text-muted)" }}>{user?.email ?? "—"}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "var(--verdigris)", fontWeight: 600 }}>
              {user?.profile ?? "ADMIN"}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", background: "var(--bg-elev-1)",
                border: "none", borderRadius: 8, cursor: "pointer",
                color: "var(--text-primary)", textAlign: "left",
              }}
            >
              {item.icon}
              <span style={{ flex: 1, fontSize: 14 }}>{item.label}</span>
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", background: "transparent",
            border: "1px solid var(--border-subtle)", borderRadius: 8,
            cursor: "pointer", color: "var(--danger)", width: "100%",
            marginTop: 8,
          }}
        >
          <LogOut size={18} color="var(--danger)" />
          <span style={{ fontSize: 14 }}>Sair</span>
        </button>
      </div>
    </div>
  );
};
