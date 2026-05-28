import { useForm } from "react-hook-form";
import { FormModal } from "@components/common";
import { useCreateMedicalRecord } from "../hooks/useMedicalRecords";
import type { CreateMedicalRecordInput } from "@/types/cows";

interface MedicalRecordModalProps {
  open: boolean;
  cowId: number;
  onClose: () => void;
}

const defaultDate = () => new Date().toISOString().slice(0, 16);

export const MedicalRecordModal = ({ open, cowId, onClose }: MedicalRecordModalProps) => {
  const { mutate: create, isPending } = useCreateMedicalRecord(cowId);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<CreateMedicalRecordInput>({
      defaultValues: { type: "CHECKUP", title: "", notes: "", recordedAt: defaultDate() },
    });

  const onValid = (data: CreateMedicalRecordInput) => {
    const payload: CreateMedicalRecordInput = {
      ...data,
      notes: data.notes?.trim() || undefined,
    };
    create(payload, {
      onSuccess: () => {
        reset({ type: "CHECKUP", title: "", notes: "", recordedAt: defaultDate() });
        onClose();
      },
    });
  };

  return (
    <FormModal
      open={open}
      title="Novo Registro Clínico"
      onClose={onClose}
      onSubmit={handleSubmit(onValid)}
      isLoading={isPending}
      submitLabel="Salvar Registro"
    >
      <div className="form-field">
        <label className="form-field__label is-required">Tipo</label>
        <select
          className="form-field__select"
          {...register("type", { required: true })}
        >
          <option value="CHECKUP">Consulta</option>
          <option value="PROCEDURE">Procedimento</option>
          <option value="MEDICATION">Medicação</option>
        </select>
        {errors.type && (
          <span style={{ fontSize: 11, color: "var(--danger)" }}>Tipo obrigatório</span>
        )}
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Título</label>
        <input
          className="form-field__input"
          placeholder="Ex.: Vacinação febre aftosa"
          {...register("title", { required: "Título é obrigatório" })}
        />
        {errors.title && (
          <span style={{ fontSize: 11, color: "var(--danger)" }}>{errors.title.message}</span>
        )}
      </div>

      <div className="form-field">
        <label className="form-field__label">Notas (opcional)</label>
        <textarea
          className="form-field__input"
          rows={3}
          placeholder="Observações clínicas..."
          style={{ resize: "vertical" }}
          {...register("notes")}
        />
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Data / Hora</label>
        <input
          type="datetime-local"
          className="form-field__input"
          {...register("recordedAt", { required: true })}
        />
      </div>
    </FormModal>
  );
};
