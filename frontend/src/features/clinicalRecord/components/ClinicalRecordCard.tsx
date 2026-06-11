import { useNavigate } from "react-router-dom";
import type { ClinicalRecordSummary, ClinicalStatus } from "../types";

const STATUS_LABEL: Record<ClinicalStatus, string> = {
  STABLE: "Estável",
  MONITORING: "Monitoramento",
  CRITICAL: "Crítico",
  RECOVERED: "Recuperado",
  REFERRED: "Encaminhado",
};

const STATUS_CLASS: Record<ClinicalStatus, string> = {
  STABLE: "status-badge--success",
  MONITORING: "status-badge--warning",
  CRITICAL: "status-badge--danger",
  RECOVERED: "status-badge--info",
  REFERRED: "status-badge--muted",
};

interface Props {
  cowId: number;
  record: ClinicalRecordSummary;
}

export default function ClinicalRecordCard({ cowId, record }: Props) {
  const navigate = useNavigate();
  const date = new Date(record.recordDate).toLocaleDateString("pt-BR");

  return (
    <div
      className="card card--clickable"
      onClick={() => navigate(`/cows/${cowId}/clinical-records/${record.id}`)}
      style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600 }}>{date}</span>
        <span className={`status-badge ${STATUS_CLASS[record.clinicalStatus]}`}>
          {STATUS_LABEL[record.clinicalStatus]}
        </span>
      </div>
      {record.diagnosis && (
        <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.8 }}>
          {record.diagnosis.length > 100 ? record.diagnosis.slice(0, 100) + "…" : record.diagnosis}
        </p>
      )}
      <div style={{ fontSize: "0.75rem", opacity: 0.6, display: "flex", justifyContent: "space-between" }}>
        <span>Dr(a). {record.veterinarian.name}</span>
        {record.followUpRequired && (
          <span style={{ color: "var(--color-warning, #f59e0b)" }}>⚠ Acompanhamento necessário</span>
        )}
      </div>
    </div>
  );
}
