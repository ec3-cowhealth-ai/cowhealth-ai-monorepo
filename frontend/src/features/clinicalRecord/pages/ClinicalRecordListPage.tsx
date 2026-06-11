import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useClinicalRecords, useCreateClinicalRecord } from "../hooks/useClinicalRecords";
import ClinicalRecordCard from "../components/ClinicalRecordCard";
import ClinicalRecordDrawer from "../components/ClinicalRecordDrawer";
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";
import type { CreateClinicalRecordInput } from "../types";

export default function ClinicalRecordListPage() {
  const { id } = useParams<{ id: string }>();
  const cowId = Number(id);
  const navigate = useNavigate();
  const [showDrawer, setShowDrawer] = useState(false);
  const canCreate = useHasPermission(PERMISSIONS.CREATE_CLINICAL_RECORD);
  const { data: records, isLoading, isError } = useClinicalRecords(cowId);
  const create = useCreateClinicalRecord(cowId);

  const handleCreateSubmit = async (data: CreateClinicalRecordInput) => {
    await create.mutateAsync(data);
  };

  return (
    <div className="app-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/cows/${cowId}`)} style={{ marginBottom: "0.5rem" }}>
            ← Voltar
          </button>
          <h1 style={{ margin: 0 }}>Prontuário Clínico</h1>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowDrawer(true)}>
            + Novo Atendimento
          </button>
        )}
      </div>

      {isLoading && <p style={{ opacity: 0.6 }}>Carregando…</p>}
      {isError && <p style={{ color: "var(--color-danger, #ef4444)" }}>Erro ao carregar prontuários.</p>}
      {records && records.length === 0 && (
        <p style={{ opacity: 0.6 }}>Nenhum atendimento registrado ainda.</p>
      )}
      {records && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {records.map((r) => (
            <ClinicalRecordCard key={r.id} cowId={cowId} record={r} />
          ))}
        </div>
      )}

      <ClinicalRecordDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        onSubmit={handleCreateSubmit}
        isLoading={create.isPending}
      />
    </div>
  );
}
