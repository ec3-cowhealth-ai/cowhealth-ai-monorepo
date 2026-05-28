import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState, FormModal } from "@components/common";
import { Plus } from "lucide-react";
import { CollarCard } from "../components/CollarCard";
import { useCollars, useCreateCollar } from "../hooks/useCollars";
import { useFarms } from "../../farms/hooks/useFarms";
import { useMe } from "../../../hooks/useAuth";
import { COLLAR_STATUS_VALUES, DATA_FREQUENCY_VALUES } from "../../../types/collars.ts";
import type { CollarStatus, DataFrequency } from "../../../types/collars.ts";

// ─── Modal de Criação ─────────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: {
    name: string;
    status: CollarStatus;
    dataFrequency: DataFrequency;
    farmId?: number;
  }) => void;
}

function CreateCollarModal({ open, onClose, isLoading, onSubmit }: CreateModalProps) {
  const { data: farms } = useFarms();
  const [form, setForm] = useState({
    name: "",
    status: COLLAR_STATUS_VALUES.ACTIVE as CollarStatus,
    dataFrequency: DATA_FREQUENCY_VALUES.DEFAULT as DataFrequency,
    farmId: "" as string | number,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      farmId: form.farmId ? Number(form.farmId) : undefined,
    });
    setForm({
      name: "",
      status: COLLAR_STATUS_VALUES.ACTIVE,
      dataFrequency: DATA_FREQUENCY_VALUES.DEFAULT,
      farmId: "",
    });
  };

  return (
    <FormModal
      open={open}
      title="Nova Coleira"
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
          placeholder="Ex: RF10A-001"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="form-field">
        <label className="form-field__label">Fazenda Destino (Opcional)</label>
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

export const CollarsPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: user } = useMe();
  const isSuperAdmin = user?.roles.some((r) => r.name === "SuperAdmin");

  const { data: collars, isLoading } = useCollars();
  const { mutate: createCollar, isPending: creating } = useCreateCollar();

  const filteredCollars = useMemo(() => {
    if (!collars) return [];
    if (!statusFilter) return collars;
    return collars.filter((c) => c.status === statusFilter);
  }, [collars, statusFilter]);

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Coleiras" />
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

  return (
    <div className="app-page">
      <AppBar
        title="Coleiras"
        actions={
          isSuperAdmin && (
            <button className="app-bar__action" onClick={() => setShowCreate(true)}>
              <Plus size={20} />
            </button>
          )
        }
      />

      <div className="app-page__section">
        {/* Status Filter */}
        <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
          <button
            className={`btn btn-sm ${!statusFilter ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter("")}
          >
            Todas ({collars?.length || 0})
          </button>
          <button
            className={`btn btn-sm ${statusFilter === COLLAR_STATUS_VALUES.ACTIVE ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(COLLAR_STATUS_VALUES.ACTIVE)}
          >
            Ativas ({collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.ACTIVE).length || 0})
          </button>
          <button
            className={`btn btn-sm ${statusFilter === COLLAR_STATUS_VALUES.INACTIVE ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(COLLAR_STATUS_VALUES.INACTIVE)}
          >
            Inativas (
            {collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.INACTIVE).length || 0})
          </button>
          <button
            className={`btn btn-sm ${statusFilter === COLLAR_STATUS_VALUES.MAINTENANCE ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(COLLAR_STATUS_VALUES.MAINTENANCE)}
          >
            Manutenção (
            {collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.MAINTENANCE).length || 0})
          </button>
        </div>

        {/* Collars Grid */}
        {filteredCollars.length === 0 ? (
          <EmptyState
            icon="⌚"
            title="Nenhuma coleira encontrada"
            description="Nenhuma coleira com esse status."
          />
        ) : (
          <div className="grid grid--2">
            {filteredCollars.map((collar) => (
              <CollarCard
                key={collar.id}
                collar={collar}
                onClick={() => navigate(`/collars/${collar.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {isSuperAdmin && (
        <CreateCollarModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          isLoading={creating}
          onSubmit={(data) => createCollar(data, { onSuccess: () => setShowCreate(false) })}
        />
      )}
    </div>
  );
};
