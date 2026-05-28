import { Warehouse } from "lucide-react";
import type { Farm } from "../../../types/farms.ts";
import { C, cardStyle } from "@features/dashboard/constants/colors";

interface FarmCardProps {
  farm: Farm;
  onClick: () => void;
}

export const FarmCard = ({ farm, onClick }: FarmCardProps) => {
  return (
    <div
      onClick={onClick}
      style={{ ...cardStyle, cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "#e6f1ea",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Warehouse size={18} color={C.green} />
        </div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>{farm.name}</h3>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
        CNPJ: {farm.cnpj}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
        {farm.city}, {farm.state}
      </p>
    </div>
  );
};
