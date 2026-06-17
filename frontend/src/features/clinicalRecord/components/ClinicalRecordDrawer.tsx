import { X } from "lucide-react";
import ClinicalRecordForm from "./ClinicalRecordForm";
import type { CreateClinicalRecordInput } from "../types";

interface ClinicalRecordDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClinicalRecordInput) => Promise<void>;
  isLoading?: boolean;
}

export default function ClinicalRecordDrawer({ open, onClose, onSubmit, isLoading }: ClinicalRecordDrawerProps) {
  if (!open) return null;

  const handleSubmit = async (data: CreateClinicalRecordInput) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

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

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "100%",
          maxWidth: 600,
          background: "var(--bg-elev-1)",
          boxShadow: "-2px 0 20px rgba(0, 0, 0, 0.25)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.5rem",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>Novo Atendimento</h2>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
          }}
        >
          <ClinicalRecordForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Registrar atendimento"
          />
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
