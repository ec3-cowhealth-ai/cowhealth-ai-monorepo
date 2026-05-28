import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Warehouse, Tag, User, ChevronRight, LogOut } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { useMe, useLogout } from "@hooks/useAuth";
import { C, cardStyle } from "@features/dashboard/constants/colors";

const menuItems: { icon: ReactNode; label: string; path: string }[] = [
  { icon: <CowHead size={18} color={C.green} />, label: "Rebanho", path: "/cows" },
  { icon: <Warehouse size={18} color={C.green} />, label: "Fazendas", path: "/farms" },
  { icon: <Tag size={18} color={C.green} />, label: "Coleiras", path: "/collars" },
  { icon: <User size={18} color={C.green} />, label: "Usuários", path: "/access/users" },
];

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const { logout } = useLogout();

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Avatar card */}
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--status-success-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 22,
              fontWeight: 700,
              color: C.green,
              fontFamily: "'Instrument Serif', Georgia, serif",
            }}
          >
            {initial}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: C.text }}>
              {user?.name ?? "—"}
            </p>
            <p style={{ margin: "2px 0 0 0", fontSize: 12, color: C.muted }}>
              {user?.email ?? "—"}
            </p>
            <span
              style={{
                display: "inline-block",
                marginTop: 6,
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 10px",
                borderRadius: 999,
                background: "var(--status-success-bg)",
                color: C.green,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {user?.profile ?? "ADMIN"}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          {menuItems.map((item, idx) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 20px",
                background: C.card,
                border: "none",
                borderBottom: idx < menuItems.length - 1 ? `1px solid ${C.border}` : "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: "var(--status-success-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </div>
              <span style={{ flex: 1, fontSize: 14, color: C.text, fontWeight: 500 }}>
                {item.label}
              </span>
              <ChevronRight size={14} color={C.muted} />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "13px 20px",
            borderRadius: 12,
            background: C.card,
            border: `1px solid ${C.border}`,
            cursor: "pointer",
            color: C.red,
            width: "100%",
          }}
        >
          <LogOut size={18} color={C.red} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Sair</span>
        </button>
      </div>
    </div>
  );
};
