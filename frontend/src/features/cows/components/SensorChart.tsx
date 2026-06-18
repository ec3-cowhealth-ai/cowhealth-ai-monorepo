import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface SensorChartProps {
  data: Array<{ date: string; average: number }>;
  title: string;
  unit: string;
  minThreshold?: number;
  maxThreshold?: number;
}

export const SensorChart = ({
  data,
  title,
  unit,
  minThreshold,
  maxThreshold,
}: SensorChartProps) => {
  const avgValue =
    data.length > 0
      ? (data.reduce((sum, p) => sum + p.average, 0) / data.length).toFixed(1)
      : "N/A";

  const minValue = data.length > 0 ? Math.min(...data.map((p) => p.average)).toFixed(1) : "N/A";

  const maxValue = data.length > 0 ? Math.max(...data.map((p) => p.average)).toFixed(1) : "N/A";

  // date ja vem formatado como "dd/MM" — usar direto no eixo X
  const chartData = data.map((p) => ({
    label: p.date,
    value: p.average,
  }));

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "var(--s-3)",
      }}
    >
      <h4 style={{ margin: 0, fontSize: "var(--t-body)", fontWeight: 600 }}>{title}</h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--s-2)",
        }}
      >
        <div className="kpi-card">
          <p className="kpi-card__label">Minimo</p>
          <p className="kpi-card__value">
            {minValue}
            <span className="kpi-card__unit">{unit}</span>
          </p>
          {minThreshold && (
            <p className="kpi-card__change kpi-card__change--positive">Limite: {minThreshold}</p>
          )}
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">Media</p>
          <p className="kpi-card__value">
            {avgValue}
            <span className="kpi-card__unit">{unit}</span>
          </p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">Maximo</p>
          <p className="kpi-card__value">
            {maxValue}
            <span className="kpi-card__unit">{unit}</span>
          </p>
          {maxThreshold && (
            <p className="kpi-card__change kpi-card__change--negative">Limite: {maxThreshold}</p>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [`${v} ${unit}`, title]}
            contentStyle={{
              background: "var(--bg-elev-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text-primary)",
            }}
            itemStyle={{ color: "var(--text-primary)" }}
          />
          {minThreshold && (
            <ReferenceLine y={minThreshold} stroke="#E8C66B" strokeDasharray="4 4" />
          )}
          {maxThreshold && (
            <ReferenceLine y={maxThreshold} stroke="#ef4444" strokeDasharray="4 4" />
          )}
          <Line type="monotone" dataKey="value" stroke="#339989" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <p style={{ fontSize: "var(--t-sm)", color: "var(--text-secondary)" }}>
        Dados dos ultimos 7 dias ({data.length} registros)
      </p>
    </div>
  );
};
