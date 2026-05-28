import type { Cow } from "../../types/cows";

type Tone = "success" | "warn" | "danger" | "neutral";

const PIN_COLORS: Record<Tone, string> = {
  success: "var(--accent)",
  warn: "var(--warning)",
  danger: "var(--danger)",
  neutral: "var(--text-muted)",
};

interface CowPinProps {
  x: number;
  y: number;
  tone: Tone;
  label?: string;
  cow?: Cow;
  selected: boolean;
  onClick: () => void;
}

export const CowPin = ({ x, y, tone, label, cow, selected, onClick }: CowPinProps) => {
  const color = PIN_COLORS[tone];

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%,-50%)",
        zIndex: 5,
        cursor: cow ? "pointer" : "default",
      }}
      onClick={cow ? onClick : undefined}
    >
      <div style={{ position: "relative", width: 28, height: 28 }}>
        {tone !== "success" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 99,
              background: color,
              opacity: 0.22,
              animation: "cowPulse 1.8s ease-out infinite",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: selected ? 2 : 5,
            borderRadius: 99,
            background: color,
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            fontWeight: 700,
            color: "var(--text-inverse)",
            border: selected ? "2px solid var(--primary-on)" : "none",
            transition: "inset 0.15s ease",
          }}
        >
          {label ?? (cow ? "·" : "")}
        </div>
      </div>
    </div>
  );
};
