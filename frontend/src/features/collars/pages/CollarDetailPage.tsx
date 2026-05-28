import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingSpinner, FormModal, ConfirmDialog } from "@components/common";
import { AlertTriangle, Edit2, Trash2, Warehouse, Tag, ChevronLeft } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { useCollar, useUpdateCollar, useDeleteCollar } from "../hooks/useCollars";
import { useFarms } from "../../farms/hooks/useFarms";
import { useMe } from "../../../hooks/useAuth";
import { COLLAR_STATUS_VALUES } from "../../../types/collars.ts";
import type { CollarStatus, DataFrequency } from "../../../types/collars.ts";
import { C, cardStyle } from "@features/dashboard/constants/colors";

// ─── Mapeamentos de status ────────────────────────────────────────────────────

const COLLAR_STATUS_LABEL: Record<string, string> = {
  ACTIVE:      "Ativo",
  INACTIVE:    "Inativo",
  MAINTENANCE: "Manutenção",
  BATTERY:     "Bateria Fraca",
};

const COLLAR_STATUS_COLOR: Record<string, string> = {
  ACTIVE:      C.green,
  MAINTENANCE: C.orange,
  BATTERY:     C.red,
  INACTIVE:    C.muted,
};

const COLLAR_STATUS_BG: Record<string, string> = {
  ACTIVE:      "#e8f5ee",
  MAINTENANCE: "#fdf3e7",
  BATTERY:     "#fdecea",
  INACTIVE:    "#f0f0ee",
};

const DATA_FREQ_LABEL: Record<string, string> = {
  HIGHER:  "Alta (2 min)",
  DEFAULT: "Padrão (10 min)",
  LOWER:   "Baixa (60 min)",
};

const COW_STATUS_COLOR: Record<string, string> = {
  HEALTHY:     C.green,
  ALERT:       C.red,
  HEAT_STRESS: C.orange,
  CALVING:     "#6bb4e8",
};

const COW_STATUS_BG: Record<string, string> = {
  HEALTHY:     "#e8f5ee",
  ALERT:       "#fdecea",
  HEAT_STRESS: "#fdf3e7",
  CALVING:     "#e8f2fb",
};

const COW_STATUS_LABEL: Record<string, string> = {
  HEALTHY:     "Saudável",
  ALERT:       "Alerta",
  HEAT_STRESS: "Est. Térmico",
  CALVING:     "Parto",
  RETIRED:     "Aposentado",
};

