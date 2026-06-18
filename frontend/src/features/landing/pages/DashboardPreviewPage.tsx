import { useId } from "react";
import { useNavigate } from "react-router-dom";
import cowImg from "@/assets/landing/hero-cow.jpg";

/* ─── Dados mockados ──────────────────────────────────────────────────────── */

type Severity = "Alto" | "Médio" | "Baixo";

const kpis = [
  {
    label: "Saúde do rebanho",
    value: "84",
    unit: "/100",
    sub: "",
    delta: "↑ 6 vs. últimos 7 dias",
    tone: "good" as const,
    icon: "shield" as const,
  },
  {
    label: "Vacas em risco",
    value: "18",
    unit: "",
    sub: "7,3% do rebanho",
    delta: "↑ 3 vs. últimos 7 dias",
    tone: "warn" as const,
    icon: "heart" as const,
  },
  {
    label: "Recém-paridas",
    value: "24",
    unit: "",
    sub: "9,7% do rebanho",
    delta: "↓ 2 vs. últimos 7 dias",
    tone: "good" as const,
    icon: "cow" as const,
  },
  {
    label: "Em aberto",
    value: "32",
    unit: "",
    sub: "13,0% do rebanho",
    delta: "↑ 1 vs. últimos 7 dias",
    tone: "good" as const,
    icon: "circle" as const,
  },
  {
    label: "Temp. média",
    value: "38,6",
    unit: "°C",
    sub: "",
    delta: "↑ 0,2°C vs. últimos 7 dias",
    tone: "warn" as const,
    icon: "temp" as const,
  },
];

const alertFeed: {
  id: string;
  title: string;
  cow: string;
  time: string;
  sev: Severity;
  icon: "temp" | "heart" | "activity" | "clock";
}[] = [
  {
    id: "1",
    title: "Temperatura elevada",
    cow: "Vaca 0892",
    time: "há 10 min",
    sev: "Alto",
    icon: "temp",
  },
  {
    id: "2",
    title: "Freq. cardíaca elevada",
    cow: "Vaca 1247",
    time: "há 25 min",
    sev: "Médio",
    icon: "heart",
  },
  {
    id: "3",
    title: "Atividade baixa",
    cow: "Vaca 0671",
    time: "há 1 h",
    sev: "Médio",
    icon: "activity",
  },
  {
    id: "4",
    title: "Temperatura elevada",
    cow: "Vaca 2115",
    time: "há 2 h",
    sev: "Alto",
    icon: "temp",
  },
  {
    id: "5",
    title: "Freq. cardíaca elevada",
    cow: "Vaca 0456",
    time: "há 3 h",
    sev: "Médio",
    icon: "heart",
  },
  {
    id: "6",
    title: "Tratamento agendado",
    cow: "Vaca 0788",
    time: "há 4 h",
    sev: "Baixo",
    icon: "clock",
  },
];

const profileRows = [
  ["Lote / Grupo", "Lactação 1"],
  ["Dias em lactação", "143"],
  ["Status reprodutivo", "Em aberto"],
  ["Último parto", "28 jan, 2024"],
  ["Touro", "Delta-Lambda"],
  ["Brinco", "1247"],
];

const timeline = [
  { time: "00:15", label: "Ruminação", sub: "45 min", icon: "heart" },
  { time: "06:20", label: "Alimentação", sub: "32 min", icon: "cow" },
  { time: "11:05", label: "Atividade baixa", sub: "25 min", icon: "alert" },
  { time: "15:10", label: "Alimentação", sub: "28 min", icon: "cow" },
  { time: "19:45", label: "Ruminação", sub: "42 min", icon: "heart" },
];

const navItems = [
  { label: "Visão geral", icon: "grid", active: true },
  { label: "Rebanho", icon: "cow", badge: undefined },
  { label: "Alertas", icon: "bell", badge: 6 },
  { label: "Saúde", icon: "heart", badge: undefined },
  { label: "Relatórios", icon: "report", badge: undefined },
  { label: "Tratamentos", icon: "drop", badge: undefined },
  { label: "Reprodução", icon: "spark", badge: undefined },
  { label: "Inventário", icon: "box", badge: undefined },
  { label: "Configurações", icon: "gear", badge: undefined },
];

