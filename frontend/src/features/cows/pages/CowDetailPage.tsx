import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingSpinner, FormModal, ConfirmDialog } from "@components/common";
import {
  AlertTriangle,
  Warehouse,
  Tag,
  Thermometer,
  Heart,
  Edit2,
  Trash2,
  Link,
  Unlink,
  ChevronLeft,
  ClipboardList,
  Plus,
} from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { StatusDot } from "@components/ui/StatusDot";
import { LineChart } from "@components/ui/LineChart";
import {
  useCow,
  useCowHeartRateDaily,
  useCowTemperatureDaily,
  useCowAccelerometerDaily,
  useUpdateCow,
  useDeleteCow,
} from "../hooks/useCows";
import { RetireAnimalModal } from "../components/RetireAnimalModal";
import { MedicalRecordCard } from "../components/MedicalRecordCard";
import { MedicalRecordModal } from "../components/MedicalRecordModal";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import { useHasPermission } from "@hooks/usePermission";
import { useCollars } from "../../collars/hooks/useCollars";
import { useNotifications } from "@hooks/useNotifications";
import { useMe } from "@hooks/useAuth";
import { COW_STATUS_VALUES, type CowStatus } from "@/types/cows";
import { C, cardStyle } from "@features/dashboard/constants/colors";

const NOTIF_TONE: Record<string, string> = {
  ALERT:   C.red,
  WARNING: C.orange,
  INFO:    "#6bb4e8",
};

const STATUS_LABEL: Record<string, string> = {
  HEALTHY:    "Saudável",
  ALERT:      "Alerta",
  HEAT_STRESS:"Est. Térmico",
  CALVING:    "Parto",
};

const STATUS_COLOR: Record<string, string> = {
  HEALTHY:    C.green,
  ALERT:      C.red,
  HEAT_STRESS:C.orange,
  CALVING:    "#6bb4e8",
};

const STATUS_BG: Record<string, string> = {
  HEALTHY:     "#e8f5ee",
  ALERT:       "#fdecea",
  HEAT_STRESS: "#fdf3e7",
  CALVING:     "#e8f2fb",
};

const statusTone = (s: string) => {
  if (s === COW_STATUS_VALUES.ALERT)      return "danger" as const;
  if (s === COW_STATUS_VALUES.HEAT_STRESS) return "warn"  as const;
  if (s === COW_STATUS_VALUES.CALVING)    return "info"   as const;
  return "success" as const;
};

