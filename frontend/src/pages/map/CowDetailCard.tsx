import { useNavigate } from "react-router-dom";
import { CowMark } from "@components/ui/CowMark";
import { StatusDot } from "@components/ui/StatusDot";
import { Icon } from "@components/ui/Icon";
import { CowStatusValues } from "../../types/cows";
import type { Cow } from "../../types/cows";

interface CowDetailCardProps {
  cow: Cow;
}

export const CowDetailCard = ({ cow }: CowDetailCardProps) => {
  const navigate = useNavigate();

  const tone =
    cow.status === CowStatusValues.ALERT        ? "danger"  :
    cow.status === CowStatusValues.HEALTHY      ? "success" : "warn";

  return (
    <div style={{
      position:       "absolute",
      bottom:         80,
      left:           16,
      right:          16,
      zIndex:         10,
      background:     "rgba(19,21,21,0.92)",
      backdropFilter: "blur(20px)",
      border:         "1px solid var(--border)",
      borderRadius:   16,
      padding:        14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width:        44,
          height:       44,
          borderRadius: 10,
          background:   "var(--bg-elev-2)",
          display:      "grid",
          placeItems:   "center",
          position:     "relative",
        }}>
          <CowMark
            s={26}
            primary={cow.status === CowStatusValues.ALERT ? "var(--danger)" : "var(--verdigris)"}
          />
          <span style={{ position: "absolute", bottom: -2, right: -2 }}>
            <StatusDot tone={tone} pulse={cow.status === CowStatusValues.ALERT} />
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{cow.name}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>#{cow.tag}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {cow.farm?.name}
            {cow.collar && ` · ${cow.collar.name}`}
          </div>
        </div>

        <button
          onClick={() => navigate(`/cows/${cow.id}`)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
        >
          <Icon n="chevronRight" s={18} />
        </button>
      </div>
    </div>
  );
};