/* ─── Cores ───────────────────────────────────────────────────────────────── */
const C = {
  green: "#1f7a4a",
  orange: "#d97a2c",
  red: "#d7553a",
  bg: "#f5f1ea",
  card: "#ffffff",
  border: "#ece6d8",
  text: "#1a1f1c",
  muted: "#5e6b62",
  sidebar: "#0f2e1f",
  sidebarText: "#a8c1b1",
  sidebarActive: "#1a4632",
};

/* ─── Componente principal ───────────────────────────────────────────────── */

export const DashboardPreviewPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
      }}
    >
      {/* Banner de referência */}
      <div
        style={{
          background: "#1a1f1c",
          color: "#f5f1ea",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              background: C.orange,
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 4,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Demo
          </span>
          <span style={{ color: "#d9e4dc" }}>
            Painel de referência visual — dados mockados para guiar o desenvolvimento do dashboard
            autenticado.
          </span>
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#f5f1ea",
            borderRadius: 8,
            padding: "5px 14px",
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            viewBox="0 0 20 20"
            width={14}
            height={14}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M12 5l-5 5 5 5" />
          </svg>
          Voltar ao site
        </button>
      </div>

      <div style={{ display: "flex" }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <TopBar />
          <KpiRow />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
            <CowProfile />
            <CenterPanel />
            <AlertFeedPanel />
          </div>
          <ActivityTimeline />
        </main>
      </div>
    </div>
  );
};

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */

function Sidebar() {
  return (
    <aside
      style={{
        width: 256,
        flexShrink: 0,
        minHeight: "calc(100vh - 41px)",
        background: C.sidebar,
        color: C.sidebarText,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
          padding: "0 8px",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: C.sidebarActive,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CowGlyph style={{ width: 22, height: 22, color: "#9bd3a8" }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", fontSize: 14 }}>
            CowHealth AI
          </div>
          <div style={{ fontSize: 11, color: "#7fa890" }}>Saúde do rebanho</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((n) => (
          <button
            key={n.label}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
              background: n.active ? C.sidebarActive : "transparent",
              color: n.active ? "#fff" : C.sidebarText,
              textAlign: "left",
            }}
          >
            <NavIcon name={n.icon} />
            <span style={{ flex: 1 }}>{n.label}</span>
            {n.badge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: C.red,
                  color: "#fff",
                  borderRadius: 999,
                  padding: "1px 7px",
                }}
              >
                {n.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Help */}
      <div
        style={{
          marginTop: 24,
          borderRadius: 12,
          background: C.sidebarActive,
          padding: 16,
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.sidebarText }}>
          <SpeechIcon style={{ width: 16, height: 16 }} />
          Precisa de ajuda?
        </div>
      </div>

      {/* User */}
      <div
        style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, padding: "0 8px" }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: C.sidebarActive,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          JH
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Dr. James Harper
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#7fa890",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Fazenda Trevizan
          </div>
        </div>
        <ChevronDown style={{ width: 16, height: 16, color: "#7fa890", flexShrink: 0 }} />
      </div>
    </aside>
  );
}

/* ─── TopBar ──────────────────────────────────────────────────────────────── */

function TopBar() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 42,
            lineHeight: 1,
            margin: 0,
            color: C.text,
            fontWeight: 400,
          }}
        >
          Visão geral do rebanho
        </h1>
        <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>
          Fazenda Trevizan · 247 cabeças
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button style={btnOutline}>
          <CalIcon style={{ width: 16, height: 16, color: C.green }} />
          20 mai – 26 mai, 2024
          <ChevronDown style={{ width: 14, height: 14, color: C.muted }} />
        </button>
        <button style={btnOutline}>
          <FilterIcon style={{ width: 16, height: 16, color: C.green }} />
          Filtrar
        </button>
      </div>
    </header>
  );
}

