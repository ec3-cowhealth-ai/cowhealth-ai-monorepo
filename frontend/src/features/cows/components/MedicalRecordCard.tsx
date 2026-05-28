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
  CHECKUP:   "rgba(107,180,232,0.12)",
  PROCEDURE: "var(--status-warning-bg)",
  MEDICATION: "var(--status-success-bg)",
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
    <div style={{ ...cardStyle, padding: 14, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Badge */}
        <span
          style={{
            flexShrink: 0,
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            background: bg,
            color,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginTop: 2,
          }}
        >
          {label}
        </span>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 2px 0", fontSize: 13, fontWeight: 600, color: C.text }}>
            {record.title}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: C.muted }}>
            {date}
            {record.user && ` · ${record.user.name}`}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {record.notes && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}
              title={expanded ? "Recolher" : "Ver notas"}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => deleteRecord(record.id)}
              disabled={isPending}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.red, padding: 4, opacity: isPending ? 0.5 : 1 }}
              title="Excluir registro"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible notes */}
      {expanded && record.notes && (
        <p
          style={{
            margin: "10px 0 0 0",
            fontSize: 12,
            color: C.muted,
            borderTop: `1px solid ${C.border}`,
            paddingTop: 8,
            lineHeight: 1.5,
          }}
        >
          {record.notes}
        </p>
      )}
    </div>
  );
};
