interface MapLegendProps {
  okCount: number;
  heatStressCount: number;
  calvingCount: number;
  alertCount: number;
}

export const MapLegend = ({
  okCount,
  heatStressCount,
  calvingCount,
  alertCount,
}: MapLegendProps) => {
  const items = [
    { label: "Saudável", count: okCount, color: "#22c55e" },
    { label: "Est. Térmico", count: heatStressCount, color: "#f59e0b" },
    { label: "Parto", count: calvingCount, color: "#6bb4e8" },
    { label: "Alerta", count: alertCount, color: "#ef4444" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        right: 16,
        zIndex: 10,
        background: "var(--bg-elev-2)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {items.map((x) => (
        <span
          key={x.label}
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            fontSize: 11,
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: x.color,
              flexShrink: 0,
            }}
          />
          {x.label} · {x.count}
        </span>
      ))}
    </div>
  );
};
