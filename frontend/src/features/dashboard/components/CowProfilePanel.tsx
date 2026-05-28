import type React from "react";
import { useQuery } from "@tanstack/react-query";
import { cowsService } from "@services/cowsService";
import { ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { C, cardStyle } from "../constants/colors";
import { CameraIcon, ChevronRight } from "./DashboardIcons";

interface Props {
  cowId: string | null;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  HEALTHY: "Saudável",
  CALVING: "Recém-parida",
  HEAT_STRESS: "Estresse térmico",
  ALERT: "Alerta",
};

function age(birthDate: string | undefined): string {
  if (!birthDate) return "--";
  const diff = Date.now() - new Date(birthDate).getTime();
  const years = diff / (1000 * 60 * 60 * 24 * 365.25);
  return `${years.toFixed(1)} anos`;
}

export function CowProfilePanel({ cowId, onPrev, onNext, hasPrev, hasNext }: Props) {
  const { data: cow, isLoading } = useQuery({
    queryKey: ["cows", cowId],
    queryFn: () => cowsService.get(cowId!),
    enabled: !!cowId,
  });

  if (!cowId) {
    return (
      <section
        style={{
          ...cardStyle,
                    display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          minHeight: 300,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "var(--status-success-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CowHead size={28} color={C.green} />
        </div>
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
          Selecione uma vaca acima para ver o perfil.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section style={{ ...cardStyle, gridColumn: "span 3" }}>
        <Skeleton />
      </section>
    );
  }

  if (!cow) return null;

  const statusLabel = STATUS_LABEL[cow.status] ?? cow.status;
  const statusColor = cow.status === "ALERT" || cow.status === "HEAT_STRESS" ? C.orange : C.green;
  const statusBg =
    cow.status === "ALERT" || cow.status === "HEAT_STRESS"
      ? "var(--status-warning-bg)"
      : "var(--status-success-bg)";

  const firstPhoto = cow.photos?.[0];
  const photoUrl = firstPhoto ? `/uploads/${firstPhoto}` : null;

  const rows = [
    ["Fazenda", cow.farm?.name ?? "--"],
    ["Raça", cow.breed ?? "--"],
    ["Peso", cow.weight ? `${cow.weight} kg` : "--"],
    ["Idade", age(cow.birthDate)],
    ["Colar", cow.collar?.name ?? "Sem colar"],
    ["Status", statusLabel],
    ["Dias em lactação", "--"],
    ["Status reprodutivo", "--"],
  ];

  const arrowBtn: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 32,
    height: 32,
    borderRadius: 999,
    background: C.card,
    border: `1px solid ${C.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    transition: "opacity 0.15s",
  };

  return (
    <div style={{ gridColumn: "span 3", position: "relative" }}>
      {onPrev && (
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          style={{ ...arrowBtn, left: -16, opacity: hasPrev ? 1 : 0.3 }}
          title="Vaca anterior"
        >
          <ChevronLeft size={16} color={C.text} />
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={!hasNext}
          style={{ ...arrowBtn, right: -16, opacity: hasNext ? 1 : 0.3 }}
          title="Próxima vaca"
        >
          <ChevronRightIcon size={16} color={C.text} />
        </button>
      )}

      <section style={{ ...cardStyle }}>
        {/* Photo */}
        <div
          style={{
            position: "relative",
            width: 140,
            height: 140,
            margin: "0 auto",
            borderRadius: 999,
            overflow: "hidden",
            border: `4px solid ${C.bg}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={cow.tag}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "var(--status-success-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CowHead size={56} color={C.green} />
            </div>
          )}
          <button
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 28,
              height: 28,
              borderRadius: 999,
              background: C.card,
              border: `1px solid ${C.border}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            <CameraIcon style={{ width: 13, height: 13, color: C.green }} />
          </button>
        </div>

        {/* Name + status */}
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <div
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 26,
              color: C.text,
              fontWeight: 400,
            }}
          >
            {cow.name || cow.tag}
          </div>
          <div
            style={{
              fontSize: 11,
              color: C.muted,
              marginTop: 2,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Brinco {cow.tag}
          </div>
          <span
            style={{
              display: "inline-block",
              marginTop: 8,
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 999,
              background: statusBg,
              color: statusColor,
            }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Info rows */}
        <dl style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(([k, v]) => (
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
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "var(--status-success-bg)",
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
            marginTop: 16,
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
          onClick={() => (window.location.href = `/cows/${cow.id}`)}
        >
          Ver perfil completo
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </section>
    </div>
  );
}

function Skeleton() {
  const pulse = {
    background: "var(--bg-elev-2)",
    animation: "pulse 1.5s ease-in-out infinite",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ width: 140, height: 140, borderRadius: 999, ...pulse }} />
      <div style={{ width: 100, height: 20, borderRadius: 8, ...pulse }} />
      <div
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: "100%", height: 14, borderRadius: 8, ...pulse }} />
        ))}
      </div>
    </div>
  );
}
