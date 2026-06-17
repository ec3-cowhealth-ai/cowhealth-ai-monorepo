import { useNavigate } from "react-router-dom";
import { CowHead } from "@components/ui/CowHeadIcon";
import { StatusDot } from "@components/ui/StatusDot";
import { Icon } from "@components/ui/Icon";
import { COW_STATUS_VALUES } from "../../types/cows";
import type { Cow } from "../../types/cows";

interface CowDetailCardProps {
  cow: Cow;
  lat: number;
  lng: number;
}

export const CowDetailCard = ({ cow, lat, lng }: CowDetailCardProps) => {
  const navigate = useNavigate();

  const tone =
    cow.status === COW_STATUS_VALUES.ALERT
      ? "danger"
      : cow.status === COW_STATUS_VALUES.HEALTHY
        ? "success"
        : "warn";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 16,
        right: 16,
        zIndex: 10,
        background: "var(--bg-elev-1)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "var(--bg-elev-2)",
            display: "grid",
            placeItems: "center",
            position: "relative",
          }}
        >
          <CowHead
            size={26}
            color={cow.status === COW_STATUS_VALUES.ALERT ? "var(--danger)" : "var(--verdigris)"}
          />
          <span style={{ position: "absolute", bottom: -2, right: -2 }}>
            <StatusDot tone={tone} pulse={cow.status === COW_STATUS_VALUES.ALERT} />
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{cow.name}</div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 1 }}>
            #{cow.tag}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
            {cow.farm?.name}{cow.collar && ` · ${cow.collar.name}`}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1, fontFamily: "var(--font-mono)" }}>
            latitude {lat.toFixed(6)} · longitude {lng.toFixed(6)}
          </div>
        </div>

        <button
          onClick={() => navigate(`/cows/${cow.id}`)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
        >
          <Icon n="chevronRight" s={18} />
        </button>
      </div>
    </div>
  );
};
