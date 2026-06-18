import { WifiCog } from "lucide-react";
import type { Collar } from "../../../types/collars.ts";
import { COLLAR_STATUS_VALUES } from "../../../types/collars.ts";
import { C, cardStyle } from "@features/dashboard/constants/colors";

interface CollarCardProps {
  collar: Collar;
  onClick: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  [COLLAR_STATUS_VALUES.ACTIVE]: C.green,
  [COLLAR_STATUS_VALUES.MAINTENANCE]: C.orange,
  [COLLAR_STATUS_VALUES.INACTIVE]: C.muted,
};

const STATUS_BG: Record<string, string> = {
  [COLLAR_STATUS_VALUES.ACTIVE]: "var(--status-success-bg)",
  [COLLAR_STATUS_VALUES.MAINTENANCE]: "var(--status-warning-bg)",
  [COLLAR_STATUS_VALUES.INACTIVE]: "var(--bg-elev-2)",
};

const STATUS_LABEL: Record<string, string> = {
  [COLLAR_STATUS_VALUES.ACTIVE]: "Ativa",
  [COLLAR_STATUS_VALUES.MAINTENANCE]: "Manutenção",
  [COLLAR_STATUS_VALUES.INACTIVE]: "Inativa",
};

const FREQ_LABEL: Record<string, string> = {
  HIGHER: "2 min",
  DEFAULT: "10 min",
  LOWER: "60 min",
};

export const CollarCard = ({ collar, onClick }: CollarCardProps) => {
  const sColor = STATUS_COLOR[collar.status] ?? C.muted;
  const sBg = STATUS_BG[collar.status] ?? "var(--bg-elev-2)";
  const sLabel = STATUS_LABEL[collar.status] ?? collar.status;

  return (
    <div
      onClick={onClick}
      style={{ ...cardStyle, cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: sBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <WifiCog size={18} color={sColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>{collar.name}</p>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 999,
              background: sBg,
              color: sColor,
            }}
          >
            {sLabel}
          </span>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
        Frequência: {FREQ_LABEL[collar.dataFrequency] ?? collar.dataFrequency}
      </p>

      <p
        style={{
          margin: "0 0 var(--s-1) 0",
          fontSize: "var(--t-sm)",
          color: "var(--text-secondary)",
        }}
      >
        <strong>Vaca:</strong> {collar.cow ? collar.cow.tag : "Sem vaca vinculada"}
      </p>

      {collar.farm && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--t-xs)",
            color: "var(--accent)",
            fontWeight: 600,
          }}
        >
          {collar.farm.name}
        </p>
      )}
    </div>
  );
};
