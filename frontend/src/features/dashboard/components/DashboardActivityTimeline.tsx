import { C, cardStyle, btnOutlineStyle } from "../constants/colors";
import { HeartIcon, CowGlyph, AlertTriangleIcon, ChevronDown } from "./DashboardIcons";

interface Props {
  cowId: string | null;
}

// Placeholder events — replaced by real accelerometer data when DB is ready
const PLACEHOLDER_EVENTS = [
  { time: "--:--", label: "Ruminação", sub: "-- min", icon: "heart" },
  { time: "--:--", label: "Alimentação", sub: "-- min", icon: "cow" },
  { time: "--:--", label: "Atividade baixa", sub: "-- min", icon: "alert" },
  { time: "--:--", label: "Alimentação", sub: "-- min", icon: "cow" },
  { time: "--:--", label: "Ruminação", sub: "-- min", icon: "heart" },
];

const HOUR_LABELS = ["00h", "04h", "08h", "12h", "16h", "20h"];

export function DashboardActivityTimeline({ cowId }: Props) {
  const events = PLACEHOLDER_EVENTS;

  return (
    <section style={{ ...cardStyle }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 500, fontSize: 14 }}>Linha do tempo de atividade</span>
        <button style={{ ...btnOutlineStyle, fontSize: 11, padding: "5px 12px" }}>
          Hoje <ChevronDown style={{ width: 12, height: 12 }} />
        </button>
      </div>

      {!cowId ? (
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            padding: "24px 0",
            color: C.muted,
            fontSize: 13,
            border: `1px dashed ${C.border}`,
            borderRadius: 10,
          }}
        >
          Selecione uma vaca para ver a linha do tempo
        </div>
      ) : (
        <div style={{ marginTop: 24 }}>
          <div style={{ height: 1, background: C.border }} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${HOUR_LABELS.length}, 1fr)`,
              fontSize: 11,
              color: C.muted,
              marginTop: 8,
            }}
          >
            {HOUR_LABELS.map((h) => (
              <div key={h}>{h}</div>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${events.length}, 1fr)`,
              gap: 16,
              marginTop: 24,
            }}
          >
            {events.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "var(--status-success-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <EventIcon name={t.icon} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.muted }}>{t.time}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 1 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: C.muted, textAlign: "center" }}>
            Dados de acelerômetro em breve
          </div>
        </div>
      )}
    </section>
  );
}

function EventIcon({ name }: { name: string }) {
  const s = { width: 15, height: 15, color: C.green };
  switch (name) {
    case "heart":
      return <HeartIcon style={s} />;
    case "cow":
      return <CowGlyph style={s} />;
    case "alert":
      return <AlertTriangleIcon style={s} />;
    default:
      return null;
  }
}
