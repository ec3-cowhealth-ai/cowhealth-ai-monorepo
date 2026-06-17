import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateClinicalRecord,
  useUpdateClinicalRecord,
  useClinicalRecord,
} from "../hooks/useClinicalRecords";
import ClinicalRecordForm from "../components/ClinicalRecordForm";
import type { ClinicalRecord, CreateClinicalRecordInput } from "../types";

/** Converte null → undefined para compatibilidade com o formulário */
const toFormInput = (r: ClinicalRecord): Partial<CreateClinicalRecordInput> =>
  Object.fromEntries(
    Object.entries(r).map(([k, v]) => [k, v === null ? undefined : v]),
  ) as Partial<CreateClinicalRecordInput>;

export default function ClinicalRecordFormPage() {
  const { id, recordId } = useParams<{ id: string; recordId?: string }>();
  const cowId = Number(id);
  const isEdit = !!recordId;
  const navigate = useNavigate();

  const { data: existing, isLoading: loadingExisting } = useClinicalRecord(
    cowId,
    isEdit ? Number(recordId) : 0,
  );

  const create = useCreateClinicalRecord(cowId);
  const update = useUpdateClinicalRecord(cowId, Number(recordId));

  const handleSubmit = async (data: CreateClinicalRecordInput) => {
    if (isEdit) {
      await update.mutateAsync(data);
      navigate(`/cows/${cowId}/clinical-records/${recordId}`);
    } else {
      const created = await create.mutateAsync(data);
      navigate(`/cows/${cowId}/clinical-records/${created.id}`);
    }
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="app-page">
        <p style={{ opacity: 0.6 }}>Carregando…</p>
      </div>
    );
  }

  return (
    <div className="app-page">
      <button
        className="btn btn-ghost btn-sm"
        onClick={() =>
          navigate(
            isEdit
              ? `/cows/${cowId}/clinical-records/${recordId}`
              : `/cows/${cowId}/clinical-records`,
          )
        }
        style={{ marginBottom: "1rem" }}
      >
        ← Voltar
      </button>
      <h1 style={{ marginTop: 0, marginBottom: "1.5rem" }}>
        {isEdit ? "Editar Atendimento" : "Novo Atendimento Clínico"}
      </h1>
      <ClinicalRecordForm
        initial={existing ? toFormInput(existing) : {}}
        onSubmit={handleSubmit}
        isLoading={create.isPending || update.isPending}
        submitLabel={isEdit ? "Salvar alterações" : "Registrar atendimento"}
      />
    </div>
  );
}