/* ─── KPI Row ─────────────────────────────────────────────────────────────── */

function KpiRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
      {kpis.map((k, i) => (
        <KpiCard key={i} {...k} index={i} />
      ))}
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  sub,
  delta,
  tone,
  icon,
  index,
}: (typeof kpis)[number] & { index: number }) {
  const accent = tone === "good" ? C.green : C.orange;
  return (
    <article style={{ ...card }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            flexShrink: 0,
            background: tone === "good" ? "#e6f1ea" : "#fbe9d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <KpiIcon name={icon} color={accent} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{value}</span>
            {unit && <span style={{ fontSize: 11, color: C.muted }}>{unit}</span>}
          </div>
          {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: -2 }}>{sub}</div>}
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: accent }}>{delta}</div>
      <div style={{ marginTop: 8, height: 32 }}>
        <Sparkline color={accent} variant={index % 2 === 0 ? "a" : "b"} />
      </div>
    </article>
  );
}

/* ─── Cow Profile ─────────────────────────────────────────────────────────── */

function CowProfile() {
  return (
    <section style={{ ...card, gridColumn: "span 3" }}>
      <div
        style={{
          position: "relative",
          width: 160,
          height: 160,
          margin: "0 auto",
          borderRadius: 999,
          overflow: "hidden",
          border: `4px solid ${C.bg}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={cowImg}
          alt="Vaca 1247"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <button
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 30,
            height: 30,
            borderRadius: 999,
            background: "#fff",
            border: `1px solid ${C.border}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <CameraIcon style={{ width: 14, height: 14, color: C.green }} />
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <div
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 28,
            color: C.text,
            fontWeight: 400,
          }}
        >
          Vaca 1247
        </div>
        <div
          style={{
            fontSize: 11,
            color: C.muted,
            marginTop: 4,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Holandesa · 5,2 anos · Lact 3
        </div>
      </div>

      <dl style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {profileRows.map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 13,
            }}
          >
            <dt style={{ color: C.muted, display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: "#e6f1ea",
                  display: "inline-block",
                }}
              />
              {k}
            </dt>
            <dd style={{ color: C.text, fontWeight: 500, margin: 0 }}>{v}</dd>
          </div>
        ))}
      </dl>

      <button
        style={{
          marginTop: 20,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderRadius: 10,
          border: `1px solid ${C.border}`,
          background: "transparent",
          fontSize: 13,
          cursor: "pointer",
          color: C.text,
        }}
      >
        Ver perfil completo
        <ChevronRight style={{ width: 16, height: 16 }} />
      </button>
    </section>
  );
}

/* ─── Center Panel ────────────────────────────────────────────────────────── */

