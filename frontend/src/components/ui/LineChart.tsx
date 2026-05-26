import type { SensorDailyPoint } from "@/types/cows";

interface ThresholdLine {
  v: number;
  c?: string;
}

interface LineChartProps {
  data: SensorDailyPoint[];
  w?: number;
  h?: number;
  yMin?: number;
  yMax?: number;
  thresholds?: ThresholdLine[];
  color?: string;
  unit?: string;
}

export const LineChart = ({
  data,
  w = 320,
  h = 140,
  yMin,
  yMax,
  thresholds = [],
  color = "var(--accent)",
  unit = "",
}: LineChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        Sem dados disponíveis
      </div>
    );
  }

  const values = data.map((d) => d.average);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const computedMin = yMin ?? Math.floor(minVal - 1);
  const computedMax = yMax ?? Math.ceil(maxVal + 1);
  const range = computedMax - computedMin || 1;

  const pad = { l: 36, r: 8, t: 8, b: 24 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;

  const xs = (i: number) => pad.l + (data.length > 1 ? (i / (data.length - 1)) * iw : iw / 2);
  const ys = (v: number) => pad.t + ih - ((v - computedMin) / range) * ih;

  const pathD = values
    .map((v, i) => `${i ? "L" : "M"} ${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`)
    .join(" ");
  const areaD = `${pathD} L ${xs(values.length - 1).toFixed(1)} ${(pad.t + ih).toFixed(1)} L ${xs(0).toFixed(1)} ${(pad.t + ih).toFixed(1)} Z`;

  // derive a safe CSS id from color string
  const gradId = `lcg${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  const yTicks = 4;

  // which x-labels to show (at most 5)
  const step = Math.ceil(data.length / 5);
  const labelIndices = new Set<number>();
  for (let i = 0; i < data.length; i += step) labelIndices.add(i);
  labelIndices.add(data.length - 1);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={w} height={h} fill="var(--bg-elev-1)" rx="8" />

      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const y = pad.t + (ih * i) / yTicks;
        const v = computedMax - (range * i) / yTicks;
        return (
          <g key={i}>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeDasharray="2 4"
            />
            <text
              x={pad.l - 4}
              y={y + 3}
              textAnchor="end"
              fontSize="9"
              fill="var(--text-muted)"
              fontFamily="var(--font-mono)"
            >
              {v.toFixed(1)}
              {unit}
            </text>
          </g>
        );
      })}

      {thresholds.map((t, i) => (
        <line
          key={i}
          x1={pad.l}
          x2={w - pad.r}
          y1={ys(t.v)}
          y2={ys(t.v)}
          stroke={t.c ?? "var(--danger)"}
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.6"
        />
      ))}

      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {values.map((v, i) => (
        <circle key={i} cx={xs(i)} cy={ys(v)} r="2.4" fill={color} />
      ))}

      {data.map((d, i) =>
        labelIndices.has(i) ? (
          <text
            key={i}
            x={xs(i)}
            y={h - 4}
            textAnchor="middle"
            fontSize="9"
            fill="var(--text-muted)"
            fontFamily="var(--font-mono)"
          >
            {d.date}
          </text>
        ) : null,
      )}
    </svg>
  );
};
