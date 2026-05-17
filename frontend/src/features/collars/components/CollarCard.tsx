import { StatusBadge } from "@components/common";
import type { Collar } from "../../../types/collars.ts";
import { CollarStatusValues } from "../../../types/collars.ts";

interface CollarCardProps {
  collar: Collar;
  onClick: () => void;
}

const getStatusTone = (status: string): "success" | "warning" | "danger" | "muted" => {
  switch (status) {
    case CollarStatusValues.ACTIVE:
      return "success";
    case CollarStatusValues.MAINTENANCE:
      return "warning";
    case CollarStatusValues.BATTERY:
      return "danger";
    default:
      return "muted";
  }
};

const getFrequencyLabel = (freq: string): string => {
  const freqMap: Record<string, string> = {
    HIGHER: "2 min",
    DEFAULT: "10 min",
    LOWER: "60 min",
  };
  return freqMap[freq] || freq;
};

export const CollarCard = ({ collar, onClick }: CollarCardProps) => {
  return (
    <div
      className="card card--clickable"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--s-2)" }}>
        <h3 style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>
          {collar.identifier}
        </h3>
        <StatusBadge tone={getStatusTone(collar.status)}>
          {collar.status}
        </StatusBadge>
      </div>

      <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
        <strong>Frequência:</strong> {getFrequencyLabel(collar.dataFrequency)}
      </p>

      <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
        <strong>Bateria:</strong> {collar.batteryPercentage}%
      </p>

      <p style={{ margin: 0, fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
        <strong>Última sincronização:</strong> {new Date(collar.lastSync).toLocaleDateString()}
      </p>
    </div>
  );
};
