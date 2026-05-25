import { StatusDot } from "@components/ui/StatusDot";

interface MapLegendProps {
  okCount: number;
  warnCount: number;
  alertCount: number;
}

export const MapLegend = ({ okCount, warnCount, alertCount }: MapLegendProps) => (
  <div
    style={{
      position: "absolute",
      top: 120,
      right: 16,
      zIndex: 10,
      background: "rgba(19,21,21,0.85)",
      backdropFilter: "blur(12px)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "8px 10px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}
  >
    {[
      { l: `OK · ${okCount}`, tone: "success" as const },
      { l: `Atenção · ${warnCount}`, tone: "warn" as const },
      { l: `Críticas · ${alertCount}`, tone: "danger" as const },
    ].map((x) => (
      <span
        key={x.l}
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          fontSize: 11,
          color: "var(--text-secondary)",
        }}
      >
        <StatusDot tone={x.tone} />
        {x.l}
      </span>
    ))}
  </div>
);
