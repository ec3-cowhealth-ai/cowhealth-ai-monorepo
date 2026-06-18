import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import type { ChartDataPoint } from "../types";

interface CowsPerStatusChartProps {
  data: ChartDataPoint[];
}

const STATUS_COLORS: Record<string, string> = {
  HEALTHY: "#339989",
  CALVING: "#6BB4E8",
  HEAT_STRESS: "#E8C66B",
  ALERT: "#ef4444",
  Saudaveis: "#339989",
  "Em Risco": "#E8C66B",
  Doentes: "#ef4444",
};

export const CowsPerStatusChart = ({ data }: CowsPerStatusChartProps) => (
  <div className="card" style={{ padding: "var(--s-4)", background: "var(--bg-elev-1)" }}>
    <p style={{ fontWeight: 600, marginBottom: "var(--s-3)" }}>Vacas por Status</p>
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label={true}>
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={STATUS_COLORS[entry.label] ?? "#8884d8"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--bg-elev-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text-primary)",
          }}
          itemStyle={{ color: "var(--text-primary)" }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);
