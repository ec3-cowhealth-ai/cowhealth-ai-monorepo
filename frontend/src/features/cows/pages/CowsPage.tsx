import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner, FormModal } from "@components/common";
import { Search, Plus } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { useCows, useCreateCow } from "../hooks/useCows";
import { useFarmContext } from "@/context/FarmContext";
import { useHasPermission } from "@hooks/usePermission";
import { PERMISSIONS } from "@config/permissions";
import { COW_STATUS_VALUES } from "@/types/cows";
import type { Cow } from "@/types/cows";
import { C, cardStyle } from "@features/dashboard/constants/colors";

type StatusFilter = "" | "HEALTHY" | "ALERT" | "HEAT_STRESS" | "CALVING";

const STATUS_LABEL: Record<string, string> = {
  HEALTHY: "Saudável",
  ALERT: "Alerta",
  HEAT_STRESS: "Est. Térmico",
  CALVING: "Parto",
  RETIRED: "Aposentada",
};

const STATUS_COLOR: Record<string, string> = {
  HEALTHY: C.green,
  ALERT: C.red,
  HEAT_STRESS: C.orange,
  CALVING: "#6bb4e8",
  RETIRED: C.muted,
};

const STATUS_BG: Record<string, string> = {
  HEALTHY: "var(--status-success-bg)",
  ALERT: "var(--status-danger-bg)",
  HEAT_STRESS: "var(--status-warning-bg)",
  CALVING: "var(--status-info-bg)",
  RETIRED: "var(--bg-card)",
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
          placeholder="Ex: Holandesa"
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

  const canCRUD = useHasPermission(PERMISSIONS.CREATE_COW);

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

  const filterItems: [StatusFilter, string, number][] = [
    ["", "Todas", counts.all],
    [COW_STATUS_VALUES.HEALTHY as StatusFilter, "Saudáveis", counts.healthy],
    [COW_STATUS_VALUES.ALERT as StatusFilter, "Alertas", counts.alert],
    [COW_STATUS_VALUES.HEAT_STRESS as StatusFilter, "Estresse", counts.heat],
    [COW_STATUS_VALUES.CALVING as StatusFilter, "Parto", counts.calving],
  ];

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

      {/* Search */}
      {showSearch && (
        <input
          autoFocus
          type="text"
          placeholder="Buscar por tag ou nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.card,
            fontSize: 14,
            color: C.text,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      )}

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
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: 48,
            color: C.muted,
          }}
        >
          <CowHead size={40} color={C.muted} />
          <p style={{ margin: 0, fontSize: 14 }}>Nenhuma vaca encontrada</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {filtered.map((cow: Cow) => {
            const sColor = STATUS_COLOR[cow.status] ?? C.green;
            const sBg = STATUS_BG[cow.status] ?? "var(--status-success-bg)";
            return (
              <button
                key={cow.id}
                onClick={() => navigate(`/cows/${cow.id}`)}
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  padding: 20,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: sBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CowHead size={30} color={sColor} />
                </div>

                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>
                    {cow.name || cow.tag}
                  </p>
                  <p style={{ margin: "2px 0 0 0", fontSize: 11, color: C.muted }}>
                    Brinco {cow.tag}
                  </p>
                </div>

                {cow.farm && (
                  <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{cow.farm.name}</p>
                )}

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 12px",
                    borderRadius: 999,
                    background: sBg,
                    color: sColor,
                  }}
                >
                  {STATUS_LABEL[cow.status] ?? cow.status}
                </span>
              </button>
            );
          })}
        </div>
      )}

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