// ─── InfoItem ────────────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: "0 0 3px 0", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>{value}</p>
    </div>
  );
}

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
    name:          collar.name,
    status:        collar.status,
    dataFrequency: collar.dataFrequency,
    farmId:        collar.farmId || ("" as string | number),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, farmId: form.farmId ? Number(form.farmId) : undefined });
  };

  return (
    <FormModal open={open} title="Editar Coleira" onClose={onClose} onSubmit={handleSubmit} isLoading={isLoading}>
      <div className="form-field">
        <label className="form-field__label is-required">Nome / ID do Dispositivo</label>
        <input className="form-field__input" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="form-field">
        <label className="form-field__label">Fazenda Alocada (Opcional)</label>
        <select className="form-field__select" value={form.farmId} onChange={(e) => setForm({ ...form, farmId: e.target.value })}>
          <option value="">Sem fazenda (Estoque)</option>
          {farms?.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Status</label>
        <select className="form-field__select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CollarStatus })}>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="MAINTENANCE">Manutenção</option>
          <option value="BATTERY">Bateria Fraca</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Frequência de Dados</label>
        <select className="form-field__select" value={form.dataFrequency} onChange={(e) => setForm({ ...form, dataFrequency: e.target.value as DataFrequency })}>
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
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [showEdit, setShowEdit]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { data: user } = useMe();
  const isSuperAdmin   = user?.roles.some((r) => r.name === "SuperAdmin");

  const { data: collar, isLoading } = useCollar(id || "");
  const { mutate: updateCollar, isPending: updating } = useUpdateCollar();
  const { mutate: deleteCollar, isPending: deleting } = useDeleteCollar();

  const linkedCow = collar?.cow;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="app-page" style={{ background: C.bg }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, padding: 48 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!collar) {
    return (
      <div className="app-page" style={{ background: C.bg }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, color: C.muted }}>
          <AlertTriangle size={40} color={C.muted} />
          <p style={{ margin: 0, fontSize: 14 }}>Não encontrado</p>
        </div>
      </div>
    );
  }

  const cStatusColor = COLLAR_STATUS_COLOR[collar.status] ?? C.muted;
  const cStatusBg    = COLLAR_STATUS_BG[collar.status]    ?? "#f0f0ee";
  const cStatusLabel = COLLAR_STATUS_LABEL[collar.status] ?? collar.status;

  return (
    <div className="app-page" style={{ background: C.bg }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Barra de ações no topo ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: "50%", background: C.card, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.muted }}
          >
            <ChevronLeft size={20} />
          </button>
          {isSuperAdmin && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowEdit(true)}
                style={{ width: 36, height: 36, borderRadius: "50%", background: C.card, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.muted }}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setShowDelete(true)}
                style={{ width: 36, height: 36, borderRadius: "50%", background: "#fdecea", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.red }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ── Hero card ── */}
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: cStatusBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Tag size={26} color={cStatusColor} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, margin: 0, color: C.text, lineHeight: 1.1 }}>
              {collar.name}
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 12, color: C.muted }}>Coleira IoT</p>
          </div>
          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: cStatusBg, color: cStatusColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {cStatusLabel}
          </span>
        </div>

        {/* ── Info card ── */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <InfoItem
              label="Frequência de Dados"
              value={DATA_FREQ_LABEL[collar.dataFrequency] ?? collar.dataFrequency}
            />
            <InfoItem
              label="Fazenda Alocada"
              value={collar.farm?.name ?? "Nenhuma (Estoque)"}
            />
            <InfoItem
              label="Cadastrado em"
              value={new Date(collar.createdAt).toLocaleDateString("pt-BR")}
            />
          </div>
          {collar.farm && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              <button
                onClick={() => navigate(`/farms/${collar.farm!.id}`)}
                style={{ padding: "4px 12px", background: "#e8f5ee", border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 12, color: C.green, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
              >
                <Warehouse size={13} /> Ver fazenda
              </button>
            </div>
          )}
        </div>

        {/* ── Vaca Vinculada ── */}
        <div>
          <p style={{ margin: "0 0 10px 0", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Vaca Vinculada
          </p>

          {linkedCow ? (
            <button
              onClick={() => navigate(`/cows/${linkedCow.id}`)}
              style={{ ...cardStyle, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
            >
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: COW_STATUS_BG[linkedCow.status] ?? C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CowHead size={24} color={COW_STATUS_COLOR[linkedCow.status] ?? C.muted} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>{linkedCow.name || linkedCow.tag}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: 11, color: C.muted }}>Brinco {linkedCow.tag}</p>
              </div>
              <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: COW_STATUS_BG[linkedCow.status] ?? C.bg, color: COW_STATUS_COLOR[linkedCow.status] ?? C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {COW_STATUS_LABEL[linkedCow.status] ?? linkedCow.status}
              </span>
            </button>
          ) : (
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40, textAlign: "center" }}>
              <CowHead size={36} color={C.muted} />
              <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Nenhuma vaca vinculada a esta coleira.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modais ── */}
      {isSuperAdmin && (
        <>
          <EditCollarModal
            collar={collar}
            open={showEdit}
            onClose={() => setShowEdit(false)}
            isLoading={updating}
            onSubmit={(data) =>
              updateCollar({ id: collar.id.toString(), input: data }, { onSuccess: () => setShowEdit(false) })
            }
          />

          <ConfirmDialog
            open={showDelete}
            title="Excluir Coleira"
            description={`Tem certeza que deseja excluir a coleira "${collar.name}"? Esta ação não pode ser desfeita.`}
            confirmLabel={deleting ? "Excluindo..." : "Excluir"}
            isDangerous
            onConfirm={() => deleteCollar(collar.id.toString(), { onSuccess: () => navigate("/collars") })}
            onCancel={() => setShowDelete(false)}
          />
        </>
      )}
    </div>
  );
};
