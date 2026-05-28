import { useNavigate, Outlet } from "react-router-dom";
import { useMe } from "@hooks/useAuth";
import { EmptyState } from "@components/common";
import { Lock, ShieldCheck } from "lucide-react";
import { C } from "@features/dashboard/constants/colors";

export const AccessLayout = () => {
  const navigate = useNavigate();
  const { data: user } = useMe();

  const isAdmin = user?.profile === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="app-page">
        <EmptyState
          icon={<Lock size={40} />}
          title="Acesso Negado"
          description="Apenas administradores podem acessar essa área."
          action={
            <button className="btn btn-primary" onClick={() => navigate("/home")}>
              Voltar ao Home
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="app-page">
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ShieldCheck size={34} color={C.green} />
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
            Acesso
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: C.muted }}>
            Usuários, papéis e permissões
          </p>
        </div>
      </header>

      <div className="app-page__section">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tabs__tab ${location.pathname.includes("/users") ? "is-active" : ""}`}
            onClick={() => navigate("/access/users")}
          >
            Usuários
          </button>
          <button
            className={`tabs__tab ${location.pathname.includes("/roles") ? "is-active" : ""}`}
            onClick={() => navigate("/access/roles")}
          >
            Papéis
          </button>
          <button
            className={`tabs__tab ${location.pathname.includes("/permissions") ? "is-active" : ""}`}
            onClick={() => navigate("/access/permissions")}
          >
            Permissões
          </button>
        </div>

        {/* Content */}
        <Outlet />
      </div>
    </div>
  );
};
