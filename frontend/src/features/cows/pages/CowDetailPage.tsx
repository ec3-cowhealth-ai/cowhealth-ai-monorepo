import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner } from "@components/common";
import { AlertTriangle, Warehouse, Tag, Thermometer, Heart } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { StatusDot } from "@components/ui/StatusDot";
import { LineChart } from "@components/ui/LineChart";
import { useCow, useCowHeartRateDaily, useCowTemperatureDaily } from "../hooks/useCows";
import { useNotifications } from "@hooks/useNotifications";
import { CowStatusValues } from "../../../types/cows";

const STATUS_LABEL: Record<string, string> = {
  HEALTHY: "Saudável",
  ALERT: "Alerta",
  HEAT_STRESS: "Est. Térmico",
  CALVING: "Parto",
};

const statusTone = (s: string) => {
  if (s === CowStatusValues.ALERT) return "danger" as const;
  if (s === CowStatusValues.HEAT_STRESS) return "warn" as const;
  if (s === CowStatusValues.CALVING) return "info" as const;
  return "success" as const;
};

const statusColor = (s: string) => {
  if (s === CowStatusValues.ALERT) return "var(--danger)";
  if (s === CowStatusValues.HEAT_STRESS) return "var(--warning)";
  if (s === CowStatusValues.CALVING) return "var(--info)";
  return "var(--success)";
};

const NOTIF_TONE: Record<string, string> = {
  ALERT: "var(--danger)",
  WARNING: "var(--warning)",
  INFO: "var(--info)",
};

export const CowDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sensorTab, setSensorTab] = useState<"temp" | "hr">("temp");

  const { data: cow, isLoading } = useCow(id || "");
  const { data: heartRate } = useCowHeartRateDaily(id || "");
  const { data: temperature } = useCowTemperatureDaily(id || "");
  const { data: notifications } = useNotifications();

  const cowNotifs = notifications?.filter((n) => n.cowId === id).slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes" showBack />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!cow) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes" showBack />
        <div className="home-empty">
          <AlertTriangle size={36} color="var(--text-muted)" />
          <p>Vaca não encontrada</p>
        </div>
      </div>
    );
  }

  const tone = statusTone(cow.status);

  return (
    <div className="app-page">
      <AppBar
        title={cow.tag}
        subtitle={cow.name}
        showBack
      />

      <div className="app-content">
        {/* Hero card */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--bg-elev-2)", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <CowHead size={32} color={statusColor(cow.status)} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <StatusDot tone={tone} pulse={cow.status === CowStatusValues.ALERT} />
              <span style={{ fontSize: 13, fontWeight: 600, color: `var(--${tone === "warn" ? "warning" : tone === "success" ? "success" : tone === "info" ? "info" : "danger"})` }}>
                {STATUS_LABEL[cow.status] ?? cow.status}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {cow.farm && (
                <button
                  style={{ padding: "3px 8px", background: "var(--bg-elev-2)", border: "1px solid var(--border-subtle)", borderRadius: 12, fontSize: 11, color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  onClick={() => navigate(`/farms/${cow.farm.id}`)}
                >
                  <Warehouse size={11} /> {cow.farm.name}
                </button>
              )}
              {cow.collar && (
                <button
                  style={{ padding: "3px 8px", background: "var(--bg-elev-2)", border: "1px solid var(--border-subtle)", borderRadius: 12, fontSize: 11, color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  onClick={() => navigate(`/collars/${cow.collar!.id}`)}
                >
                  <Tag size={11} /> {cow.collar.name}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Metrics grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {cow.breed && (
            <div className="kpi-card">
              <p className="kpi-card__label">Raça</p>
              <p className="kpi-card__value" style={{ fontSize: 14 }}>{cow.breed}</p>
            </div>
          )}
          {cow.weight && (
            <div className="kpi-card">
              <p className="kpi-card__label">Peso</p>
              <p className="kpi-card__value">{cow.weight}<span className="kpi-card__unit">kg</span></p>
            </div>
          )}
          {cow.birthDate && (
            <div className="kpi-card">
              <p className="kpi-card__label">Nascimento</p>
              <p className="kpi-card__value" style={{ fontSize: 13 }}>
                {new Date(cow.birthDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </div>

        {/* Sensor charts */}
        {(temperature?.length || heartRate?.length) ? (
          <div className="card">
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button
                className={`filter-chip${sensorTab === "temp" ? " is-active" : ""}`}
                onClick={() => setSensorTab("temp")}
              >
                <Thermometer size={12} /> Temperatura
              </button>
              <button
                className={`filter-chip${sensorTab === "hr" ? " is-active" : ""}`}
                onClick={() => setSensorTab("hr")}
              >
                <Heart size={12} /> Freq. Cardíaca
              </button>
            </div>

            {sensorTab === "temp" && temperature && (
              <LineChart
                data={temperature}
                color="var(--warning)"
                unit="°C"
                thresholds={[{ v: 39.5, c: "var(--danger)" }, { v: 38.0, c: "var(--info)" }]}
              />
            )}
            {sensorTab === "hr" && heartRate && (
              <LineChart
                data={heartRate}
                color="var(--danger)"
                unit=" bpm"
                thresholds={[{ v: 120, c: "var(--danger)" }, { v: 40, c: "var(--info)" }]}
              />
            )}
          </div>
        ) : null}

        {/* Recent notifications */}
        {cowNotifs.length > 0 && (
          <div>
            <p style={{ margin: "0 0 8px 0", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)" }}>
              Notificações Recentes
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cowNotifs.map((n) => (
                <div
                  key={n.id}
                  className="alert-card"
                  style={{ borderLeftColor: NOTIF_TONE[n.type] ?? "var(--border-subtle)" }}
                >
                  <div>
                    <p style={{ margin: "0 0 2px 0", fontSize: 12, fontWeight: 600 }}>{n.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