function CenterPanel() {
  const tabs = ["Saúde", "Atividade", "Reprodução", "Tratamentos", "Notas"];
  return (
    <section style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Temperatura */}
      <div style={card}>
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 24,
            borderBottom: `1px solid ${C.border}`,
            margin: "-20px -20px 0",
            padding: "0 20px",
          }}
        >
          {tabs.map((t, i) => (
            <button
              key={t}
              style={{
                padding: "10px 0",
                fontSize: 13,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderBottom: i === 0 ? `2px solid ${C.green}` : "2px solid transparent",
                color: i === 0 ? C.green : C.muted,
                fontWeight: i === 0 ? 600 : 400,
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ paddingTop: 20 }}>
          <div
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TempIcon style={{ width: 18, height: 18, color: C.green }} />
              <span style={{ fontWeight: 500, fontSize: 14 }}>Temperatura corporal</span>
              <span style={{ fontSize: 11, color: C.muted }}>°C</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: C.orange }}>
                  39,1 <span style={{ fontSize: 11 }}>°C</span>
                </div>
                <div style={{ fontSize: 11, color: C.green }}>↑ 0,5°C vs. ontem</div>
              </div>
              <button style={{ ...btnOutline, fontSize: 11, padding: "5px 10px" }}>
                7 dias <ChevronDown style={{ width: 12, height: 12 }} />
              </button>
            </div>
          </div>
          <TempChart />
        </div>
      </div>

      {/* FC + Risco */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Freq. cardíaca */}
        <div style={card}>
          <div
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HeartIcon style={{ width: 18, height: 18, color: C.green }} />
              <span style={{ fontWeight: 500, fontSize: 14 }}>Freq. cardíaca</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>
                <span style={{ fontSize: 20, fontWeight: 600 }}>72</span>{" "}
                <span style={{ fontSize: 11, color: C.muted }}>bpm</span>
              </div>
              <div style={{ fontSize: 11, color: C.green }}>Normal</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button style={{ ...btnOutline, fontSize: 11, padding: "4px 10px" }}>
              7 dias <ChevronDown style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <HeartChart />
        </div>

        {/* Risk Score */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <ShieldIcon style={{ width: 18, height: 18, color: C.green }} />
            <span style={{ fontWeight: 500, fontSize: 14 }}>Score de risco</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <RiskGauge value={28} />
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
              {[
                { label: "Temperatura", status: "Normal", ok: true },
                { label: "Freq. cardíaca", status: "Normal", ok: true },
                { label: "Atividade", status: "Levemente baixa", ok: false },
                { label: "Ruminação", status: "Normal", ok: true },
              ].map((f) => (
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
          <div style={{ fontSize: 11, color: C.muted, marginTop: 12 }}>Fatores contribuintes</div>
        </div>
      </div>
    </section>
  );
}

/* ─── Alert Feed ──────────────────────────────────────────────────────────── */

function AlertFeedPanel() {
  return (
    <aside style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 500, fontSize: 14 }}>Feed de alertas</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: C.red,
                color: "#fff",
                borderRadius: 999,
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              6
            </span>
          </div>
          <button
            style={{
              fontSize: 12,
              color: C.green,
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Ver tudo
          </button>
        </div>

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {alertFeed.map((a) => {
            const color = a.sev === "Alto" ? C.red : a.sev === "Médio" ? C.orange : C.green;
            const bg = a.sev === "Alto" ? "#fde7df" : a.sev === "Médio" ? "#fbe9d8" : "#e6f1ea";
            return (
              <li key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: bg,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertIcon name={a.icon} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.title}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{a.cow}</div>
                  <div style={{ fontSize: 10, color: "#8a948c", marginTop: 2 }}>{a.time}</div>
                </div>
                <SevBadge sev={a.sev} />
              </li>
            );
          })}
        </ul>
      </div>

      {/* Promo card */}
      <div
        style={{
          borderRadius: 16,
          background: C.sidebar,
          color: "#fff",
          padding: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 14 }}>Monitore em qualquer lugar</div>
        <p style={{ fontSize: 12, color: "#a8c1b1", marginTop: 4, lineHeight: 1.5 }}>
          Receba alertas em tempo real e atualizações do rebanho no celular.
        </p>
        <button
          style={{
            marginTop: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#fff",
            color: C.sidebar,
            fontSize: 12,
            fontWeight: 600,
            padding: "6px 14px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Saiba mais
          <ArrowUpRight style={{ width: 12, height: 12 }} />
        </button>
        <div
          style={{
            position: "absolute",
            right: -12,
            bottom: -12,
            width: 90,
            height: 120,
            borderRadius: 16,
            background: C.sidebarActive,
            border: `4px solid ${C.sidebar}`,
            transform: "rotate(6deg)",
          }}
        />
      </div>
    </aside>
  );
}

/* ─── Activity Timeline ───────────────────────────────────────────────────── */

function ActivityTimeline() {
  return (
    <section style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 500, fontSize: 14 }}>Linha do tempo de atividade</span>
        <button style={{ ...btnOutline, fontSize: 11, padding: "5px 12px" }}>
          Hoje <ChevronDown style={{ width: 12, height: 12 }} />
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ height: 1, background: C.border }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            fontSize: 11,
            color: C.muted,
            marginTop: 8,
          }}
        >
          {["00h", "04h", "08h", "12h", "16h", "20h"].map((h) => (
            <div key={h}>{h}</div>
          ))}
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginTop: 24 }}
        >
          {timeline.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#e6f1ea",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <TimelineIcon name={t.icon} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted }}>{t.time}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 1 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Charts ──────────────────────────────────────────────────────────────── */

function Sparkline({ color, variant }: { color: string; variant: "a" | "b" }) {
  const a = "M0,18 L10,15 L20,20 L30,14 L40,16 L50,10 L60,12 L70,8 L80,11 L90,7 L100,9";
  const b = "M0,10 L10,14 L20,11 L30,16 L40,13 L50,17 L60,14 L70,18 L80,15 L90,19 L100,17";
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <path
        d={variant === "a" ? a : b}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TempChart() {
  const gradId = useId();
  const points = Array.from({ length: 40 }, (_, i) => {
    const x = (i / 39) * 100;
    const y = 50 - Math.sin(i * 0.45) * 8 - Math.cos(i * 0.9) * 3 + (i > 32 ? -6 : 0);
    return [x, y];
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${path} L100,90 L0,90 Z`;
  const days = ["20 mai", "21 mai", "22 mai", "23 mai", "24 mai", "25 mai", "26 mai"];
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ position: "relative", height: 160 }}>
        <svg
          viewBox="0 0 100 90"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={C.green} stopOpacity="0.2" />
              <stop offset="100%" stopColor={C.green} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="20"
            x2="100"
            y2="20"
            stroke={C.red}
            strokeWidth="0.4"
            strokeDasharray="2 2"
          />
          <line
            x1="0"
            y1="75"
            x2="100"
            y2="75"
            stroke="#3b6fa0"
            strokeWidth="0.4"
            strokeDasharray="2 2"
          />
          <path d={area} fill={`url(#${gradId})`} />
          <path d={path} fill="none" stroke={C.green} strokeWidth="0.9" strokeLinecap="round" />
          <circle cx={points[39][0]} cy={points[39][1]} r="1.6" fill={C.green} />
        </svg>
        <div style={{ position: "absolute", top: 0, right: 0, fontSize: 10, color: C.red }}>
          39,5 Limite de febre
        </div>
        <div style={{ position: "absolute", bottom: 12, right: 0, fontSize: 10, color: "#3b6fa0" }}>
          37,5 Limite mínimo
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontSize: 10,
            color: C.muted,
            paddingRight: 4,
          }}
        >
          <span>40,0</span>
          <span>39,0</span>
          <span>38,0</span>
          <span>37,0</span>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          fontSize: 10,
          color: C.muted,
          marginTop: 4,
        }}
      >
        {days.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
    </div>
  );
}

function HeartChart() {
  const pts = Array.from({ length: 30 }, (_, i) => {
    const x = (i / 29) * 100;
    const y = 30 - Math.sin(i * 0.6) * 8 - Math.cos(i * 1.2) * 4;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  return (
    <div style={{ marginTop: 12, height: 90, position: "relative" }}>
      <svg
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <path d={pts} fill="none" stroke={C.green} strokeWidth="1" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 0, top: 0, fontSize: 10, color: C.muted }}>100</div>
      <div style={{ position: "absolute", left: 0, bottom: 16, fontSize: 10, color: C.muted }}>
        40
      </div>
      <div
        style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted }}
      >
        <span>20 mai</span>
        <span>26 mai</span>
      </div>
    </div>
  );
}

