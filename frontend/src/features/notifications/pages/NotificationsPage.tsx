import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@components/common";
import { Check, Bell, CheckCheck, CheckCircle2, ChevronRight } from "lucide-react";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkNotificationAsUnread,
  useMarkAllAsRead,
} from "@hooks/useNotifications";
import type { Notification } from "@hooks/useNotifications";
import { C, cardStyle } from "@features/dashboard/constants/colors";

// ─── Esquemas de cor por tipo ─────────────────────────────────────────────────

const SCHEME: Record<string, { color: string; bg: string; border: string; label: string }> = {
  ALERT:   { color: C.red,     bg: "#fdecea", border: "#f5c0b8", label: "Crítico"    },
  WARNING: { color: C.orange,  bg: "#fdf3e7", border: "#f0d0a0", label: "Aviso"      },
  INFO:    { color: "#6bb4e8", bg: "#e8f2fb", border: "#aed4f0", label: "Informação" },
};
const FALLBACK = { color: C.muted, bg: C.card, border: C.border, label: "Alerta" };

// ─── Ordenação por urgência ───────────────────────────────────────────────────

const TYPE_RANK: Record<string, number> = { ALERT: 0, WARNING: 1, INFO: 2 };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "agora";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

type FilterKey = "all" | "ALERT" | "WARNING" | "INFO";

// ─── Card ─────────────────────────────────────────────────────────────────────