// ─── MetricCard ───────────────────────────────────────────────────────────────

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        ...cardStyle,
        padding: "18px 12px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
      }}
    >
      <p style={{ margin: "0 0 6px 0", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

// ─── Modal de Edição ──────────────────────────────────────────────────────────

interface EditModalProps {
  cow: { tag: string; name: string; breed: string; status: string };
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: { tag: string; name: string; breed: string; status: string }) => void;
}

function EditCowModal({ cow, open, onClose, isLoading, onSubmit }: EditModalProps) {
  const [form, setForm] = useState({
    tag:    cow.tag,
    name:   cow.name || "",
    breed:  cow.breed || "",
    status: cow.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <FormModal open={open} title="Editar Animal" onClose={onClose} onSubmit={handleSubmit} isLoading={isLoading}>
      <div className="form-field">
        <label className="form-field__label is-required">Tag (Brinco)</label>
        <input className="form-field__input" value={form.tag} required onChange={(e) => setForm({ ...form, tag: e.target.value })} />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Nome</label>
        <input className="form-field__input" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Raça</label>
        <input className="form-field__input" value={form.breed} required onChange={(e) => setForm({ ...form, breed: e.target.value })} />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Status</label>
        <select className="form-field__select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="HEALTHY">Saudável</option>
          <option value="ALERT">Alerta</option>
          <option value="HEAT_STRESS">Estresse Térmico</option>
          <option value="CALVING">Parto</option>
        </select>
      </div>
    </FormModal>
  );
}

// ─── Modal de Vínculo de Colar ────────────────────────────────────────────────

interface LinkCollarModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (collarId: number | null) => void;
}

function LinkCollarModal({ open, onClose, isLoading, onSubmit }: LinkCollarModalProps) {
  const { data: collars } = useCollars();
  const availableCollars = useMemo(() => collars?.filter((c) => !c.cow) || [], [collars]);
  const [selectedId, setSelectedId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedId ? Number(selectedId) : null);
  };

  return (
    <FormModal open={open} title="Vincular Colar" onClose={onClose} onSubmit={handleSubmit} isLoading={isLoading}>
      <div className="form-field">
        <label className="form-field__label is-required">Selecionar Coleira Disponível</label>
        <select className="form-field__select" value={selectedId} required onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Escolha um colar...</option>
          {availableCollars.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </FormModal>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────

type TabKey = "overview" | "records" | "alerts";

export const CowDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showEdit, setShowEdit]               = useState(false);
  const [showDelete, setShowDelete]           = useState(false);
  const [showLink, setShowLink]               = useState(false);
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [activeTab, setActiveTab]             = useState<TabKey>("overview");

  const { data: me }            = useMe();
  const canCRUD                 = me?.profile === "ADMIN" || me?.profile === "MANAGER";
  const canRetire               = useHasPermission("Retire Cow");
  const canCreateRecord         = useHasPermission("Create MedicalRecord");

  const { data: cow, isLoading } = useCow(id || "");
  const { data: medicalRecords } = useMedicalRecords(Number(id) || 0);
  const { mutate: updateCow, isPending: updating } = useUpdateCow();
  const { mutate: deleteCow, isPending: deleting } = useDeleteCow();

  const { data: heartRate }    = useCowHeartRateDaily(id || "");
  const { data: temperature }  = useCowTemperatureDaily(id || "");
  const { data: accelerometer} = useCowAccelerometerDaily(id || "");
  const { data: notifications } = useNotifications();

  const cowNotifs = notifications?.filter((n) => n.cowId != null && String(n.cowId) === id).slice(0, 5) || [];

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
  if (!cow) {
    return (
      <div className="app-page" style={{ background: C.bg }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, color: C.muted }}>
          <AlertTriangle size={40} color={C.muted} />
          <p style={{ margin: 0, fontSize: 14 }}>Não encontrado</p>
        </div>
      </div>
    );
  }

  const tone   = statusTone(cow.status);
  const sColor = STATUS_COLOR[cow.status] ?? C.green;
  const sBg    = STATUS_BG[cow.status]    ?? "#e8f5ee";
  const sLabel = STATUS_LABEL[cow.status] ?? cow.status;

  const hasSensors = !!(temperature?.length || heartRate?.length || accelerometer?.length);

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: "overview", label: "Visão Geral" },
    { key: "records",  label: "Prontuário", count: medicalRecords?.length },
    { key: "alerts",   label: "Alertas",    count: cowNotifs.length || undefined },
  ];

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
          {canCRUD && (
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
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Avatar + nome */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: sBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CowHead size={36} color={sColor} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, margin: 0, color: C.text, lineHeight: 1.1 }}>
                {cow.name || cow.tag}
              </h1>
              <p style={{ margin: "3px 0 0 0", fontSize: 12, color: C.muted }}>Brinco {cow.tag}</p>
            </div>
            <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: sBg, color: sColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {sLabel}
            </span>
          </div>

          {/* StatusDot + pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <StatusDot tone={tone} pulse={cow.status === COW_STATUS_VALUES.ALERT} />
            {cow.farm && (
              <button
                onClick={() => navigate(`/farms/${cow.farm.id}`)}
                style={{ padding: "3px 10px", background: sBg, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 11, color: sColor, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <Warehouse size={11} /> {cow.farm.name}
              </button>
            )}
            {cow.collar ? (
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button
                  onClick={() => navigate(`/collars/${cow.collar!.id}`)}
                  style={{ padding: "3px 8px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 11, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Tag size={11} /> {cow.collar.name}
                </button>
                {canCRUD && (
                  <button
                    className="btn btn-xs btn-ghost"
                    title="Desvincular"
                    onClick={() => updateCow({ id: String(cow.id), input: { collarId: null } })}
                  >
                    <Unlink size={12} />
                  </button>
                )}
              </div>
            ) : (
              canCRUD && (
                <button
                  onClick={() => setShowLink(true)}
                  style={{ padding: "3px 8px", background: "#e8f5ee", border: `1px solid ${C.green}`, borderRadius: 12, fontSize: 11, color: C.green, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Link size={11} /> Vincular Colar
                </button>
              )
            )}
          </div>

          {/* Divisor + linha de prontuário */}
          <div
            style={{
              borderTop: `1px solid ${C.border}`,
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setActiveTab("records")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", border: "none", cursor: "pointer", padding: 0,
              }}
            >
              <ClipboardList size={13} color={C.muted} />
              <span style={{ fontSize: 12, color: C.muted }}>
                {medicalRecords?.length ?? 0}{" "}
                {(medicalRecords?.length ?? 0) !== 1 ? "registros clínicos" : "registro clínico"}
              </span>
            </button>
            {canCreateRecord && (
              <button
                onClick={() => setShowRecordModal(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 14px", borderRadius: 999,
                  background: C.green, border: "none",
                  fontSize: 11, fontWeight: 600, color: "#fff",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                <Plus size={11} /> Registro
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 8 }}>
          {TABS.map(({ key, label, count }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: active ? 600 : 400, border: `1px solid ${active ? C.green : C.border}`, background: active ? C.green : C.card, color: active ? "#fff" : C.muted, cursor: "pointer", transition: "all 0.15s" }}
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span style={{ fontSize: 10, opacity: active ? 0.8 : 0.6 }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab: Visão Geral ── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Métricas */}
            {(cow.breed || cow.weight || cow.birthDate) && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {cow.breed    && <MetricCard label="Raça"        value={cow.breed} />}
                {cow.weight   && <MetricCard label="Peso"        value={`${cow.weight} kg`} />}
                {cow.birthDate && <MetricCard label="Nascimento" value={new Date(cow.birthDate).toLocaleDateString("pt-BR")} />}
              </div>
            )}

            {/* Gráficos de sensor */}
            {hasSensors ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {temperature && temperature.length > 0 && (
                  <div style={{ ...cardStyle }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 600, color: C.muted }}>
                      <Thermometer size={13} color={C.orange} /> Temperatura
                    </div>
                    <LineChart
                      data={temperature}
                      color={C.orange}
                      unit="°C"
                      thresholds={[{ v: 39.5, c: C.red }, { v: 38.0, c: "#6bb4e8" }]}
                    />
                  </div>
                )}
                {heartRate && heartRate.length > 0 && (
                  <div style={{ ...cardStyle }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 600, color: C.muted }}>
                      <Heart size={13} color={C.red} /> Freq. Cardíaca
                    </div>
                    <LineChart
                      data={heartRate}
                      color={C.red}
                      unit=" bpm"
                      thresholds={[{ v: 120, c: C.red }, { v: 40, c: "#6bb4e8" }]}
                    />
                  </div>
                )}
                {accelerometer && accelerometer.length > 0 && (
                  <div style={{ ...cardStyle }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 600, color: C.muted }}>
                      <span style={{ fontSize: 13 }}>↯</span> Atividade
                    </div>
                    <LineChart data={accelerometer} color={C.green} unit=" m/s²" />
                  </div>
                )}
              </div>
            ) : null}

            {/* Botão histórico */}
            <button
              className="btn btn-ghost btn-sm"
              style={{ alignSelf: "flex-start" }}
              onClick={() => navigate(`/cows/${cow.id}/history`)}
            >
              Histórico de sensores
            </button>
          </div>
        )}

        {/* ── Tab: Prontuário ── */}
        {activeTab === "records" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {!medicalRecords || medicalRecords.length === 0 ? (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40, textAlign: "center" }}>
                <ClipboardList size={36} color={C.muted} />
                <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Nenhum registro clínico.</p>
                {canCreateRecord && (
                  <button
                    onClick={() => setShowRecordModal(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "8px 18px", borderRadius: 999,
                      background: C.green, border: "none",
                      fontSize: 12, fontWeight: 600, color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={12} /> Novo registro
                  </button>
                )}
              </div>
            ) : (
              medicalRecords.map((r) => (
                <MedicalRecordCard key={r.id} record={r} cowId={cow.id} />
              ))
            )}
          </div>
        )}

        {/* ── Tab: Alertas ── */}
        {activeTab === "alerts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cowNotifs.length === 0 ? (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40, textAlign: "center" }}>
                <AlertTriangle size={36} color={C.muted} />
                <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Sem alertas recentes para este animal.</p>
              </div>
            ) : (
              cowNotifs.map((n) => (
                <div
                  key={n.id}
                  style={{ ...cardStyle, padding: 14, borderLeft: `3px solid ${(n.type && NOTIF_TONE[n.type]) ?? C.border}` }}
                >
                  <p style={{ margin: "0 0 2px 0", fontSize: 13, fontWeight: 600, color: C.text }}>{n.title}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Zona de perigo (sempre no fim, fora das tabs) ── */}
        {canRetire && cow.status !== "RETIRED" && (
          <div style={{ ...cardStyle, borderColor: C.red, marginTop: 8 }}>
            <p style={{ fontWeight: 700, color: C.red, margin: "0 0 4px 0", fontSize: 13 }}>
              Zona de perigo
            </p>
            <p style={{ fontSize: 12, color: C.muted, margin: "0 0 12px 0" }}>
              Aposentar o animal remove-o do rebanho ativo permanentemente.
            </p>
            <button className="btn btn-danger btn-sm" onClick={() => setShowRetireModal(true)}>
              Aposentar animal
            </button>
          </div>
        )}
      </div>

      {/* ── Modais ── */}
      <MedicalRecordModal
        open={showRecordModal}
        cowId={cow.id}
        onClose={() => setShowRecordModal(false)}
      />

      <RetireAnimalModal
        open={showRetireModal}
        cowId={cow.id}
        onClose={() => setShowRetireModal(false)}
      />

      <EditCowModal
        cow={cow}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        isLoading={updating}
        onSubmit={(data) =>
          updateCow(
            { id: String(cow.id), input: { ...data, status: data.status as CowStatus } },
            { onSuccess: () => setShowEdit(false) },
          )
        }
      />

      <LinkCollarModal
        open={showLink}
        onClose={() => setShowLink(false)}
        isLoading={updating}
        onSubmit={(collarId) =>
          updateCow(
            { id: String(cow.id), input: { collarId } },
            { onSuccess: () => setShowLink(false) },
          )
        }
      />

      <ConfirmDialog
        open={showDelete}
        title="Excluir Animal"
        description={`Tem certeza que deseja excluir "${cow.tag} - ${cow.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel={deleting ? "Excluindo..." : "Excluir"}
        isDangerous
        onConfirm={() => deleteCow(String(cow.id), { onSuccess: () => navigate("/cows") })}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};