function RiskGauge({ value }: { value: number }) {
  const r = 32,
    c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
      <svg
        viewBox="0 0 80 80"
        style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
      >
        <circle cx="40" cy="40" r={r} stroke={C.border} strokeWidth="7" fill="none" />
        <circle
          cx="40"
          cy="40"
          r={r}
          stroke={C.green}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
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
        <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: -2 }}>/100</div>
      </div>
      <div
        style={{ textAlign: "center", fontSize: 11, color: C.green, fontWeight: 500, marginTop: 4 }}
      >
        Risco baixo
      </div>
    </div>
  );
}

/* ─── Micro-componentes ───────────────────────────────────────────────────── */

function SevBadge({ sev }: { sev: Severity }) {
  const map: Record<Severity, { bg: string; color: string }> = {
    Alto: { bg: "#fde7df", color: C.red },
    Médio: { bg: "#fbe9d8", color: C.orange },
    Baixo: { bg: "#e6f1ea", color: C.green },
  };
  const s = map[sev];
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        flexShrink: 0,
      }}
    >
      {sev}
    </span>
  );
}

function CheckDot({ ok }: { ok: boolean }) {
  const color = ok ? C.green : C.orange;
  const bg = ok ? "#e6f1ea" : "#fbe9d8";
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 999,
        background: bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 10 10" style={{ width: 8, height: 8 }}>
        <path
          d="M2 5 L4 7 L8 3"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ─── Ícones SVG ──────────────────────────────────────────────────────────── */

type SvgProps = { style?: React.CSSProperties; className?: string };

function CowGlyph({ style }: SvgProps) {
  return (
    <svg
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 11c0-3 2-5 7-5s7 2 7 5c0 1-.5 2-1 2.5V17a2 2 0 01-2 2h-1v-2H9v2H8a2 2 0 01-2-2v-3.5c-.5-.5-1-1.5-1-2.5z" />
      <path d="M9 14h.01M15 14h.01M4 9l-2-1M20 9l2-1" />
    </svg>
  );
}

function NavIcon({ name }: { name: string }) {
  const s: React.CSSProperties = { width: 16, height: 16 };
  switch (name) {
    case "grid":
      return (
        <svg style={s} viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />
        </svg>
      );
    case "cow":
      return <CowGlyph style={s} />;
    case "bell":
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M5 9a5 5 0 0110 0v3l1 2H4l1-2V9zM8 16a2 2 0 004 0" />
        </svg>
      );
    case "heart":
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M10 16s-6-3.5-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 8c0 4.5-6 8-6 8z" />
        </svg>
      );
    case "report":
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="3" width="12" height="14" rx="1.5" />
          <path d="M7 7h6M7 10h6M7 13h4" />
        </svg>
      );
    case "drop":
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M10 3c2 4 5 6 5 9a5 5 0 01-10 0c0-3 3-5 5-9z" />
        </svg>
      );
    case "spark":
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M10 3v4M10 13v4M3 10h4M13 10h4" />
        </svg>
      );
    case "box":
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 7l7-4 7 4v6l-7 4-7-4V7zM3 7l7 4 7-4M10 11v8" />
        </svg>
      );
    case "gear":
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="10" cy="10" r="2.5" />
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.5 1.5M14 14l1.5 1.5M15.5 4.5L14 6M6 14l-1.5 1.5" />
        </svg>
      );
    default:
      return null;
  }
}

