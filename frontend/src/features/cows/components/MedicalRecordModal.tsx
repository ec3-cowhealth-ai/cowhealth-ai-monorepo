import { useState } from "react";
import { FormModal } from "@components/common";
import { useCreateMedicalRecord } from "../hooks/useMedicalRecords";
import type { MedicalRecordType } from "@/types/cows";

interface Props {
  open: boolean;
  cowId: number;
  onClose: () => void;
}

const toDatetimeLocal = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const MedicalRecordModal = ({ open, cowId, onClose }: Props) => {
  const { mutate: create, isPending } = useCreateMedicalRecord(cowId);

  const [form, setForm] = useState({
    type: "CHECKUP" as MedicalRecordType,
    title: "",
    notes: "",
    recordedAt: toDatetimeLocal(new Date()),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      {
        type: form.type,
        title: form.title,
        notes: form.notes || undefined,
        recordedAt: new Date(form.recordedAt).toISOString(),
      },
      {
        onSuccess: () => {
          setForm({
            type: "CHECKUP",
            title: "",
            notes: "",
            recordedAt: toDatetimeLocal(new Date()),
          });
          onClose();
        },
      },
    );
  };

  return (
    <FormModal
      open={open}
      title="Novo Registro Clínico"
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isPending}
    >
      <div className="form-field">
        <label className="form-field__label is-required">Tipo</label>
        <select
          className="form-field__select"
          value={form.type}
          required
          onChange={(e) => setForm({ ...form, type: e.target.value as MedicalRecordType })}
        >
          <option value="CHECKUP">Consulta</option>
          <option value="PROCEDURE">Procedimento</option>
          <option value="MEDICATION">Medicação</option>
        </select>
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Título</label>
        <input
          className="form-field__input"
          value={form.title}
          required
          placeholder="Ex: Check-up geral"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div className="form-field">
        <label className="form-field__label">Notas</label>
        <textarea
          className="form-field__input"
          value={form.notes}
          rows={3}
          placeholder="Observações clínicas (opcional)"
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ resize: "vertical" }}
        />
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Data do atendimento</label>
        <input
          type="datetime-local"
          className="form-field__input"
          value={form.recordedAt}
          required
          onChange={(e) => setForm({ ...form, recordedAt: e.target.value })}
        />
      </div>
    </FormModal>
  );
};
