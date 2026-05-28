import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { cowsService } from "@services/cowsService";
import type { SensorDailyPoint, MedicalRecordType } from "@/types/cows";
import { C, cardStyle } from "../constants/colors";
import { TempIcon, HeartIcon, ShieldIcon, CheckDot, ClockIcon } from "./DashboardIcons";

interface Props {
  cowId: string | null;
}

const TABS = ["Saúde", "Atividade", "Reprodução", "Tratamentos", "Notas"] as const;
type Tab = (typeof TABS)[number];

export function DashboardCenterPanel({ cowId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Saúde");

  return (
    <section style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Temp card */}
      <div style={{ ...cardStyle }}>
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 24,
            borderBottom: `1px solid ${C.border}`,
            margin: "-20px -20px 0",
            padding: "0 20px",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: "10px 0",
                fontSize: 13,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderBottom: activeTab === t ? `2px solid ${C.green}` : "2px solid transparent",
                color: activeTab === t ? C.green : C.muted,
                fontWeight: activeTab === t ? 600 : 400,
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ paddingTop: 20 }}>
          {activeTab === "Saúde" && <HealthTab cowId={cowId} />}
          {activeTab === "Atividade" && <ComingSoon label="Dados de atividade" />}
          {activeTab === "Reprodução" && <ComingSoon label="Dados de reprodução" />}
          {activeTab === "Tratamentos" && <TratamentosTab cowId={cowId} />}
          {activeTab === "Notas" && <ComingSoon label="Notas clínicas" />}
        </div>
      </div>
    </section>
  );
}

/* ── Health Tab ──────────────────────────────────────────────────────────── */

function HealthTab({ cowId }: { cowId: string | null }) {
  return (
    <>
      <TemperatureCard cowId={cowId} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <HeartRateCard cowId={cowId} />
        <RiskScoreCard cowId={cowId} />
      </div>
    </>
  );
}

/* ── Temperature card ─────────────────────────────────────────────────────── */

