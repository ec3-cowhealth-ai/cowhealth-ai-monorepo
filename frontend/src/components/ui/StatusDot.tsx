export type DotTone = "success" | "warn" | "danger" | "muted" | "info";

const TONE_COLORS: Record<DotTone, string> = {
  success: "var(--success)",
  warn: "var(--warning)",
  danger: "var(--danger)",
  muted: "var(--text-muted)",
  info: "var(--info)",
};

interface StatusDotProps {
  tone?: DotTone;
  pulse?: boolean;
}

export const StatusDot = ({ tone = "success", pulse }: StatusDotProps) => {
  const color = TONE_COLORS[tone];
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: 8,
        height: 8,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 99,
          background: color,
        }}
      />
      {pulse && (
        <span
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 99,
            background: color,
            opacity: 0.3,
            animation: "cowPulse 1.6s ease-out infinite",
          }}
        />
      )}
    </span>
  );
};
