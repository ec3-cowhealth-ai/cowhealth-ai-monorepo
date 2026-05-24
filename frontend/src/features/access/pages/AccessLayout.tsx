import { useNavigate, Outlet } from "react-router-dom";
import { useMe } from "@hooks/useAuth";
import { AppBar } from "@components/layout";
import { EmptyState } from "@components/common";
import { Lock } from "lucide-react";

export const AccessLayout = () => {
  const navigate = useNavigate();
  const { data: user } = useMe();

  const isAdmin = user?.profile === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="app-page">
        <AppBar title="Acesso" />
        <EmptyState
          icon={<Lock size={40} />}
          title="Acesso Negado"
          description="Apenas administradores podem acessar essa área."
          action={
            <button
              className="btn btn-primary"
              onClick={() => navigate("/home")}
            >
              Voltar ao Home
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppBar title="Acesso e Permissões" />

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
