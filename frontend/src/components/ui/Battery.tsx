interface BatteryProps {
  pct?: number;
  mini?: boolean;
}

export const Battery = ({ pct = 78, mini }: BatteryProps) => {
  const tone = pct < 20 ? "var(--danger)" : pct < 40 ? "var(--warning)" : "var(--accent)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "var(--font-mono)",
        fontSize: mini ? 10 : 11,
        color: "var(--text-secondary)",
      }}
    >
      <span
        style={{
          position: "relative",
          width: 18,
          height: 9,
          border: "1px solid var(--border-strong)",
          borderRadius: 2,
          padding: 1,
          display: "inline-block",
        }}
      >
        <span
          style={{
            display: "block",
            width: `${pct}%`,
            height: "100%",
            background: tone,
            borderRadius: 1,
          }}
        />
        <span
          style={{
            position: "absolute",
            right: -3,
            top: 2,
            width: 2,
            height: 3,
            background: "var(--border-strong)",
            borderRadius: 1,
          }}
        />
      </span>
      {pct}%
    </span>
  );
};
