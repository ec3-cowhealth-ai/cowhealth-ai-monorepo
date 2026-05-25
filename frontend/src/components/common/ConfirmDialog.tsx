import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isDangerous = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "400px" }}
      >
        <div className="modal-card__header">
          <h2 className="modal-card__title">{title}</h2>
          <button className="modal-card__close" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-card__body">
          {description && (
            <p style={{ margin: 0, fontSize: "var(--t-body)" }}>
              {description}
            </p>
          )}
          {children}
        </div>

        <div className="modal-card__footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${isDangerous ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
