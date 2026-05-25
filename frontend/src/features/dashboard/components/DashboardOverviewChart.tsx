import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useHealthTimeline } from "../hooks/useDashboard";

interface DashboardOverviewChartProps {
  farmId?: number;
}

export const DashboardOverviewChart = ({ farmId }: DashboardOverviewChartProps) => {
  const { data, isLoading } = useHealthTimeline(farmId ? String(farmId) : undefined);

  if (isLoading || !data) return null;

  return (
    <div className="card">
      <p
        style={{
          margin: "0 0 var(--s-3) 0",
          fontWeight: 700,
          fontSize: "var(--t-sm)",
          color: "var(--text-secondary)",
        }}
      >
        Evolução do Rebanho — últimos 7 dias
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
          <Tooltip
            contentStyle={{
              background: "var(--bg-elev-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="healthy"
            stroke="var(--success)"
            dot={false}
            name="Saudável"
          />
          <Line type="monotone" dataKey="alert" stroke="var(--danger)" dot={false} name="Alerta" />
          <Line
            type="monotone"
            dataKey="heatStress"
            stroke="var(--warning)"
            dot={false}
            name="Est. Térmico"
          />
          <Line type="monotone" dataKey="calving" stroke="var(--info)" dot={false} name="Parto" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
