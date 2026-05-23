import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { Icon } from "@components/ui/Icon";
import { StatusDot } from "@components/ui/StatusDot";
import { useDashboardOverview, useCowsPerStatus } from "@features/dashboard/hooks/useDashboard";
import { useFarms } from "@features/farms/hooks/useFarms";

// Static farm positions on the SVG canvas (normalized 0-100)
const FARM_POSITIONS = [
  { key: 0, x: 28, y: 35 },
  { key: 1, x: 60, y: 25 },
  { key: 2, x: 72, y: 55 },
  { key: 3, x: 38, y: 65 },
  { key: 4, x: 18, y: 62 },
];

export const MapPage = () => {
  const navigate = useNavigate();
  const { data: overview } = useDashboardOverview();
  const { data: statusData } = useCowsPerStatus();
  const { data: farms } = useFarms();

  const total = overview?.totalCows ?? 0;
  const alerts = overview?.cowsInAlert ?? 0;
  const collars = overview?.cowsWithCollar ?? 0;

  const getStatus = (i: number) => {
    if (!statusData || i >= statusData.length) return "success" as const;
    const s = statusData[i]?.status;
    if (s === "ALERT") return "danger" as const;
    if (s === "HEAT_STRESS") return "warn" as const;
    if (s === "CALVING") return "info" as const;
    return "success" as const;
  };

  return (
    <div className="app-page">
      <AppBar
        title="Mapa"
        subtitle={`${overview?.totalFarms ?? 0} fazendas`}
      />

      <div className="app-content">
        {/* Map canvas */}
        <div className="card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
          <svg
            viewBox="0 0 100 80"
            width="100%"
            style={{ display: "block", background: "var(--bg-elev-1)" }}
          >
            {/* Background grid */}
            {[20, 40, 60, 80].map((v) => (
              <g key={v}>
                <line x1={v} y1={0} x2={v} y2={80} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                <line x1={0} y1={v} x2={100} y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
              </g>
            ))}

            {/* Region blob */}
            <ellipse cx={50} cy={42} rx={38} ry={28} fill="var(--verdigris)" opacity={0.06} />
            <ellipse cx={50} cy={42} rx={38} ry={28} fill="none" stroke="var(--verdigris)" strokeWidth="0.4" opacity={0.15} />

            {/* Farm pins */}
            {FARM_POSITIONS.map((pos, i) => {
              const farm = farms?.[i];
              const tone = getStatus(i);
              const pinColor =
                tone === "danger" ? "var(--danger)" :
                tone === "warn" ? "var(--warning)" :
                tone === "info" ? "var(--info)" :
                "var(--verdigris)";

              return (
                <g key={pos.key} style={{ cursor: "pointer" }} onClick={() => farm && navigate(`/farms/${farm.id}`)}>
                  {/* Pulse ring */}
                  {tone === "danger" && (
                    <circle cx={pos.x} cy={pos.y} r={5} fill={pinColor} opacity={0.15} />
                  )}
                  <circle cx={pos.x} cy={pos.y} r={3.2} fill={pinColor} opacity={0.9} />
                  <circle cx={pos.x} cy={pos.y} r={1.4} fill="#fff" opacity={0.8} />
                  {/* Label */}
                  {farm && (
                    <text
                      x={pos.x} y={pos.y + 6.5}
                      textAnchor="middle"
                      fontSize="3.2"
                      fill="rgba(255,255,255,0.6)"
                      fontFamily="var(--font-sans)"
                    >
                      {farm.name.length > 12 ? farm.name.slice(0, 12) + "…" : farm.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Compass */}
            <text x={93} y={7} fontSize="4" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="var(--font-mono)">N</text>
            <line x1={93} y1={8.5} x2={93} y2={12} stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          </svg>

          {/* Map legend overlay */}
          <div style={{
            position: "absolute", bottom: 8, left: 8,
            display: "flex", flexDirection: "column", gap: 3,
          }}>
            {[
              { tone: "success" as const, label: "Saudável" },
              { tone: "warn" as const, label: "Estresse" },
              { tone: "danger" as const, label: "Alerta" },
            ].map((item) => (
              <div key={item.tone} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
                <StatusDot tone={item.tone} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          <div className="kpi-card">
            <p className="kpi-card__label">Total</p>
            <p className="kpi-card__value">{total}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-card__label">Alertas</p>
            <p className="kpi-card__value" style={{ color: alerts > 0 ? "var(--danger)" : undefined }}>{alerts}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-card__label">c/ Coleira</p>
            <p className="kpi-card__value">{collars}</p>
          </div>
        </div>

        {/* Farms list */}
        {farms && farms.length > 0 && (
          <div>
            <p style={{ margin: "0 0 8px 0", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)" }}>
              Fazendas
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {farms.map((farm, i) => (
                <button
                  key={farm.id}
                  onClick={() => navigate(`/farms/${farm.id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", background: "var(--bg-elev-1)",
                    border: "none", borderRadius: 8, cursor: "pointer",
                    color: "var(--text-primary)", textAlign: "left",
                  }}
                >
                  <StatusDot tone={getStatus(i)} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{farm.name}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {(farm as { cowCount?: number }).cowCount ?? "—"} vacas
                  </span>
                  <Icon n="chevronRight" s={13} c="var(--text-muted)" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
