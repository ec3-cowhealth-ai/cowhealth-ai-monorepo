import type { Notification } from "@hooks/useNotifications";
import { C, cardStyle } from "../constants/colors";
import { AlertFeedIcon } from "./DashboardIcons";

interface Props {
  alerts: Notification[];
  isLoading: boolean;
  onSelectCow?: (cowId: string) => void;
}

type Severity = "Alto" | "Médio" | "Baixo";

function severity(type: string | undefined): Severity {
  const t = (type ?? "").toLowerCase();
  if (t.includes("temp") || t.includes("fever") || t.includes("alert")) return "Alto";
  if (t.includes("heart") || t.includes("stress") || t.includes("activity")) return "Médio";
  return "Baixo";
}

function alertIcon(type: string | undefined): string {
  const t = (type ?? "").toLowerCase();
  if (t.includes("temp")) return "temp";
  if (t.includes("heart")) return "heart";
  if (t.includes("activ")) return "activity";
  if (t.includes("sched") || t.includes("treat")) return "clock";
  return "heart";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.floor(h / 24)} d`;
}

function SevBadge({ sev }: { sev: Severity }) {
  const map: Record<Severity, { bg: string; color: string }> = {
    Alto: { bg: "#fde7df", color: C.red },
    Médio: { bg: "var(--status-warning-bg)", color: C.orange },
    Baixo: { bg: "var(--status-success-bg)", color: C.green },
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

export function DashboardAlertFeed({ alerts, isLoading, onSelectCow }: Props) {
  const visible = alerts.slice(0, 6);

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...cardStyle }}>
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
            {alerts.length > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: C.red,
                  color: "var(--primary-on)",
                  borderRadius: 999,
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {Math.min(alerts.length, 99)}
              </span>
            )}
          </div>
          <a
            href="/notifications"
            style={{ fontSize: 12, color: C.green, fontWeight: 500, textDecoration: "none" }}
          >
            Ver tudo
          </a>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 44,
                  borderRadius: 8,
                  background: "var(--bg-elev-2)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: C.muted, fontSize: 13 }}>
            Nenhum alerta no momento
          </div>
        ) : (
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
            {visible.map((a) => {
              const sev = severity(a.type);
              const icon = alertIcon(a.type);
              const color = sev === "Alto" ? C.red : sev === "Médio" ? C.orange : C.green;
              const bg =
                sev === "Alto"
                  ? "var(--status-danger-bg)"
                  : sev === "Médio"
                    ? "var(--status-warning-bg)"
                    : "var(--status-success-bg)";
              return (
                <li
                  key={a.id}
                  onClick={() => a.cowId && onSelectCow?.(String(a.cowId))}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    cursor: a.cowId ? "pointer" : "default",
                  }}
                >
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
                    <AlertFeedIcon name={icon} color={color} />
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
                    <div
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.message}
                    </div>
                    <div style={{ fontSize: 10, color: "#8a948c", marginTop: 2 }}>
                      {timeAgo(a.createdAt)}
                    </div>
                  </div>
                  <SevBadge sev={sev} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Promo card */}
      <div
        style={{
          borderRadius: 16,
          background: C.sidebar,
          color: "var(--primary-on)",
          padding: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 14 }}>Monitore em qualquer lugar</div>
        <p
          style={{
            fontSize: 12,
            color: "#a8c1b1",
            marginTop: 4,
            lineHeight: 1.5,
            margin: "4px 0 0",
          }}
        >
          Receba alertas em tempo real e atualizações do rebanho no celular.
        </p>
        <div
          style={{
            position: "absolute",
            right: -12,
            bottom: -12,
            width: 80,
            height: 100,
            borderRadius: 14,
            background: C.sidebarActive,
            border: `4px solid ${C.sidebar}`,
            transform: "rotate(6deg)",
          }}
        />
      </div>
    </aside>
  );
}
