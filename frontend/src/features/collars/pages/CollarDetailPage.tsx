import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState, StatusBadge } from "@components/common";
import { cowsService } from "@services/cowsService";
import { useCollar } from "../hooks/useCollars";
import { CollarStatusValues } from "../../../types/collars.ts";

const getStatusTone = (status: string): "success" | "warning" | "danger" | "muted" => {
  switch (status) {
    case CollarStatusValues.ACTIVE:
      return "success";
    case CollarStatusValues.MAINTENANCE:
      return "warning";
    case CollarStatusValues.BATTERY:
      return "danger";
    default:
      return "muted";
  }
};

export const CollarDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: collar, isLoading } = useCollar(id || "");

  const { data: cows } = useQuery({
    queryKey: ["cows"],
    queryFn: () => cowsService.list(),
    enabled: !!id,
  });

  const linkedCow = cows?.find((c) => c.collarId === id);

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes do Colar" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!collar) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes do Colar" />
        <EmptyState icon="❌" title="Coleira não encontrada" />
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppBar title={collar.identifier} />

      <div className="app-page__section">
        {/* Collar Info */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--s-3)" }}>
            <h3 style={{ margin: 0, fontSize: "var(--t-h2)", fontWeight: 700 }}>
              {collar.identifier}
            </h3>
            <StatusBadge tone={getStatusTone(collar.status)}>
              {collar.status}
            </StatusBadge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
            <div>
              <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                Bateria
              </p>
              <p style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
                {collar.batteryPercentage}%
              </p>
            </div>

            <div>
              <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                Frequência de Dados
              </p>
              <p style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
                {collar.dataFrequency}
              </p>
            </div>

            <div>
              <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                Última Sincronização
              </p>
              <p style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
                {new Date(collar.lastSync).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Linked Cow */}
        <div className="card">
          <h3 style={{ margin: "0 0 var(--s-3) 0", fontSize: "var(--t-h2)", fontWeight: 700 }}>
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
              <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-body)", fontWeight: 600 }}>
                {linkedCow.tag}
              </p>
              <p style={{ margin: 0, fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                Status: {linkedCow.status}
              </p>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "var(--t-sm)", color: "var(--text-secondary)", fontStyle: "italic" }}>
              Nenhuma vaca vinculada
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
