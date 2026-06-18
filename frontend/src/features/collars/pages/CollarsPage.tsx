import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner, FormModal } from "@components/common";
import { Plus, WifiCog } from "lucide-react";
import { CollarCard } from "../components/CollarCard";
import { useCollars, useCreateCollar } from "../hooks/useCollars";
import { useFarms } from "@features/farms/hooks/useFarms";
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";
import { COLLAR_STATUS_VALUES, DATA_FREQUENCY_VALUES } from "@/types/collars";
import type { CollarStatus, DataFrequency } from "@/types/collars";
import { C, cardStyle } from "@features/dashboard/constants/colors";

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

  const canCreate = useHasPermission(PERMISSIONS.CREATE_COLLAR);

  const { data: collars, isLoading } = useCollars();
  const { mutate: createCollar, isPending: creating } = useCreateCollar();

  const filteredCollars = useMemo(() => {
    if (!collars) return [];
    if (!statusFilter) return collars;
    return collars.filter((c) => c.status === statusFilter);
  }, [collars, statusFilter]);

  const counts = {
    all: collars?.length || 0,
    active: collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.ACTIVE).length || 0,
    inactive: collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.INACTIVE).length || 0,
    maintenance: collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.MAINTENANCE).length || 0,
  };

  const filterItems: [string, string, number][] = [
    ["", "Todas", counts.all],
    [COLLAR_STATUS_VALUES.ACTIVE, "Ativas", counts.active],
    [COLLAR_STATUS_VALUES.INACTIVE, "Inativas", counts.inactive],
    [COLLAR_STATUS_VALUES.MAINTENANCE, "Manutenção", counts.maintenance],
  ];

  if (isLoading) {
    return (
      <div style={{ background: C.bg, minHeight: "100%" }}>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}
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
          canCreate && (
            <button
              className="app-bar__action"
              aria-label="Criar coleira"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={20} />
            </button>
          )
        }
      />

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <WifiCog size={34} color={C.green} />
        <div>
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 34,
              lineHeight: 1,
              margin: 0,
              color: C.text,
              fontWeight: 400,
            }}
          >
            Coleiras
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: C.muted }}>
            {counts.all} dispositivo{counts.all !== 1 ? "s" : ""} · {counts.active} ativo
            {counts.active !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filterItems.map(([val, label, count]) => {
          const active = statusFilter === val;
          return (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                border: `1px solid ${active ? C.green : C.border}`,
                background: active ? C.green : C.card,
                color: active ? "var(--primary-on)" : C.muted,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {label}
              <span style={{ opacity: active ? 0.75 : 0.55, fontSize: 11 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredCollars.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: 48,
            textAlign: "center",
          }}
        >
          <WifiCog size={40} color={C.muted} />
          <p style={{ margin: 0, fontSize: 14, color: C.muted }}>Nenhuma coleira encontrada</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filteredCollars.map((collar) => (
            <CollarCard
              key={collar.id}
              collar={collar}
              onClick={() => navigate(`/collars/${collar.id}`)}
            />
          ))}
        </div>
      )}

      {canCreate && (
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
