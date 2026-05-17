import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState } from "@components/common";
import { SensorChart } from "../components/SensorChart";
import { CowStatusBadgeComponent } from "../components/CowStatusBadge";
import { useCow, useCowHeartRateDaily, useCowTemperatureDaily } from "../hooks/useCows";
import { farmsService } from "@services/farmsService";
import { collarsService } from "@services/collarsService";
import { useNotifications } from "@hooks/useNotifications";

export const CowDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sensorTab, setSensorTab] = useState<"heart-rate" | "temperature">("heart-rate");

  const { data: cow, isLoading } = useCow(id || "");
  const { data: heartRate } = useCowHeartRateDaily(id || "");
  const { data: temperature } = useCowTemperatureDaily(id || "");

  const { data: farm } = useQuery({
    queryKey: ["farms", cow?.farmId],
    queryFn: () => (cow?.farmId ? farmsService.get(cow.farmId) : null),
    enabled: !!cow?.farmId,
  });

  const { data: collar } = useQuery({
    queryKey: ["collars", cow?.collarId],
    queryFn: () => (cow?.collarId ? collarsService.get(cow.collarId) : null),
    enabled: !!cow?.collarId,
  });

  const { data: notifications } = useNotifications();
  const cowNotifications = notifications?.filter((n) => n.cowId === id) || [];

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes da Vaca" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!cow) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes da Vaca" />
        <EmptyState icon="❌" title="Vaca não encontrada" />
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppBar title={cow.tag} />

      <div className="app-page__section">
        {/* Header Card */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "var(--s-3)",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-h1)", fontWeight: 700 }}>
                {cow.tag}
              </h2>
              <p style={{ margin: 0, fontSize: "var(--t-body)", color: "var(--text-secondary)" }}>
                {cow.name}
              </p>
            </div>
            <CowStatusBadgeComponent status={cow.status} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
            {farm && (
              <div
                style={{ cursor: "pointer", padding: "var(--s-2)", background: "var(--bg-elev-2)", borderRadius: "var(--r-md)" }}
                onClick={() => navigate(`/farms/${farm.id}`)}
              >
                <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                  Fazenda
                </p>
                <p style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
                  {farm.name}
                </p>
              </div>
            )}

            {collar && (
              <div
                style={{ cursor: "pointer", padding: "var(--s-2)", background: "var(--bg-elev-2)", borderRadius: "var(--r-md)" }}
                onClick={() => navigate(`/collars/${collar.id}`)}
              >
                <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                  Coleira
                </p>
                <p style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
                  {collar.identifier}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "var(--s-3)",
          }}
        >
          {cow.breed && (
            <div className="kpi-card">
              <p className="kpi-card__label">Raça</p>
              <p className="kpi-card__value" style={{ color: "var(--text-primary)" }}>
                {cow.breed}
              </p>
            </div>
          )}

          {cow.weight && (
            <div className="kpi-card">
              <p className="kpi-card__label">Peso</p>
              <p className="kpi-card__value" style={{ color: "var(--text-primary)" }}>
                {cow.weight}
                <span className="kpi-card__unit">kg</span>
              </p>
            </div>
          )}

          {cow.dateOfBirth && (
            <div className="kpi-card">
              <p className="kpi-card__label">Data de Nascimento</p>
              <p className="kpi-card__value" style={{ color: "var(--text-primary)", fontSize: "var(--t-body)" }}>
                {new Date(cow.dateOfBirth).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </div>

        {/* Sensors */}
        {(heartRate || temperature) && (
          <div className="card">
            <h3 style={{ margin: "0 0 var(--s-3) 0", fontSize: "var(--t-h2)", fontWeight: 700 }}>
              Sensores (Últimos 7 dias)
            </h3>

            <div className="tabs">
              <button
                className={`tabs__tab ${sensorTab === "heart-rate" ? "is-active" : ""}`}
                onClick={() => setSensorTab("heart-rate")}
              >
                Frequência Cardíaca
              </button>
              <button
                className={`tabs__tab ${sensorTab === "temperature" ? "is-active" : ""}`}
                onClick={() => setSensorTab("temperature")}
              >
                Temperatura
              </button>
            </div>

            <div style={{ marginTop: "var(--s-4)" }}>
              {sensorTab === "heart-rate" && heartRate && (
                <SensorChart
                  data={heartRate}
                  title="Frequência Cardíaca"
                  unit="bpm"
                  minThreshold={40}
                  maxThreshold={120}
                />
              )}
              {sensorTab === "temperature" && temperature && (
                <SensorChart
                  data={temperature}
                  title="Temperatura Corporal"
                  unit="°C"
                  minThreshold={38.0}
                  maxThreshold={39.5}
                />
              )}
            </div>
          </div>
        )}

        {/* Recent Notifications */}
        {cowNotifications.length > 0 && (
          <div className="card">
            <h3 style={{ margin: "0 0 var(--s-3) 0", fontSize: "var(--t-h2)", fontWeight: 700 }}>
              Notificações Recentes
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
              {cowNotifications.slice(0, 5).map((notif) => (
                <div key={notif.id} style={{ padding: "var(--s-2)", background: "var(--bg-elev-2)", borderRadius: "var(--r-md)" }}>
                  <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", fontWeight: 600 }}>
                    {notif.title}
                  </p>
                  <p style={{ margin: 0, fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
