import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PeriodPicker } from "@components/ui/PeriodPicker";
import { useHealthTimeline } from "../hooks/useHealthTimeline";
import { C } from "../constants/colors";
import type { Period } from "@/types/period";

const SERIES = [
  { key: "healthy",    label: "Saudável",   color: "#339989" },
  { key: "alert",      label: "Alerta",     color: "#e53e3e" },
  { key: "heatStress", label: "Est. Térmico", color: "#f57f17" },
  { key: "calving",    label: "Parto",      color: "#6bb4e8" },
];

interface Props {
  farmId?: number;
}

export const DashboardOverviewChart = ({ farmId }: Props) => {
  const [period, setPeriod] = useState<Period>("daily");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo]     = useState<string>("");

  const effectiveFrom = period === "custom" && customFrom ? customFrom : undefined;
  const effectiveTo   = period === "custom" && customTo   ? customTo   : undefined;

  const { data = [], isLoading } = useHealthTimeline(farmId, period, effectiveFrom, effectiveTo);

  const isEmpty = !isLoading && data.every(
    (p) => p.healthy === 0 && p.alert === 0 && p.heatStress === 0 && p.calving === 0
  );

  return (
    <div className="card" style={{ padding: "var(--s-4)", background: "var(--bg-elev-1)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: C.text }}>
          Saúde do rebanho
        </p>
      </div>

      <PeriodPicker
        value={period}
        onChange={setPeriod}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
      />

      {isLoading ? (
        <div className="skeleton" style={{ height: 240 }} />
      ) : isEmpty ? (
        <div style={{
          height: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.muted,
          fontSize: 13,
          border: `1px dashed ${C.border}`,
          borderRadius: 10,
        }}>
          Sem dados para o período selecionado
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
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
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--bg-elev-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: C.muted, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
