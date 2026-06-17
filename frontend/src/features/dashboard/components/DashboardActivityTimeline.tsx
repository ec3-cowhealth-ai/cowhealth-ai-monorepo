import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@lib/api";
import { C, cardStyle, btnOutlineStyle } from "../constants/colors";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface ActivityEvent {
  time: string;
  label: string;
  icon: string;
  color: string;
  durationMin: number;
}

const ICON_MAP: Record<string, string> = {
  activity:   "↯",
  feeding:    "🌿",
  rumination: "♻",
  rest:       "💤",
};

const toLocalDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface Props {
  cowId: string | null;
}

export function DashboardActivityTimeline({ cowId }: Props) {
  const [date, setDate] = useState(() => toLocalDate(new Date()));

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["activity-timeline", cowId, date],
    queryFn: async () => {
      const res = await api.get<ActivityEvent[]>(`/dashboard/cow/${cowId}/activity-timeline`, {
        params: { date },
      });
      return res.data;
    },
    enabled: !!cowId,
    refetchInterval: 30000,
  });

  const prevDay = () => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setDate(toLocalDate(d));
  };
  const nextDay = () => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setDate(toLocalDate(d));
  };
  const isToday = date === toLocalDate(new Date());

  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <section style={{ ...cardStyle }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontWeight: 500, fontSize: 14 }}>Linha do tempo de atividade</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={prevDay}
            style={{ ...btnOutlineStyle, padding: "5px 8px", fontSize: 11 }}
            title="Dia anterior"
          >
            <ChevronLeft size={12} />
          </button>
          <button style={{ ...btnOutlineStyle, fontSize: 11, padding: "5px 12px", minWidth: 100, justifyContent: "center" }}>
            {dateLabel} <ChevronDown style={{ width: 12, height: 12 }} />
          </button>
          <button
            onClick={nextDay}
            disabled={isToday}
            style={{ ...btnOutlineStyle, padding: "5px 8px", fontSize: 11, opacity: isToday ? 0.4 : 1 }}
            title="Próximo dia"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {!cowId ? (
        <div style={{ marginTop: 16, textAlign: "center", padding: "24px 0", color: C.muted, fontSize: 13, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
          Selecione uma vaca para ver a linha do tempo
        </div>
      ) : isLoading ? (
        <div className="skeleton" style={{ height: 80, marginTop: 16 }} />
      ) : events.length === 0 ? (
        <div style={{ marginTop: 16, textAlign: "center", padding: "24px 0", color: C.muted, fontSize: 13, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
          Sem dados de atividade para este dia
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          {/* Barra visual proporcional */}
          <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", gap: 1 }}>
            {events.map((ev, i) => (
              <div
                key={i}
                title={`${ev.label} — ${ev.durationMin} min`}
                style={{
                  flex: ev.durationMin,
                  background: ev.color,
                  opacity: 0.75,
                }}
              />
            ))}
          </div>

          {/* Legenda das atividades */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 10,
              marginTop: 18,
            }}
          >
            {events.map((ev, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `${ev.color}22`,
                    border: `1px solid ${ev.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 16,
                  }}
                >
                  {ICON_MAP[ev.icon] ?? "•"}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.muted }}>{ev.time}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 1, color: C.text }}>{ev.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{ev.durationMin} min</div>
                </div>
              </div>
            ))}
          </div>

          {/* Legenda de cores */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            {[
              { icon: "activity",   label: "Atividade",   color: "#f57f17" },
              { icon: "feeding",    label: "Alimentação",  color: "#6bb4e8" },
              { icon: "rumination", label: "Ruminação",   color: "#339989" },
              { icon: "rest",       label: "Repouso",     color: "#888" },
            ].map((item) => (
              <div key={item.icon} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, display: "inline-block", flexShrink: 0 }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
