import type { DashboardOverviewResponse, CowStatusItem } from "@services/dashboardService";
import { C, cardStyle } from "../constants/colors";
import { KpiIcon } from "./DashboardIcons";

interface Props {
  overview:      DashboardOverviewResponse | undefined;
  cowsPerStatus: CowStatusItem[]           | undefined;
}

interface KpiItem {
  label: string;
  value: string;
  unit:  string;
  sub:   string;
  delta: string;
  tone:  "good" | "warn";
  icon:  string;
}

function countByStatus(list: CowStatusItem[] | undefined, status: string): number | undefined {
  return list?.find((s) => s.status === status)?.count;
}

function healthScore(list: CowStatusItem[] | undefined, total: number | undefined): string {
  if (!list || !total || total === 0) return "--";
  const healthy = list.find((s) => s.status === "HEALTHY")?.count ?? 0;
  return String(Math.round((healthy / total) * 100));
}

function fmt(n: number | undefined): string {
  return n !== undefined ? String(n) : "--";
}

function pct(value: string, total: number | undefined): string {
  if (value === "--" || !total) return "";
  return `${((Number(value) / total) * 100).toFixed(1)}% do rebanho`;
}

export function DashboardKPIs({ overview, cowsPerStatus }: Props) {
  const total   = overview?.totalCows;
  const score   = healthScore(cowsPerStatus, total);
  const atRisk  = fmt(overview?.cowsInAlert);
  const calving = fmt(countByStatus(cowsPerStatus, "CALVING"));
  const stress  = fmt(countByStatus(cowsPerStatus, "HEAT_STRESS"));

  const kpis: KpiItem[] = [
    {
      label: "Saúde do rebanho",
      value: score,
      unit:  score !== "--" ? "/100" : "",
      sub:   "",
      delta: score !== "--" ? `${score}% saudáveis` : "Aguardando dados",
      tone:  "good",
      icon:  "shield",
    },
    {
      label: "Vacas em risco",
      value: atRisk,
      unit:  "",
      sub:   pct(atRisk, total),
      delta: "Status ALERT",
      tone:  "warn",
      icon:  "heart",
    },
    {
      label: "Recém-paridas",
      value: calving,
      unit:  "",
      sub:   pct(calving, total),
      delta: "Status CALVING",
      tone:  "good",
      icon:  "cow",
    },
    {
      label: "Estresse térmico",
      value: stress,
      unit:  "",
      sub:   pct(stress, total),
      delta: "Status HEAT_STRESS",
      tone:  "warn",
      icon:  "temp",
    },
    {
      label: "Total do rebanho",
      value: fmt(total),
      unit:  "",
      sub:   overview?.totalFarms ? `${overview.totalFarms} fazenda(s)` : "",
      delta: overview?.cowsWithCollar ? `${overview.cowsWithCollar} com colar` : "Aguardando dados",
      tone:  "good",
      icon:  "circle",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
      {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
    </div>
  );
}

function KpiCard({ label, value, unit, sub, delta, tone, icon }: KpiItem) {
  const accent = tone === "good" ? C.green : C.orange;
  return (
    <article style={{ ...cardStyle }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: tone === "good" ? "#e6f1ea" : "#fbe9d8",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <KpiIcon name={icon} color={accent} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: value === "--" ? C.muted : C.text }}>{value}</span>
            {unit && value !== "--" && <span style={{ fontSize: 11, color: C.muted }}>{unit}</span>}
          </div>
          {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: -2 }}>{sub}</div>}
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: accent }}>{delta}</div>
    </article>
  );
}
