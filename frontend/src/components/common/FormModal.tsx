import type { ReactNode } from "react";
import { X } from "lucide-react";

interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const FormModal = ({
  open,
  title,
  onClose,
  onSubmit,
  children,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  isLoading = false,
}: FormModalProps) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px" }}
      >
        <div className="modal-card__header">
          <h2 className="modal-card__title">{title}</h2>
          <button className="modal-card__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-card__body">{children}</div>

          <div className="modal-card__footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Salvando..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
