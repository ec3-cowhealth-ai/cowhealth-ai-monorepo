import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner, FormModal } from "@components/common";
import { Search, ChevronRight, Plus } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { StatusDot } from "@components/ui/StatusDot";
import { useCows, useCreateCow } from "../hooks/useCows";
import { useFarmContext } from "../../../context/FarmContext";
import { useMe } from "../../../hooks/useAuth";
import { COW_STATUS_VALUES } from "../../../types/cows";
import type { Cow } from "../../../types/cows";

type StatusFilter = "" | "HEALTHY" | "ALERT" | "HEAT_STRESS" | "CALVING";

const STATUS_LABEL: Record<string, string> = {
  HEALTHY: "Saudável",
  ALERT: "Alerta",
  HEAT_STRESS: "Est. Térmico",
  CALVING: "Parto",
};

const statusTone = (s: string) => {
  if (s === COW_STATUS_VALUES.ALERT) return "danger" as const;
  if (s === COW_STATUS_VALUES.HEAT_STRESS) return "warn" as const;
  if (s === COW_STATUS_VALUES.CALVING) return "info" as const;
  return "success" as const;
};

const statusColor = (s: string) => {
  if (s === COW_STATUS_VALUES.ALERT) return "var(--danger)";
  if (s === COW_STATUS_VALUES.HEAT_STRESS) return "var(--warning)";
  if (s === COW_STATUS_VALUES.CALVING) return "var(--info)";
  return "var(--success)";
};

// ─── Modal de Criação ─────────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  farmId: number;
  onSubmit: (data: {
    tag: string;
    name: string;
    breed: string;
    weight?: number;
    birthDate?: string;
    status: string;
    farmId: number;
  }) => void;
}

function CreateCowModal({ open, onClose, isLoading, farmId, onSubmit }: CreateModalProps) {
  const [form, setForm] = useState({
    tag: "",
    name: "",
    breed: "",
    weight: "",
    birthDate: "",
    status: "HEALTHY",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      weight: form.weight ? Number(form.weight) : undefined,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : undefined,
      farmId,
    });
    setForm({ tag: "", name: "", breed: "", weight: "", birthDate: "", status: "HEALTHY" });
  };

  return (
    <FormModal
      open={open}
      title="Novo Animal"
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    >
      <div className="form-field">
        <label className="form-field__label is-required">Tag (Brinco)</label>
        <input
          className="form-field__input"
          value={form.tag}
          required
          placeholder="Ex: BR123"
          onChange={(e) => setForm({ ...form, tag: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Nome</label>
        <input
          className="form-field__input"
          value={form.name}
          required
          placeholder="Ex: Mimosa"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Raça</label>
        <input
          className="form-field__input"
          value={form.breed}
          required
          placeholder="Ex: Nelore"
          onChange={(e) => setForm({ ...form, breed: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label">Peso (kg)</label>
        <input
          type="number"
          step="0.01"
          className="form-field__input"
          value={form.weight}
          placeholder="Ex: 450.5"
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label">Data de Nascimento</label>
        <input
          type="date"
          className="form-field__input"
          value={form.birthDate}
          onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Status Inicial</label>
        <select
          className="form-field__select"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="HEALTHY">Saudável</option>
          <option value="ALERT">Alerta</option>
          <option value="HEAT_STRESS">Estresse Térmico</option>
          <option value="CALVING">Parto</option>
        </select>
      </div>
    </FormModal>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────

export const CowsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [showSearch, setShowSearch] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const { data: me } = useMe();
  const canCRUD = me?.profile === "ADMIN" || me?.profile === "MANAGER";

  const { selectedFarm } = useFarmContext();
  const farmId = selectedFarm ? String(selectedFarm.id) : undefined;
  const { data: cows, isLoading } = useCows({ farmId });
  const { mutate: createCow, isPending: creating } = useCreateCow();

  const counts = useMemo(
    () => ({
      all: cows?.length || 0,
      healthy: cows?.filter((c: Cow) => c.status === COW_STATUS_VALUES.HEALTHY).length || 0,
      alert: cows?.filter((c: Cow) => c.status === COW_STATUS_VALUES.ALERT).length || 0,
      heat: cows?.filter((c: Cow) => c.status === COW_STATUS_VALUES.HEAT_STRESS).length || 0,
      calving: cows?.filter((c: Cow) => c.status === COW_STATUS_VALUES.CALVING).length || 0,
    }),
    [cows],
  );

  const filtered = useMemo(() => {
    if (!cows) return [];
    return cows.filter((cow: Cow) => {
      const matchSearch =
        !search ||
        cow.tag.toLowerCase().includes(search.toLowerCase()) ||
        cow.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || cow.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [cows, search, statusFilter]);

  return (
    <div className="app-page">
      <AppBar
        title="Rebanho"
        subtitle={`${selectedFarm?.name ?? ""} · ${counts.all} animais`}
        actions={
          <div style={{ display: "flex", gap: 12 }}>
            <button className="app-bar__action" onClick={() => setShowSearch((v) => !v)}>
              <Search size={20} />
            </button>
            {canCRUD && (
              <button className="app-bar__action" onClick={() => setShowCreate(true)}>
                <Plus size={20} />
              </button>
            )}
          </div>
        }
      />

      <div className="app-content">
        {showSearch && (
          <div className="form-field" style={{ marginBottom: 0 }}>
            <input
              autoFocus
              type="text"
              className="form-field__input"
              placeholder="Buscar por tag ou nome…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Filter chips */}
        <div className="filter-chips">
          {(
            [
              ["", "Todas", counts.all],
              [COW_STATUS_VALUES.HEALTHY, "Saudáveis", counts.healthy],
              [COW_STATUS_VALUES.ALERT, "Alertas", counts.alert],
              [COW_STATUS_VALUES.HEAT_STRESS, "Estresse", counts.heat],
              [COW_STATUS_VALUES.CALVING, "Parto", counts.calving],
            ] as [StatusFilter, string, number][]
          ).map(([val, label, count]) => (
            <button
              key={val}
              className={`filter-chip${statusFilter === val ? " is-active" : ""}`}
              onClick={() => setStatusFilter(val)}
            >
              {label} <span style={{ opacity: 0.6 }}>{count}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "var(--s-8)",
            }}
          >
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="home-empty">
            <CowHead size={40} />
            <p>Nenhuma vaca encontrada</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filtered.map((cow: Cow) => (
              <button key={cow.id} className="cow-row" onClick={() => navigate(`/cows/${cow.id}`)}>
                <div className="cow-row__avatar">
                  <CowHead size={28} color={statusColor(cow.status)} />
                </div>
                <div className="cow-row__info">
                  <span className="cow-row__tag">{cow.tag}</span>
                  <span className="cow-row__meta">
                    {cow.name} · {cow.farm?.name}
                  </span>
                </div>
                <div className="cow-row__right">
                  <StatusDot
                    tone={statusTone(cow.status)}
                    pulse={cow.status === COW_STATUS_VALUES.ALERT}
                  />
                  <span className="cow-row__status">{STATUS_LABEL[cow.status] ?? cow.status}</span>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedFarm && (
        <CreateCowModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          isLoading={creating}
          farmId={selectedFarm.id}
          onSubmit={(data) => createCow(data, { onSuccess: () => setShowCreate(false) })}
        />
      )}
    </div>
  );
};
