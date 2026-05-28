import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { MedicalRecord, MedicalRecordType } from "@/types/cows";
import { useDeleteMedicalRecord } from "../hooks/useMedicalRecords";
import { useHasPermission } from "@hooks/usePermission";
import { C, cardStyle } from "@features/dashboard/constants/colors";

const TYPE_LABEL: Record<MedicalRecordType, string> = {
  CHECKUP:   "Consulta",
  PROCEDURE: "Procedimento",
  MEDICATION: "Medicação",
};

const TYPE_COLOR: Record<MedicalRecordType, string> = {
  CHECKUP:   "#6bb4e8",
  PROCEDURE: C.orange,
  MEDICATION: C.green,
};

const TYPE_BG: Record<MedicalRecordType, string> = {
  CHECKUP:    "rgba(107,180,232,0.12)",
  PROCEDURE:  "#fdf3e7",
  MEDICATION: "#e8f5ee",
};


interface MedicalRecordCardProps {
  record: MedicalRecord;
  cowId: number;
}

export const MedicalRecordCard = ({ record, cowId }: MedicalRecordCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const canDelete = useHasPermission("Delete MedicalRecord");
  const { mutate: deleteRecord, isPending } = useDeleteMedicalRecord(cowId);

  const color  = TYPE_COLOR[record.type]  ?? C.muted;
  const bg     = TYPE_BG[record.type]    ?? "var(--status-success-bg)";
  const label  = TYPE_LABEL[record.type] ?? record.type;
  const date   = new Date(record.recordedAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div style={{ ...cardStyle, padding: 16, borderLeft: `3px solid ${color}` }}>

      {/* Linha topo: badge (esquerda) + ações (direita) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            background: bg,
            color,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          {record.notes && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: expanded ? C.bg : "none",
                border: "none", cursor: "pointer", color: C.muted,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              title={expanded ? "Recolher notas" : "Ver notas"}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => deleteRecord(record.id)}
              disabled={isPending}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "none", border: "none",
                cursor: isPending ? "default" : "pointer",
                color: C.red, opacity: isPending ? 0.4 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              title="Excluir registro"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Título em destaque */}
      <p
        style={{
          margin: "0 0 6px 0",
          fontSize: 16,
          fontWeight: 600,
          color: C.text,
          lineHeight: 1.25,
        }}
      >
        {record.title}
      </p>

      {/* Data + veterinário */}
      <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
        {date}
        {record.user && (
          <span style={{ marginLeft: 6, paddingLeft: 6, borderLeft: `1px solid ${C.border}` }}>
            {record.user.name}
          </span>
        )}
      </p>

      {/* Notas colapsáveis */}
      {expanded && record.notes && (
        <p
          style={{
            margin: "12px 0 0 0",
            fontSize: 13,
            color: C.muted,
            borderTop: `1px solid ${C.border}`,
            paddingTop: 10,
            lineHeight: 1.6,
          }}
        >
          {record.notes}
        </p>
      )}
    </div>
  );
};