function KpiIcon({ name, color }: { name: string; color: string }) {
  const p = {
    style: { width: 18, height: 18, color },
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.6,
  };
  switch (name) {
    case "shield":
      return (
        <svg {...p} viewBox="0 0 20 20">
          <path d="M10 2l6 2v5c0 4-3 7-6 9-3-2-6-5-6-9V4l6-2z" />
          <path d="M7 10l2 2 4-4" />
        </svg>
      );
    case "heart":
      return (
        <svg {...p} viewBox="0 0 20 20">
          <path d="M10 16s-6-3.5-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 8c0 4.5-6 8-6 8z" />
        </svg>
      );
    case "cow":
      return <CowGlyph style={{ width: 18, height: 18, color }} />;
    case "circle":
      return (
        <svg {...p} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="6" />
          <path d="M10 4v3M10 13v3M4 10h3M13 10h3" />
        </svg>
      );
    case "temp":
      return (
        <svg {...p} viewBox="0 0 20 20">
          <path d="M10 3a2 2 0 012 2v7a3 3 0 11-4 0V5a2 2 0 012-2z" />
        </svg>
      );
    default:
      return null;
  }
}

function AlertIcon({ name, color }: { name: string; color: string }) {
  const p = {
    style: { width: 16, height: 16, color },
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.6,
  };
  switch (name) {
    case "temp":
      return (
        <svg {...p} viewBox="0 0 20 20">
          <path d="M10 3a2 2 0 012 2v7a3 3 0 11-4 0V5a2 2 0 012-2z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...p} viewBox="0 0 20 20">
          <path d="M10 16s-6-3.5-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 8c0 4.5-6 8-6 8z" />
        </svg>
      );
    case "activity":
      return (
        <svg {...p} viewBox="0 0 20 20">
          <path d="M3 10h3l2-5 4 10 2-5h3" />
        </svg>
      );
    case "clock":
      return (
        <svg {...p} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="6" />
          <path d="M10 7v3l2 1" />
        </svg>
      );
    default:
      return null;
  }
}

