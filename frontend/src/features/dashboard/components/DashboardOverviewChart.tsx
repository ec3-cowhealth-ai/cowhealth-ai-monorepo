import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "../types";

interface DashboardOverviewChartProps {
  data: ChartDataPoint[];
  title: string;
  period?: "today" | "week" | "month";
}

export const DashboardOverviewChart = ({ data, title }: DashboardOverviewChartProps) => (
  <div className="card" style={{ padding: "var(--s-4)", background: "var(--bg-elev-1)" }}>
    <p style={{ fontWeight: 600, marginBottom: "var(--s-3)" }}>{title}</p>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "var(--bg-elev-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }} itemStyle={{ color: "var(--text-primary)" }} />
        <Line type="monotone" dataKey="value" stroke="#339989" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
