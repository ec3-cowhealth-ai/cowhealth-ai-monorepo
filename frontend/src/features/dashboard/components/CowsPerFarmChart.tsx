import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "../types";

interface CowsPerFarmChartProps {
  data: ChartDataPoint[];
}

export const CowsPerFarmChart = ({ data }: CowsPerFarmChartProps) => (
  <div className="card" style={{ padding: "var(--s-4)" }}>
    <p style={{ fontWeight: 600, marginBottom: "var(--s-3)" }}>
      Vacas por Fazenda
    </p>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" fill="#339989" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