function TemperatureCard({ cowId }: { cowId: string | null }) {
  const { data, isLoading } = useQuery({
    queryKey: ["cows", cowId, "temperature-daily", 7],
    queryFn: () => cowsService.getTemperatureDaily(cowId!, 7),
    enabled: !!cowId,
    refetchInterval: 30000,
  });

  const latest = data?.[data.length - 1]?.average;
  const prev = data?.[data.length - 2]?.average;
  const delta = latest !== undefined && prev !== undefined ? (latest - prev).toFixed(1) : null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TempIcon style={{ width: 18, height: 18, color: C.green }} />
          <span style={{ fontWeight: 500, fontSize: 14 }}>Temperatura corporal</span>
          <span style={{ fontSize: 11, color: C.muted }}>°C</span>
        </div>
        <div style={{ textAlign: "right" }}>
          {!cowId ? (
            <span style={{ fontSize: 13, color: C.muted }}>Selecione uma vaca</span>
          ) : isLoading ? (
            <span style={{ fontSize: 13, color: C.muted }}>Carregando…</span>
          ) : (
            <>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: latest && latest >= 39.5 ? C.orange : C.text,
                }}
              >
                {latest?.toFixed(1) ?? "--"} <span style={{ fontSize: 11 }}>°C</span>
              </div>
              {delta !== null && (
                <div style={{ fontSize: 11, color: Number(delta) > 0 ? C.orange : C.green }}>
                  {Number(delta) > 0 ? "↑" : "↓"} {Math.abs(Number(delta))}°C vs. ontem
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <TempChart data={data ?? []} loading={isLoading && !!cowId} />
    </div>
  );
}

function TempChart({ data, loading }: { data: SensorDailyPoint[]; loading: boolean }) {
  if (loading) return <ChartSkeleton height={160} />;
  if (data.length === 0) return <ChartEmpty height={160} />;

  const chartData = data.map((p) => ({ date: p.date, temp: Number(p.average.toFixed(2)) }));

  return (
    <div style={{ marginTop: 16 }}>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.green} stopOpacity={0.2} />
              <stop offset="95%" stopColor={C.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: C.muted }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[37, 40.5]}
            tick={{ fontSize: 10, fill: C.muted }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => [`${v}°C`, "Média"]}
          />
          <ReferenceLine
            y={39.5}
            stroke={C.red}
            strokeDasharray="4 4"
            label={{ value: "Febre 39.5°", position: "right", fontSize: 9, fill: C.red }}
          />
          <ReferenceLine
            y={37.5}
            stroke="#3b6fa0"
            strokeDasharray="4 4"
            label={{ value: "Mín 37.5°", position: "right", fontSize: 9, fill: "#3b6fa0" }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke={C.green}
            strokeWidth={1.5}
            fill="url(#tempGrad)"
            dot={false}
            activeDot={{ r: 4, fill: C.green }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Heart Rate card ─────────────────────────────────────────────────────── */

function HeartRateCard({ cowId }: { cowId: string | null }) {
  const { data, isLoading } = useQuery({
    queryKey: ["cows", cowId, "heart-rate-daily", 7],
    queryFn: () => cowsService.getHeartRateDaily(cowId!, 7),
    enabled: !!cowId,
    refetchInterval: 30000,
  });

  const latest = data?.[data.length - 1]?.average;
  const normal = latest === undefined || (latest >= 40 && latest <= 80);

  return (
    <div style={{ ...cardStyle }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HeartIcon style={{ width: 18, height: 18, color: C.green }} />
          <span style={{ fontWeight: 500, fontSize: 14 }}>Freq. cardíaca</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 600 }}>{latest?.toFixed(0) ?? "--"}</span>{" "}
            <span style={{ fontSize: 11, color: C.muted }}>bpm</span>
          </div>
          {latest !== undefined && (
            <div style={{ fontSize: 11, color: normal ? C.green : C.orange }}>
              {normal ? "Normal" : "Fora do intervalo"}
            </div>
          )}
        </div>
      </div>

      {isLoading && !!cowId ? (
        <ChartSkeleton height={90} />
      ) : data && data.length > 0 ? (
        <div style={{ marginTop: 12 }}>
          <ResponsiveContainer width="100%" height={90}>
            <LineChart
              data={data.map((p) => ({ date: p.date, bpm: Number(p.average.toFixed(0)) }))}
              margin={{ top: 4, right: 4, bottom: 0, left: -28 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: C.muted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 9, fill: C.muted }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v) => [`${v} bpm`, "Média"]}
              />
              <Line
                type="monotone"
                dataKey="bpm"
                stroke={C.green}
                strokeWidth={1.2}
                dot={false}
                activeDot={{ r: 3, fill: C.green }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmpty height={90} />
      )}
    </div>
  );
}

/* ── Risk Score card ─────────────────────────────────────────────────────── */

function RiskScoreCard({ cowId }: { cowId: string | null }) {
  const { data: tempData } = useQuery({
    queryKey: ["cows", cowId, "temperature-daily", 7],
    queryFn: () => cowsService.getTemperatureDaily(cowId!, 7),
    enabled: !!cowId,
  });
  const { data: hrData } = useQuery({
    queryKey: ["cows", cowId, "heart-rate-daily", 7],
    queryFn: () => cowsService.getHeartRateDaily(cowId!, 7),
    enabled: !!cowId,
  });

  const latestTemp = tempData?.[tempData.length - 1]?.average;
  const latestHr = hrData?.[hrData.length - 1]?.average;

  const tempOk = latestTemp === undefined || (latestTemp >= 37.5 && latestTemp < 39.5);
  const hrOk = latestHr === undefined || (latestHr >= 40 && latestHr <= 80);

  const factors = [
    { label: "Temperatura", ok: tempOk, status: tempOk ? "Normal" : "Atenção" },
    { label: "Freq. cardíaca", ok: hrOk, status: hrOk ? "Normal" : "Atenção" },
    { label: "Atividade", ok: true, status: "Aguardando dados" },
    { label: "Ruminação", ok: true, status: "Aguardando dados" },
  ];

  const score = !cowId ? 0 : [tempOk, hrOk].filter(Boolean).length * 14;

  return (
    <div style={{ ...cardStyle }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <ShieldIcon style={{ width: 18, height: 18, color: C.green }} />
        <span style={{ fontWeight: 500, fontSize: 14 }}>Score de risco</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <RiskGauge value={cowId ? score : 0} />
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {factors.map((f) => (
            <li
              key={f.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 11,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckDot ok={f.ok} />
                {f.label}
              </span>
              <span style={{ color: f.ok ? C.green : C.orange }}>{f.status}</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 12 }}>
        {cowId ? "Baseado em dados disponíveis" : "Selecione uma vaca"}
      </div>
    </div>
  );
}

function RiskGauge({ value }: { value: number }) {
  const r = 30,
    c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = value < 30 ? C.green : value < 60 ? C.orange : C.red;
  const label = value < 30 ? "Risco baixo" : value < 60 ? "Moderado" : "Alto risco";
  return (
    <div style={{ flexShrink: 0, textAlign: "center" }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <svg
          viewBox="0 0 70 70"
          style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
        >
          <circle cx="35" cy="35" r={r} stroke={C.border} strokeWidth="6" fill="none" />
          <circle
            cx="35"
            cy="35"
            r={r}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
          <div style={{ fontSize: 9, color: C.muted }}>/100</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color, fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ── Tratamentos Tab ─────────────────────────────────────────────────────── */

const TYPE_LABEL: Record<MedicalRecordType, string> = {
  CHECKUP: "Check-up",
  PROCEDURE: "Procedimento",
  MEDICATION: "Medicação",
};

const TYPE_COLOR: Record<MedicalRecordType, { bg: string; color: string }> = {
  CHECKUP: { bg: "var(--status-success-bg)", color: C.green },
  PROCEDURE: { bg: "var(--status-warning-bg)", color: C.orange },
  MEDICATION: { bg: "#fde7df", color: C.red },
};

function TratamentosTab({ cowId }: { cowId: string | null }) {
  const { data: records, isLoading } = useQuery({
    queryKey: ["cows", cowId, "medical-records"],
    queryFn: () => cowsService.getMedicalRecords(cowId!),
    enabled: !!cowId,
  });

  if (!cowId) return <ComingSoon label="Selecione uma vaca para ver os tratamentos" />;
  if (isLoading) return <ChartSkeleton height={200} />;

  if (!records || records.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
          gap: 8,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: "var(--status-success-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ClockIcon style={{ width: 18, height: 18, color: C.green }} />
        </div>
        <span style={{ fontSize: 13, color: C.muted }}>Nenhum registro clínico encontrado</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxHeight: 340,
        overflowY: "auto",
        paddingRight: 4,
      }}
    >
      {records.map((r) => {
        const tc = TYPE_COLOR[r.type] ?? { bg: "var(--status-success-bg)", color: C.green };
        return (
          <div
            key={r.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: "var(--bg-elev-2)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                background: tc.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ClockIcon style={{ width: 15, height: 15, color: tc.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.title}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: tc.bg,
                    color: tc.color,
                  }}
                >
                  {TYPE_LABEL[r.type]}
                </span>
              </div>
              {r.notes && (
                <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0", lineHeight: 1.4 }}>
                  {r.notes}
                </p>
              )}
              <div
                style={{ fontSize: 11, color: "#8a948c", marginTop: 4, display: "flex", gap: 12 }}
              >
                <span>
                  {new Date(r.recordedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>por {r.user.name}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Coming Soon placeholder ─────────────────────────────────────────────── */

function ComingSoon({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 200,
        gap: 8,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: "var(--status-success-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 20 20"
          style={{ width: 18, height: 18, color: C.green }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="10" cy="10" r="6" />
          <path d="M10 7v3l2 1" />
        </svg>
      </div>
      <span style={{ fontSize: 13, color: C.muted }}>{label} — em breve</span>
    </div>
  );
}

/* ── Shared chart placeholders ───────────────────────────────────────────── */

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      style={{
        height,
        marginTop: 16,
        borderRadius: 8,
        background: "var(--bg-elev-2)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

function ChartEmpty({ height }: { height: number }) {
  return (
    <div
      style={{
        height,
        marginTop: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px dashed ${C.border}`,
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 12, color: C.muted }}>Sem dados para exibir</span>
    </div>
  );
}
