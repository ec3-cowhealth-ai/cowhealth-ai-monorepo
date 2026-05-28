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
import { COW_STATUS_VALUES } from "../../../types/cows";
import { C, cardStyle } from "@features/dashboard/constants/colors";

const STATUS_LABEL: Record<string, string> = {
  HEALTHY: "Saudável",
  ALERT: "Alerta",
  HEAT_STRESS: "Est. Térmico",
  CALVING: "Parto",
};

const STATUS_COLOR: Record<string, string> = {
  HEALTHY: C.green,
  ALERT: C.red,
  HEAT_STRESS: C.orange,
  CALVING: "#6bb4e8",
};

const STATUS_BG: Record<string, string> = {
  HEALTHY: "#e6f1ea",
  ALERT: "#fde8e4",
  HEAT_STRESS: "#fbe9d8",
  CALVING: "#e4f0fb",
};

const statusTone = (s: string) => {
  if (s === COW_STATUS_VALUES.ALERT) return "danger" as const;
  if (s === COW_STATUS_VALUES.HEAT_STRESS) return "warn" as const;
  if (s === COW_STATUS_VALUES.CALVING) return "info" as const;
  return "success" as const;
};

const NOTIF_COLOR: Record<string, string> = {
  ALERT: C.red,
  WARNING: C.orange,
  INFO: "#6bb4e8",
};

export const CowDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sensorTab, setSensorTab] = useState<"temp" | "hr">("temp");

  const { data: cow, isLoading } = useCow(id || "");
  const { data: heartRate }    = useCowHeartRateDaily(id || "");
  const { data: temperature }  = useCowTemperatureDaily(id || "");
  const { data: notifications } = useNotifications();

  const cowNotifs = notifications?.filter((n) => n.cowId === id).slice(0, 5) || [];

  if (isLoading) {
    return (
      <div style={{ background: C.bg, minHeight: "100%" }}>
        <AppBar title="Detalhes" showBack />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: 48 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!cow) {
    return (
      <div style={{ background: C.bg, minHeight: "100%" }}>
        <AppBar title="Detalhes" showBack />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, color: C.muted }}>
          <AlertTriangle size={36} color={C.muted} />
          <p style={{ margin: 0 }}>Vaca não encontrada</p>
        </div>
      </div>
    );
  }

  const tone     = statusTone(cow.status);
  const sColor   = STATUS_COLOR[cow.status] ?? C.green;
  const sBg      = STATUS_BG[cow.status]    ?? "#e6f1ea";
  const sLabel   = STATUS_LABEL[cow.status] ?? cow.status;

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      <AppBar title={cow.tag} subtitle={cow.name} showBack />

      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Hero card */}
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: sBg,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <CowHead size={32} color={sColor} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <StatusDot tone={tone} pulse={cow.status === COW_STATUS_VALUES.ALERT} />
              <span style={{ fontSize: 13, fontWeight: 600, color: sColor }}>{sLabel}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {cow.farm && (
                <button
                  onClick={() => navigate(`/farms/${cow.farm.id}`)}
                  style={{
                    padding: "3px 10px", background: sBg,
                    border: `1px solid ${C.border}`, borderRadius: 12,
                    fontSize: 11, color: sColor, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <Warehouse size={11} /> {cow.farm.name}
                </button>
              )}
              {cow.collar && (
                <button
                  onClick={() => navigate(`/collars/${cow.collar!.id}`)}
                  style={{
                    padding: "3px 10px", background: "#f0f0ee",
                    border: `1px solid ${C.border}`, borderRadius: 12,
                    fontSize: 11, color: C.muted, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <Tag size={11} /> {cow.collar.name}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {cow.breed && (
            <div style={{ ...cardStyle, padding: 16, textAlign: "center" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Raça</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>{cow.breed}</p>
            </div>
          )}
          {cow.weight && (
            <div style={{ ...cardStyle, padding: 16, textAlign: "center" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Peso</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>
                {cow.weight}<span style={{ fontSize: 11, color: C.muted }}> kg</span>
              </p>
            </div>
          )}
          {cow.birthDate && (
            <div style={{ ...cardStyle, padding: 16, textAlign: "center" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nascimento</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>
                {new Date(cow.birthDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </div>

        {/* Sensor charts */}
        {(temperature?.length || heartRate?.length) ? (
          <div style={{ ...cardStyle }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["temp", "hr"] as const).map((tab) => {
                const active = sensorTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setSensorTab(tab)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 14px", borderRadius: 999, fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      border: `1px solid ${active ? C.green : C.border}`,
                      background: active ? C.green : "#fff",
                      color: active ? "#fff" : C.muted,
                      cursor: "pointer",
                    }}
                  >
                    {tab === "temp" ? <Thermometer size={12} /> : <Heart size={12} />}
                    {tab === "temp" ? "Temperatura" : "Freq. Cardíaca"}
                  </button>
                );
              })}
            </div>

            {sensorTab === "temp" && temperature && (
              <LineChart
                data={temperature}
                color={C.orange}
                unit="°C"
                thresholds={[{ v: 39.5, c: C.red }, { v: 38.0, c: "#6bb4e8" }]}
              />
            )}
            {sensorTab === "hr" && heartRate && (
              <LineChart
                data={heartRate}
                color={C.red}
                unit=" bpm"
                thresholds={[{ v: 120, c: C.red }, { v: 40, c: "#6bb4e8" }]}
              />
            )}
          </div>
        ) : null}

        {/* Recent notifications */}
        {cowNotifs.length > 0 && (
          <div>
            <p style={{ margin: "0 0 10px 0", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Notificações recentes
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cowNotifs.map((n) => {
                const nColor = NOTIF_COLOR[n.type] ?? C.muted;
                return (
                  <div
                    key={n.id}
                    style={{
                      ...cardStyle, padding: 14,
                      borderLeft: `3px solid ${nColor}`,
                      borderRadius: 10,
                    }}
                  >
                    <p style={{ margin: "0 0 2px 0", fontSize: 13, fontWeight: 600, color: C.text }}>{n.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{n.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
