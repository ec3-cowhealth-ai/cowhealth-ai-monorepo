import { useNavigate, Outlet } from "react-router-dom";
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";
import { AppBar } from "@components/layout";
import { EmptyState } from "@components/common";
import { Lock } from "lucide-react";

export const AccessLayout = () => {
  const navigate = useNavigate();
  const canViewUsers = useHasPermission(PERMISSIONS.VIEW_ANY_USER);

  if (!canViewUsers) {
    return (
      <div className="app-page">
        <AppBar title="Acesso" />
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
