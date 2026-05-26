import { CowStatusBadgeComponent } from "./CowStatusBadge";
import type { Cow } from "../../../types/cows.ts";

interface CowCardProps {
  cow: Cow;
  onClick: () => void;
}

export const CowCard = ({ cow, onClick }: CowCardProps) => {
  return (
    <div className="card card--clickable" onClick={onClick} style={{ cursor: "pointer" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "var(--s-2)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>{cow.tag}</h3>
        <CowStatusBadgeComponent status={cow.status} />
      </div>

      <p
        style={{
          margin: "0 0 var(--s-1) 0",
          fontSize: "var(--t-sm)",
          color: "var(--text-secondary)",
        }}
      >
        {cow.name}
      </p>

      {cow.breed && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--t-sm)",
            color: "var(--text-secondary)",
          }}
        >
          {cow.breed}
        </p>
      )}
    </div>
  );
};
