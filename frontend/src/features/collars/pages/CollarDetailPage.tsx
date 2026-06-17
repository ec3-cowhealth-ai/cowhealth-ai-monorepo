import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState, StatusBadge, FormModal, ConfirmDialog } from "@components/common";
import { XCircle, Edit2, Trash2, Warehouse } from "lucide-react";
import { useCollar, useUpdateCollar, useDeleteCollar } from "../hooks/useCollars";
import { useFarms } from "../../farms/hooks/useFarms";
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";
import { COLLAR_STATUS_VALUES } from "@/types/collars";
import type { CollarStatus, DataFrequency } from "@/types/collars";

const getStatusTone = (status: string): "success" | "warning" | "danger" | "muted" => {
  switch (status) {
    case COLLAR_STATUS_VALUES.ACTIVE:
      return "success";
    case COLLAR_STATUS_VALUES.MAINTENANCE:
      return "warning";
    case COLLAR_STATUS_VALUES.BATTERY:
      return "danger";
    default:
      return "muted";
  }
};

// ─── Modal de Edição ──────────────────────────────────────────────────────────

interface EditModalProps {
  collar: { name: string; status: CollarStatus; dataFrequency: DataFrequency; farmId?: number | null };
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: { name: string; status: CollarStatus; dataFrequency: DataFrequency; farmId?: number }) => void;
}

function EditCollarModal({ collar, open, onClose, isLoading, onSubmit }: EditModalProps) {
  const { data: farms } = useFarms();
  const [form, setForm] = useState({
    name: collar.name,
    status: collar.status,
    dataFrequency: collar.dataFrequency,
    farmId: collar.farmId || ("" as string | number),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      farmId: form.farmId ? Number(form.farmId) : undefined,
    });
  };

  return (
    <FormModal
      open={open}
      title="Editar Coleira"
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    >
      <div className="form-field">
        <label className="form-field__label is-required">Nome / ID do Dispositivo</label>
        <input
          className="form-field__input"
          value={form.name}
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="form-field">
        <label className="form-field__label">Fazenda Alocada (Opcional)</label>
        <select
          className="form-field__select"
          value={form.farmId}
          onChange={(e) => setForm({ ...form, farmId: e.target.value })}
        >
          <option value="">Sem fazenda (Estoque)</option>
          {farms?.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Status</label>
        <select
          className="form-field__select"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as CollarStatus })}
        >
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="MAINTENANCE">Manutenção</option>
          <option value="BATTERY">Bateria Fraca</option>
        </select>
      </div>

      <div className="form-field">
        <label className="form-field__label is-required">Frequência de Dados</label>
        <select
          className="form-field__select"
          value={form.dataFrequency}
          onChange={(e) => setForm({ ...form, dataFrequency: e.target.value as DataFrequency })}
        >
          <option value="HIGHER">Alta (2 min)</option>
          <option value="DEFAULT">Padrão (10 min)</option>
          <option value="LOWER">Baixa (60 min)</option>
        </select>
      </div>
    </FormModal>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────

export const CollarDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const canEdit = useHasPermission(PERMISSIONS.UPDATE_COLLAR);
  const canDelete = useHasPermission(PERMISSIONS.DELETE_COLLAR);

  const { data: collar, isLoading } = useCollar(id || "");
  const { mutate: updateCollar, isPending: updating } = useUpdateCollar();
  const { mutate: deleteCollar, isPending: deleting } = useDeleteCollar();

  const linkedCow = collar?.cow;

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes do Colar" showBack />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!collar) {
    return (
      <div className="app-page">
        <AppBar title="Detalhes do Colar" showBack />
        <EmptyState icon={<XCircle size={40} />} title="Coleira não encontrada" />
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppBar
        title={collar.name}
        showBack
        actions={
          (canEdit || canDelete) && (
            <div style={{ display: "flex", gap: 12 }}>
              {canEdit && (
                <button className="app-bar__action" aria-label="Editar coleira" onClick={() => setShowEdit(true)}>
                  <Edit2 size={18} />
                </button>
              )}
              {canDelete && (
                <button className="app-bar__action" aria-label="Excluir coleira" onClick={() => setShowDelete(true)}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          )
        }
      />

      <div className="app-content">
        {/* Collar Info */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--s-3)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "var(--t-h2)", fontWeight: 700 }}>{collar.name}</h3>
            <StatusBadge tone={getStatusTone(collar.status)}>{collar.status}</StatusBadge>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--s-3)",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Frequencia de Dados
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                {collar.dataFrequency}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Fazenda alocada
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Warehouse size={14} /> {collar.farm?.name || "Nenhuma"}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Cadastrado em
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                {new Date(collar.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Linked Cow */}
        <div className="card">
          <h3
            style={{
              margin: "0 0 var(--s-3) 0",
              fontSize: "var(--t-h2)",
              fontWeight: 700,
            }}
          >
            Vaca Vinculada
          </h3>

          {linkedCow ? (
            <div
              style={{
                padding: "var(--s-3)",
                background: "var(--bg-elev-2)",
                borderRadius: "var(--r-md)",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/cows/${linkedCow.id}`)}
            >
              <p
                style={{
                  margin: "0 0 var(--s-1) 0",
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                {linkedCow.tag}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Status: {linkedCow.status}
              </p>
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: "var(--t-sm)",
                color: "var(--text-secondary)",
                fontStyle: "italic",
              }}
            >
              Nenhuma vaca vinculada
            </p>
          )}
        </div>
      </div>

      {canEdit && (
        <EditCollarModal
          collar={collar}
          open={showEdit}
          onClose={() => setShowEdit(false)}
          isLoading={updating}
          onSubmit={(data) =>
            updateCollar({ id: collar.id.toString(), input: data }, { onSuccess: () => setShowEdit(false) })
          }
        />
      )}

      {canDelete && (
        <ConfirmDialog
          open={showDelete}
          title="Excluir Coleira"
          description={`Tem certeza que deseja excluir a coleira "${collar.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel={deleting ? "Excluindo..." : "Excluir"}
          isDangerous
          onConfirm={() => deleteCollar(collar.id.toString(), { onSuccess: () => navigate("/collars") })}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
};
