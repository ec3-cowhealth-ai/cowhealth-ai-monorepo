import { useState } from "react";
import { AppBar } from "@components/layout";
import { Icon } from "@components/ui/Icon";
import { useCows } from "@features/cows/hooks/useCows";
import { useFarmContext } from "../../context/FarmContext";
import { CowStatusValues } from "../../types/cows";
import type { Cow } from "../../types/cows";
import { FARM_LAYOUTS } from "./farmLayouts";
import { MapBackground } from "./MapBackground";
import { CowPin } from "./CowPin";
import { MapLegend } from "./MapLegend";
import { CowDetailCard } from "./CowDetailCard";

export const MapPage = () => {
  const { selectedFarm, farms, setSelectedFarm } = useFarmContext();
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);

  const farmId = selectedFarm ? String(selectedFarm.id) : undefined;
  const { data: cows = [] } = useCows({ farmId });

  const farmIndex = farms.findIndex((f) => f.id === selectedFarm?.id);
  const layout    = FARM_LAYOUTS[farmIndex >= 0 ? farmIndex % FARM_LAYOUTS.length : 0];

  const alertCows = cows.filter((c: Cow) => c.status === CowStatusValues.ALERT);
  const warnCows  = cows.filter((c: Cow) =>
    c.status === CowStatusValues.HEAT_STRESS || c.status === CowStatusValues.CALVING
  );
  const okCount = cows.filter((c: Cow) => c.status === CowStatusValues.HEALTHY).length;

  const pins = layout.defaultPins.map((pin, i) => {
    const cow = cows[i] as Cow | undefined;
    let tone: "success" | "warn" | "danger" | "neutral" = "success";
    if (cow?.status === CowStatusValues.ALERT)                                                  tone = "danger";
    else if (cow?.status === CowStatusValues.HEAT_STRESS || cow?.status === CowStatusValues.CALVING) tone = "warn";
    return { ...pin, tone, cow };
  });

  const handleNextFarm = () => {
    const idx  = farms.findIndex((f) => f.id === selectedFarm?.id);
    const next = farms[(idx + 1) % farms.length];
    if (next) setSelectedFarm(next);
  };

  return (
    <div className="app-page" style={{ padding: 0, position: "relative", overflow: "hidden" }}>
      <MapBackground layout={layout} />

      {pins.map((pin, i) => (
        <CowPin
          key={i}
          x={pin.x}
          y={pin.y}
          tone={pin.tone}
          label={pin.label}
          cow={pin.cow}
          selected={selectedCow?.id === pin.cow?.id}
          onClick={() => pin.cow && setSelectedCow(selectedCow?.id === pin.cow.id ? null : pin.cow)}
        />
      ))}

      <div style={{ position: "relative", zIndex: 10 }}>
        <AppBar
          title={selectedFarm?.name ?? "Mapa"}
          subtitle="Mapa da Fazenda"
          showBack={false}
          left={undefined}
          actions={undefined}
        />
      </div>

      <div style={{
        position: "absolute", top: 64, left: 0, right: 0, zIndex: 10,
        padding: "8px 16px", display: "flex", gap: 8,
      }}>
        <div style={{
          flex: 1, height: 44, borderRadius: 12,
          background: "rgba(19,21,21,0.85)", backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", padding: "0 14px", gap: 10,
        }}>
          <Icon n="search" s={16} c="var(--text-muted)" />
          <span style={{ flex: 1, fontSize: 14, color: "var(--text-muted)" }}>
            Buscar piquete ou vaca…
          </span>
        </div>

        <button
          style={{
            height: 44, borderRadius: 12, paddingInline: 12,
            background: "rgba(19,21,21,0.85)", backdropFilter: "blur(12px)",
            border: "1px solid var(--border)", color: "var(--text-primary)",
            display: "flex", alignItems: "center", gap: 6, fontSize: 12,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
          onClick={handleNextFarm}
        >
          <Icon n="chevronRight" s={14} />
          Próxima
        </button>
      </div>

      <MapLegend
        okCount={okCount}
        warnCount={warnCows.length}
        alertCount={alertCows.length}
      />

      {selectedCow && <CowDetailCard cow={selectedCow} />}
    </div>
  );
};
