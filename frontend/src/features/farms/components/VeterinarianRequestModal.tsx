import { useState } from "react";
import { X } from "lucide-react";

interface VeterinarianRequestModalProps {
  open: boolean;
  farmName: string;
  onClose: () => void;
  onSubmit: (data: VeterinarianRequestData) => void;
  isLoading?: boolean;
}

export interface VeterinarianRequestData {
  reason: string;
  preferredDate: string;
  contactMethod: "phone" | "email";
  notes: string;
}

export const VeterinarianRequestModal = ({
  open,
  farmName,
  onClose,
  onSubmit,
  isLoading,
}: VeterinarianRequestModalProps) => {
  const [form, setForm] = useState<VeterinarianRequestData>({
    reason: "",
    preferredDate: "",
    contactMethod: "phone",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ reason: "", preferredDate: "", contactMethod: "phone", notes: "" });
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.4)",
          zIndex: 999,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="modal-overlay"
        onClick={onClose}
      >
        <div
          className="modal-card"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 500 }}
        >
          <div className="modal-card__header">
            <div>
              <h2 className="modal-card__title">Solicitar Veterinário</h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "var(--t-sm)",
                  color: "var(--text-muted)",
                }}
              >
                Fazenda: <strong style={{ color: "var(--text-primary)" }}>{farmName}</strong>
              </p>
            </div>
            <button className="modal-card__close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-card__body">
              <div className="form-field">
                <label className="form-field__label is-required">Motivo da solicitação</label>
                <textarea
                  className="form-field__input"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Ex: Avaliação de rebanho, vacinação, problema de saúde específico..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-field__label is-required">Data preferida</label>
                <input
                  type="date"
                  className="form-field__input"
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-field__label is-required">Método de contato</label>
                <select
                  className="form-field__input"
                  value={form.contactMethod}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contactMethod: e.target.value as "phone" | "email",
                    })
                  }
                >
                  <option value="phone">Telefone</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-field__label">Notas adicionais</label>
                <textarea
                  className="form-field__input"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Informações adicionais relevantes..."
                  rows={2}
                />
              </div>
            </div>

            <div className="modal-card__footer">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Solicitar atendimento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
