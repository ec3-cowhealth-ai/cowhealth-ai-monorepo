import type { Farm } from "../../../types/farms.ts";

interface FarmCardProps {
  farm: Farm;
  onClick: () => void;
}

export const FarmCard = ({ farm, onClick }: FarmCardProps) => {
  return (
    <div
      className="card card--clickable"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <h3 style={{ margin: "0 0 var(--s-2) 0", fontSize: "var(--t-body)", fontWeight: 600 }}>
        {farm.name}
      </h3>
      <p style={{ margin: "0 0 var(--s-1) 0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
        <strong>CNPJ:</strong> {farm.cnpj}
      </p>
      <p style={{ margin: "0", fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
        <strong>{farm.city}</strong>, {farm.state}
      </p>
    </div>
  );
};
