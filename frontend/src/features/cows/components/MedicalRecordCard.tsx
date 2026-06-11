import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { ConfirmDialog } from "@components/common";
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";
import { useDeleteMedicalRecord } from "../hooks/useMedicalRecords";
import { C, cardStyle } from "@features/dashboard/constants/colors";
import type { MedicalRecord, MedicalRecordType } from "@/types/cows";

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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

interface Props {
  record: MedicalRecord;
  cowId: number;
}

export const MedicalRecordCard = ({ record, cowId }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const canDelete = useHasPermission(PERMISSIONS.DELETE_MEDICAL_RECORD);
  const { mutate: deleteRecord, isPending } = useDeleteMedicalRecord(cowId);

  const color = TYPE_COLOR[record.type];

  return (
    <div
      style={{
        ...cardStyle,
        padding: "12px 14px",
        borderLeft: `3px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 999,
              background: `${color}22`,
              color,
              flexShrink: 0,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {TYPE_LABEL[record.type]}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {record.title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: C.muted }}>{formatDate(record.recordedAt)}</span>
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 2, display: "flex" }}
              title="Excluir registro"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {record.user && (
        <p style={{ margin: 0, fontSize: 11, color: C.muted }}>
          {record.user.name}
        </p>
      )}

      {record.notes && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer",
              color: C.muted, fontSize: 11, padding: 0, alignSelf: "flex-start",
            }}
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Ocultar notas" : "Ver notas"}
          </button>
          {expanded && (
            <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.5, paddingTop: 2 }}>
              {record.notes}
            </p>
          )}
        </>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Excluir Registro"
        description={`Tem certeza que deseja excluir "${record.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel={isPending ? "Excluindo..." : "Excluir"}
        isDangerous
        onConfirm={() => {
          deleteRecord(record.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
