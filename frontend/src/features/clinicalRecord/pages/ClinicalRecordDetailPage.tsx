import { useNavigate, useParams } from "react-router-dom";
import { useClinicalRecord, useDeleteClinicalRecord } from "../hooks/useClinicalRecords";
import ClinicalRecordDetail from "../components/ClinicalRecordDetail";
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";

export default function ClinicalRecordDetailPage() {
  const { id, recordId } = useParams<{ id: string; recordId: string }>();
  const cowId = Number(id);
  const recId = Number(recordId);
  const navigate = useNavigate();
  const canUpdate = useHasPermission(PERMISSIONS.UPDATE_CLINICAL_RECORD);
  const canDelete = useHasPermission(PERMISSIONS.DELETE_CLINICAL_RECORD);

  const { data: record, isLoading, isError } = useClinicalRecord(cowId, recId);
  const del = useDeleteClinicalRecord(cowId);

  const handleDelete = async () => {
    if (!confirm("Excluir este atendimento? Esta ação não pode ser desfeita.")) return;
    await del.mutateAsync(recId);
    navigate(`/cows/${cowId}/clinical-records`);
  };

  return (
    <div className="app-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/cows/${cowId}/clinical-records`)}>
          ← Prontuários
        </button>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {canUpdate && record && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/cows/${cowId}/clinical-records/${recId}/edit`)}>
              Editar
            </button>
          )}
          {canDelete && record && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={del.isPending}>
              {del.isPending ? "Excluindo…" : "Excluir"}
            </button>
          )}
        </div>
      </div>

      {isLoading && <p style={{ opacity: 0.6 }}>Carregando…</p>}
      {isError && <p style={{ color: "var(--color-danger, #ef4444)" }}>Prontuário não encontrado.</p>}
      {record && <ClinicalRecordDetail record={record} />}
    </div>
  );
}