function TimelineIcon({ name }: { name: string }) {
  const p = {
    style: { width: 16, height: 16, color: C.green },
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.6,
  };
  switch (name) {
    case "heart":
      return (
        <svg {...p} viewBox="0 0 20 20">
          <path d="M10 16s-6-3.5-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 8c0 4.5-6 8-6 8z" />
        </svg>
      );
    case "cow":
      return <CowGlyph style={{ width: 16, height: 16, color: C.green }} />;
    case "alert":
      return (
        <svg {...p} viewBox="0 0 20 20">
          <path d="M10 3l8 14H2L10 3z" />
          <path d="M10 9v3M10 14v.5" />
        </svg>
      );
    default:
      return null;
  }
}

function TempIcon({ style }: SvgProps) {
  return (
    <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 3a2 2 0 012 2v7a3 3 0 11-4 0V5a2 2 0 012-2z" />
    </svg>
  );
}
function HeartIcon({ style }: SvgProps) {
  return (
    <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 16s-6-3.5-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 8c0 4.5-6 8-6 8z" />
    </svg>
  );
}
function ShieldIcon({ style }: SvgProps) {
  return (
    <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 2l6 2v5c0 4-3 7-6 9-3-2-6-5-6-9V4l6-2z" />
    </svg>
  );
}
function CameraIcon({ style }: SvgProps) {
  return (
    <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="6" width="14" height="10" rx="2" />
      <circle cx="10" cy="11" r="2.5" />
      <path d="M7 6l1-2h4l1 2" />
    </svg>
  );
}
function SpeechIcon({ style }: SvgProps) {
  return (
    <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 5h12v8H9l-3 3v-3H4z" />
    </svg>
  );
}
function CalIcon({ style }: SvgProps) {
  return (
    <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="14" height="12" rx="1.5" />
      <path d="M3 8h14M7 3v4M13 3v4" />
    </svg>
  );
}
function FilterIcon({ style }: SvgProps) {
  return (
    <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 5h14M5 10h10M8 15h4" />
    </svg>
  );
}
function ChevronDown({ style }: SvgProps) {
  return (
    <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}
function ChevronRight({ style }: SvgProps) {
  return (
    <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 5l5 5-5 5" />
    </svg>
  );
}
function ArrowUpRight({ style }: SvgProps) {
  return (
    <svg style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 14L14 6M8 6h6v6" />
    </svg>
  );
}

/* ─── Estilos utilitários ─────────────────────────────────────────────────── */

const card: React.CSSProperties = {
  background: C.card,
  borderRadius: 16,
  border: `1px solid ${C.border}`,
  padding: 20,
  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
};

const btnOutline: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "#fff",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "8px 14px",
  fontSize: 13,
  cursor: "pointer",
  color: C.text,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};
