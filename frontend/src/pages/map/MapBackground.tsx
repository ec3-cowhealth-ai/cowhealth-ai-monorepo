import type { FarmLayout } from "./farmLayouts";

interface MapBackgroundProps {
  layout: FarmLayout;
}

export const MapBackground = ({ layout }: MapBackgroundProps) => (
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

      <rect width="100%" height="100%" fill="#0F1311" />
      <rect width="100%" height="100%" fill="url(#topo)" />

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

      <rect width="100%" height="100%" fill="url(#vig)" />
    </svg>
  </div>
);
