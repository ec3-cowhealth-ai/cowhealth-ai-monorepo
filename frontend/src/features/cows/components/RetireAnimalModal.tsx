import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRetireCow } from "../hooks/useCows";

interface RetireAnimalModalProps {
  open: boolean;
  cowId: number;
  onClose: () => void;
}

export const RetireAnimalModal = ({ open, cowId, onClose }: RetireAnimalModalProps) => {
  const navigate = useNavigate();
  const [reason, setReason] = useState<"SALE" | "SLAUGHTER" | "DEATH" | null>(null);
  const { mutate: retireCow, isPending } = useRetireCow();

  if (!open) return null;

  const handleConfirm = () => {
    if (!reason) return;
    retireCow(
      { id: cowId, reason },
      {
        onSuccess: () => {
          onClose();
          navigate("/cows");
        },
      },
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <p className="modal-title">Aposentar Animal</p>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: "var(--t-sm)", color: "var(--danger)", fontWeight: 600, marginBottom: 8 }}>
            Esta ação é irreversível. O animal sairá do rebanho ativo.
          </p>
          <p style={{ fontSize: "var(--t-sm)", color: "var(--text-secondary)", marginBottom: 16 }}>
            Selecione o motivo da aposentadoria:
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className={`btn btn-sm ${reason === "SALE" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setReason("SALE")}
            >
              Venda
            </button>
            <button
              className={`btn btn-sm ${reason === "SLAUGHTER" ? "btn-danger" : "btn-ghost"}`}
              onClick={() => setReason("SLAUGHTER")}
            >
              Abate
            </button>
            <button
              className={`btn btn-sm ${reason === "DEATH" ? "btn-danger" : "btn-ghost"}`}
              onClick={() => setReason("DEATH")}
            >
              Falecimento
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isPending}>
            Cancelar
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleConfirm}
            disabled={!reason || isPending}
          >
            {isPending ? "Aposentando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};