function NotifCard({
  n,
  onMark,
  onUnmark,
  onNavigate,
}: {
  n: Notification;
  onMark: () => void;
  onUnmark: () => void;
  onNavigate: () => void;
}) {
  const s = (n.type && SCHEME[n.type]) ?? FALLBACK;

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${n.read ? C.border : s.border}`,
        borderLeft: `4px solid ${n.read ? C.border : s.color}`,
        background: n.read ? C.card : s.bg,
        overflow: "hidden",
        opacity: n.read ? 0.6 : 1,
        transition: "opacity 0.2s",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      {/* Checkbox lateral */}
      <button
        onClick={(e) => { e.stopPropagation(); n.read ? onUnmark() : onMark(); }}
        title={n.read ? "Mover para caixa de entrada" : "Marcar como resolvido"}
        style={{
          flexShrink: 0,
          width: 48,
          background: "none",
          border: "none",
          borderRight: `1px solid ${n.read ? C.border : s.border}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            width: 20, height: 20, borderRadius: 6,
            border: `2px solid ${n.read ? C.green : C.muted + "80"}`,
            background: n.read ? C.green : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.15s",
          }}
        >
          {n.read && <Check size={11} color="#fff" strokeWidth={3} />}
        </span>
      </button>

      {/* Corpo clicável (navega para a vaca se houver cowId) */}
      <div
        onClick={n.cowId ? onNavigate : undefined}
        style={{
          flex: 1,
          padding: "14px 14px 14px 14px",
          cursor: n.cowId ? "pointer" : "default",
          minWidth: 0,
        }}
      >
        {/* Linha topo: badge + tempo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 10, fontWeight: 700,
                padding: "2px 9px", borderRadius: 999,
                background: s.color + "22", color: s.color,
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}
            >
              {s.label}
            </span>
            {!n.read && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, color: C.muted }}>{timeAgo(n.createdAt)}</span>
            {n.cowId && !n.read && <ChevronRight size={12} color={C.muted} />}
          </div>
        </div>

        {/* Título */}
        <p style={{ margin: "0 0 4px 0", fontSize: 13, fontWeight: n.read ? 400 : 700, color: C.text, lineHeight: 1.3 }}>
          {n.title}
        </p>

        {/* Mensagem */}
        <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          {n.message}
        </p>

        {n.cowId && !n.read && (
          <p style={{ margin: "5px 0 0 0", fontSize: 11, color: s.color, fontWeight: 600 }}>
            Ver animal →
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showResolved, setShowResolved] = useState(false);

  const { data: all, isLoading } = useNotifications();
  const { mutate: markAsRead }    = useMarkNotificationAsRead();
  const { mutate: markAsUnread }  = useMarkNotificationAsUnread();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const pending = useMemo<Notification[]>(() => {
    const unread = (all ?? []).filter((n) => !n.read);
    const byType = filter === "all" ? unread : unread.filter((n) => n.type === filter);
    return [...byType].sort(
      (a, b) => (TYPE_RANK[a.type ?? ""] ?? 9) - (TYPE_RANK[b.type ?? ""] ?? 9),
    );
  }, [all, filter]);

  const resolved = useMemo<Notification[]>(
    () => (all ?? []).filter((n) => n.read),
    [all],
  );

  const unreadCount = (all ?? []).filter((n) => !n.read).length;

  const counts = {
    ALERT:   (all ?? []).filter((n) => !n.read && n.type === "ALERT").length,
    WARNING: (all ?? []).filter((n) => !n.read && n.type === "WARNING").length,
    INFO:    (all ?? []).filter((n) => !n.read && n.type === "INFO").length,
  };

  const FILTERS: [FilterKey, string, number | null][] = [
    ["all",     "Todos",       unreadCount],
    ["ALERT",   "Críticos",    counts.ALERT],
    ["WARNING", "Avisos",      counts.WARNING],
    ["INFO",    "Informações", counts.INFO],
  ];

  return (
    <div className="app-page" style={{ background: C.bg }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Bell size={34} color={C.green} />
          <div>
            <h1
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 34, lineHeight: 1, margin: 0,
                color: C.text, fontWeight: 400,
              }}
            >
              Avisos
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: unreadCount > 0 ? C.orange : C.muted }}>
              {unreadCount > 0 ? `${unreadCount} não resolvido${unreadCount !== 1 ? "s" : ""}` : "Tudo em dia"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 999,
              fontSize: 12, fontWeight: 600,
              border: `1px solid ${C.border}`,
              background: C.card, color: C.muted,
              cursor: "pointer",
            }}
          >
            <CheckCheck size={14} /> Resolver todos
          </button>
        )}
      </header>

      {/* Filtros por tipo */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map(([val, label, count]) => {
          const active = filter === val;
          const accentColor =
            val === "ALERT" ? C.red : val === "WARNING" ? C.orange : val === "INFO" ? "#6bb4e8" : C.green;
          return (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 16px", borderRadius: 999, fontSize: 13,
                fontWeight: active ? 600 : 400,
                border: `1px solid ${active ? accentColor : C.border}`,
                background: active ? accentColor + "18" : C.card,
                color: active ? accentColor : C.muted,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {label}
              {count !== null && count > 0 && (
                <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de pendentes */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <LoadingSpinner />
        </div>
      ) : pending.length === 0 ? (
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 10, padding: 20 }}>
          <CheckCircle2 size={22} color={C.green} />
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>
            {filter === "all" ? "Nenhum aviso pendente." : `Nenhum aviso do tipo "${SCHEME[filter]?.label}" pendente.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pending.map((n) => (
            <NotifCard
              key={n.id}
              n={n}
              onMark={() => markAsRead(n.id)}
              onUnmark={() => markAsUnread(n.id)}
              onNavigate={() => { markAsRead(n.id); navigate(`/cows/${n.cowId}`); }}
            />
          ))}
        </div>
      )}

      {/* Divisor Resolvidos */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <button
          onClick={() => setShowResolved((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "none", border: "none", cursor: "pointer",
            color: C.muted, fontSize: 12, padding: "2px 4px",
            whiteSpace: "nowrap",
          }}
        >
          Resolvidos
          {resolved.length > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: "#e8f5ee", color: C.green }}>
              {resolved.length}
            </span>
          )}
          <Check size={12} style={{ transform: showResolved ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      {/* Lista de resolvidos */}
      {showResolved && (
        resolved.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, color: C.muted, textAlign: "center" }}>
            Nenhum aviso resolvido ainda.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {resolved.map((n) => (
              <NotifCard
                key={n.id}
                n={n}
                onMark={() => markAsRead(n.id)}
                onUnmark={() => markAsUnread(n.id)}
                onNavigate={() => { if (n.cowId) navigate(`/cows/${n.cowId}`); }}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};
