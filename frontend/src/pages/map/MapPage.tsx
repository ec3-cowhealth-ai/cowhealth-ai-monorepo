import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { Icon } from "@components/ui/Icon";
import { CowMark } from "@components/ui/CowMark";
import { StatusDot } from "@components/ui/StatusDot";
import { useCows } from "@features/cows/hooks/useCows";
import { useFarmContext } from "../../context/FarmContext";
import { CowStatusValues } from "../../types/cows";
import type { Cow } from "../../types/cows";
import { FARM_LAYOUTS } from "./farmLayouts";

const PIN_COLORS = {
  success: "var(--accent)",
  warn: "var(--warning)",
  danger: "var(--danger)",
  neutral: "var(--text-muted)",
};

export const MapPage = () => {
  const navigate = useNavigate();
  const { selectedFarm, farms, setSelectedFarm } = useFarmContext();
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);

  const farmId = selectedFarm ? String(selectedFarm.id) : undefined;
  const { data: cows = [] } = useCows({ farmId });

  // Índice da fazenda para determinar o layout (0-4 ciclicamente)
  const farmIndex = farms.findIndex((f) => f.id === selectedFarm?.id);
  const layout = FARM_LAYOUTS[farmIndex >= 0 ? farmIndex % FARM_LAYOUTS.length : 0];

  const alertCows = cows.filter((c: Cow) => c.status === CowStatusValues.ALERT);
  const warnCows = cows.filter((c: Cow) =>
    c.status === CowStatusValues.HEAT_STRESS || c.status === CowStatusValues.CALVING
  );
  const okCount = cows.filter((c: Cow) => c.status === CowStatusValues.HEALTHY).length;

  // Distribui vacas reais sobre os pins padrão do layout
  const pins = layout.defaultPins.map((pin, i) => {
    const cow = cows[i] as Cow | undefined;
    let tone: "success" | "warn" | "danger" | "neutral" = "success";
    if (cow?.status === CowStatusValues.ALERT) tone = "danger";
    else if (cow?.status === CowStatusValues.HEAT_STRESS || cow?.status === CowStatusValues.CALVING) tone = "warn";
    return { ...pin, tone, cow };
  });

  return (
    <div className="app-page" style={{ padding: 0, position: "relative", overflow: "hidden" }}>
      {/* Mapa full-bleed */}
      <div style={{ position: "absolute", inset: 0 }}>
        <svg
          viewBox={layout.viewBox}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          style={{ display: "block" }}
        >
          <defs>
            <pattern id="topo" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 Q15 20 30 30 T60 30" stroke="rgba(125,226,209,0.06)" fill="none" />
              <path d="M0 50 Q15 42 30 50 T60 50" stroke="rgba(125,226,209,0.04)" fill="none" />
            </pattern>
            <radialGradient id="vig" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(43,44,40,0)" />
              <stop offset="100%" stopColor="rgba(11,13,13,0.65)" />
            </radialGradient>
          </defs>

          {/* Fundo */}
          <rect width="100%" height="100%" fill="#0F1311" />
          <rect width="100%" height="100%" fill="url(#topo)" />

          {/* Zonas */}
          {layout.zones.map((zone, i) => (
            <g key={i}>
              <polygon
                points={zone.points}
                fill={zone.fill}
                stroke={zone.stroke}
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              <text
                x={zone.labelX}
                y={zone.labelY}
                fontSize="11"
                fontFamily="var(--font-mono)"
                fill={`rgba(255,250,251,${zone.tone === "warn" ? "0.65" : zone.tone === "danger" ? "0.7" : "0.45"})`}
                textAnchor="middle"
              >
                {zone.label}
              </text>
            </g>
          ))}

          {/* Vias */}
          {layout.roads.map((road, i) => (
            <path
              key={i}
              d={road.d}
              stroke="rgba(255,250,251,0.07)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* Vinheta */}
          <rect width="100%" height="100%" fill="url(#vig)" />
        </svg>

        {/* Pins de vaca (sobre o SVG via div absoluto) */}
        {pins.map((pin, i) => {
          const color = PIN_COLORS[pin.tone];
          const isSelected = selectedCow?.id === pin.cow?.id;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: "translate(-50%,-50%)",
                zIndex: 5,
                cursor: pin.cow ? "pointer" : "default",
              }}
              onClick={() => pin.cow && setSelectedCow(isSelected ? null : pin.cow)}
            >
              <div style={{ position: "relative", width: 28, height: 28 }}>
                {pin.tone !== "success" && (
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 99,
                    background: color, opacity: 0.22,
                    animation: "cowPulse 1.8s ease-out infinite",
                  }} />
                )}
                <div style={{
                  position: "absolute", inset: isSelected ? 2 : 5,
                  borderRadius: 99, background: color,
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--font-mono)", fontSize: 9,
                  fontWeight: 700,
                  color: "var(--text-inverse)",
                  border: isSelected ? `2px solid #fff` : "none",
                  transition: "inset 0.15s ease",
                }}>
                  {pin.label ?? (pin.cow ? "·" : "")}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de cima — AppBar */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <AppBar
          title={selectedFarm?.name ?? "Mapa"}
          subtitle="Mapa da Fazenda"
          showBack={false}
          left={undefined}
          actions={undefined}
        />
      </div>

      {/* Search + filtro */}
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
        {/* Seletor de fazenda */}
        <button
          style={{
            height: 44, borderRadius: 12, paddingInline: 12,
            background: "rgba(19,21,21,0.85)", backdropFilter: "blur(12px)",
            border: "1px solid var(--border)", color: "var(--text-primary)",
            display: "flex", alignItems: "center", gap: 6, fontSize: 12,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
          onClick={() => {
            const idx = farms.findIndex((f) => f.id === selectedFarm?.id);
            const next = farms[(idx + 1) % farms.length];
            if (next) setSelectedFarm(next);
          }}
        >
          <Icon n="chevronRight" s={14} />
          Próxima
        </button>
      </div>

      {/* Legenda */}
      <div style={{
        position: "absolute", top: 120, right: 16, zIndex: 10,
        background: "rgba(19,21,21,0.85)", backdropFilter: "blur(12px)",
        border: "1px solid var(--border)", borderRadius: 10,
        padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6,
      }}>
        {[
          { l: `OK · ${okCount}`, tone: "success" as const },
          { l: `Atenção · ${warnCows.length}`, tone: "warn" as const },
          { l: `Críticas · ${alertCows.length}`, tone: "danger" as const },
        ].map((x) => (
          <span key={x.l} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: "var(--text-secondary)" }}>
            <StatusDot tone={x.tone} />
            {x.l}
          </span>
        ))}
      </div>

      {/* Card da vaca selecionada */}
      {selectedCow && (
        <div style={{
          position: "absolute", bottom: 80, left: 16, right: 16, zIndex: 10,
          background: "rgba(19,21,21,0.92)", backdropFilter: "blur(20px)",
          border: "1px solid var(--border)", borderRadius: 16, padding: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "var(--bg-elev-2)", display: "grid",
              placeItems: "center", position: "relative",
            }}>
              <CowMark s={26} primary={selectedCow.status === CowStatusValues.ALERT ? "var(--danger)" : "var(--verdigris)"} />
              <span style={{ position: "absolute", bottom: -2, right: -2 }}>
                <StatusDot
                  tone={selectedCow.status === CowStatusValues.ALERT ? "danger" : selectedCow.status === CowStatusValues.HEALTHY ? "success" : "warn"}
                  pulse={selectedCow.status === CowStatusValues.ALERT}
                />
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{selectedCow.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>#{selectedCow.tag}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {selectedCow.farm?.name}
                {selectedCow.collar && ` · ${selectedCow.collar.name}`}
              </div>
            </div>
            <button
              onClick={() => navigate(`/cows/${selectedCow.id}`)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <Icon n="chevronRight" s={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
