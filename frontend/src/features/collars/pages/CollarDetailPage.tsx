import { useParams, useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState, StatusBadge } from "@components/common";
import { XCircle } from "lucide-react";
import { useCollar } from "../hooks/useCollars";
import { COLLAR_STATUS_VALUES } from "../../../types/collars.ts";

const getStatusTone = (
  status: string,
): "success" | "warning" | "danger" | "muted" => {
  switch (status) {
    case COLLAR_STATUS_VALUES.ACTIVE:
      return "success";
    case COLLAR_STATUS_VALUES.MAINTENANCE:
      return "warning";
    case COLLAR_STATUS_VALUES.BATTERY:
      return "danger";
    default:
      return "muted";
  }
};

export const CollarDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: collar, isLoading } = useCollar(id || "");

  // vaca vinculada ja vem aninhada no objeto collar
  const linkedCow = collar?.cow;

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes do Colar" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!collar) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes do Colar" />
        <EmptyState
          icon={<XCircle size={40} />}
          title="Coleira não encontrada"
        />
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppBar title={collar.name} />

      <div className="app-page__section">
        {/* Collar Info */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--s-3)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "var(--t-h2)", fontWeight: 700 }}>
              {collar.name}
            </h3>
            <StatusBadge tone={getStatusTone(collar.status)}>
              {collar.status}
            </StatusBadge>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--s-3)",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Frequencia de Dados
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                {collar.dataFrequency}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Cadastrado em
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                {new Date(collar.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Linked Cow */}
        <div className="card">
          <h3
            style={{
              margin: "0 0 var(--s-3) 0",
              fontSize: "var(--t-h2)",
              fontWeight: 700,
            }}
          >
            Vaca Vinculada
          </h3>

          {linkedCow ? (
            <div
              style={{
                padding: "var(--s-3)",
                background: "var(--bg-elev-2)",
                borderRadius: "var(--r-md)",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/cows/${linkedCow.id}`)}
            >
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                {linkedCow.tag}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Status: {linkedCow.status}
              </p>
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: "var(--t-sm)",
                color: "var(--text-secondary)",
                fontStyle: "italic",
              }}
            >
              Nenhuma vaca vinculada
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
