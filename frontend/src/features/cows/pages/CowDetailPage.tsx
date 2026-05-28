import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner, FormModal, ConfirmDialog } from "@components/common";
import { AlertTriangle, Warehouse, Tag, Thermometer, Heart, Edit2, Trash2, Link, Unlink } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { StatusDot } from "@components/ui/StatusDot";
import { LineChart } from "@components/ui/LineChart";
import { useCow, useCowHeartRateDaily, useCowTemperatureDaily, useUpdateCow, useDeleteCow } from "../hooks/useCows";
import { useCollars } from "../../collars/hooks/useCollars";
import { useNotifications } from "@hooks/useNotifications";
import { useMe } from "@hooks/useAuth";
import { COW_STATUS_VALUES, type CowStatus } from "@/types/cows";
import { C, cardStyle } from "@features/dashboard/constants/colors";

const STATUS_LABEL: Record<string, string> = {
  HEALTHY: "Saudável",
  ALERT: "Alerta",
  HEAT_STRESS: "Est. Térmico",
  CALVING: "Parto",
};

const STATUS_COLOR: Record<string, string> = {
  HEALTHY: C.green,
  ALERT: C.red,
  HEAT_STRESS: C.orange,
  CALVING: "#6bb4e8",
};

const STATUS_BG: Record<string, string> = {
  HEALTHY: "#e6f1ea",
  ALERT: "#fde8e4",
  HEAT_STRESS: "#fbe9d8",
  CALVING: "#e4f0fb",
};

const statusTone = (s: string) => {
  if (s === COW_STATUS_VALUES.ALERT) return "danger" as const;
  if (s === COW_STATUS_VALUES.HEAT_STRESS) return "warn" as const;
  if (s === COW_STATUS_VALUES.CALVING) return "info" as const;
  return "success" as const;
};


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
    tag: cow.tag,
    name: cow.name || "",
    breed: cow.breed || "",
    status: cow.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <FormModal
      open={open}
      title="Editar Animal"
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
          onChange={(e) => setForm({ ...form, tag: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Nome</label>
        <input
          className="form-field__input"
          value={form.name}
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Raça</label>
        <input
          className="form-field__input"
          value={form.breed}
          required
          onChange={(e) => setForm({ ...form, breed: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label is-required">Status</label>
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

// ─── Modal de Vínculo de Colar ───────────────────────────────────────────────

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
    <FormModal
      open={open}
      title="Vincular Colar"
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    >
      <div className="form-field">
        <label className="form-field__label is-required">Selecionar Coleira Disponível</label>
        <select
          className="form-field__select"
          value={selectedId}
          required
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Escolha um colar...</option>
          {availableCollars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </FormModal>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────

export const CowDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sensorTab, setSensorTab] = useState<"temp" | "hr">("temp");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showLink, setShowLink] = useState(false);

  const { data: me } = useMe();
  const canCRUD = me?.profile === "ADMIN" || me?.profile === "MANAGER";

  const { data: cow, isLoading } = useCow(id || "");
  const { mutate: updateCow, isPending: updating } = useUpdateCow();
  const { mutate: deleteCow, isPending: deleting } = useDeleteCow();

  const { data: heartRate } = useCowHeartRateDaily(id || "");
  const { data: temperature } = useCowTemperatureDaily(id || "");
  const { data: notifications } = useNotifications();

  const cowNotifs = notifications?.filter((n) => n.cowId === id).slice(0, 5) || [];

  if (isLoading) {
    return (
      <div style={{ background: C.bg, minHeight: "100%" }}>
        <AppBar title="Detalhes" showBack />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: 48 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!cow) {
    return (
      <div style={{ background: C.bg, minHeight: "100%" }}>
        <AppBar title="Detalhes" showBack />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, color: C.muted }}>
          <AlertTriangle size={36} color={C.muted} />
          <p style={{ margin: 0 }}>Vaca não encontrada</p>
        </div>
      </div>
    );
  }

  const tone     = statusTone(cow.status);
  const sColor   = STATUS_COLOR[cow.status] ?? C.green;
  const sBg      = STATUS_BG[cow.status]    ?? "#e6f1ea";
  const sLabel   = STATUS_LABEL[cow.status] ?? cow.status;

  return (
    <div className="app-page">
      <AppBar
        title={cow.tag}
        subtitle={cow.name}
        showBack
        actions={
          canCRUD && (
            <div style={{ display: "flex", gap: 12 }}>
              <button className="app-bar__action" onClick={() => setShowEdit(true)}>
                <Edit2 size={18} />
              </button>
              <button className="app-bar__action" onClick={() => setShowDelete(true)}>
                <Trash2 size={18} />
              </button>
            </div>
          )
        }
      />

      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Hero card */}
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: sBg,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <CowHead size={32} color={sColor} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <StatusDot tone={tone} pulse={cow.status === COW_STATUS_VALUES.ALERT} />
              <span style={{ fontSize: 13, fontWeight: 600, color: sColor }}>{sLabel}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {cow.farm && (
                <button
                  onClick={() => navigate(`/farms/${cow.farm.id}`)}
                  style={{
                    padding: "3px 10px", background: sBg,
                    border: `1px solid ${C.border}`, borderRadius: 12,
                    fontSize: 11, color: sColor, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <Warehouse size={11} /> {cow.farm.name}
                </button>
              )}
              {cow.collar ? (
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <button
                    style={{
                      padding: "3px 8px",
                      background: "var(--bg-elev-2)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 12,
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    onClick={() => navigate(`/collars/${cow.collar!.id}`)}
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
                    style={{
                      padding: "3px 8px",
                      background: "var(--primary-soft)",
                      border: "1px solid var(--accent)",
                      borderRadius: 12,
                      fontSize: 11,
                      color: "var(--accent)",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    onClick={() => setShowLink(true)}
                  >
                    <Link size={11} /> Vincular Colar
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {cow.breed && (
            <div style={{ ...cardStyle, padding: 16, textAlign: "center" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Raça</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>{cow.breed}</p>
            </div>
          )}
          {cow.weight && (
            <div style={{ ...cardStyle, padding: 16, textAlign: "center" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Peso</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>
                {cow.weight}<span style={{ fontSize: 11, color: C.muted }}> kg</span>
              </p>
            </div>
          )}
          {cow.birthDate && (
            <div style={{ ...cardStyle, padding: 16, textAlign: "center" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nascimento</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>
                {new Date(cow.birthDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </div>

        {/* Sensor charts */}
        {(temperature?.length || heartRate?.length) ? (
          <div style={{ ...cardStyle }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["temp", "hr"] as const).map((tab) => {
                const active = sensorTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setSensorTab(tab)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 14px", borderRadius: 999, fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      border: `1px solid ${active ? C.green : C.border}`,
                      background: active ? C.green : "#fff",
                      color: active ? "#fff" : C.muted,
                      cursor: "pointer",
                    }}
                  >
                    {tab === "temp" ? <Thermometer size={12} /> : <Heart size={12} />}
                    {tab === "temp" ? "Temperatura" : "Freq. Cardíaca"}
                  </button>
                );
              })}
            </div>

            {sensorTab === "temp" && temperature && (
              <LineChart
                data={temperature}
                color={C.orange}
                unit="°C"
                thresholds={[{ v: 39.5, c: C.red }, { v: 38.0, c: "#6bb4e8" }]}
              />
            )}
            {sensorTab === "hr" && heartRate && (
              <LineChart
                data={heartRate}
                color={C.red}
                unit=" bpm"
                thresholds={[{ v: 120, c: C.red }, { v: 40, c: "#6bb4e8" }]}
              />
            )}
          </div>
        ) : null}

        {/* Recent notifications */}
        {cowNotifs.length > 0 && (
          <div>
            <p style={{ margin: "0 0 10px 0", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Notificações recentes
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cowNotifs.map((n) => (
                <div
                  key={n.id}
                  className="alert-card"
                  style={{
                    borderLeftColor: (n.type && NOTIF_TONE[n.type]) ?? "var(--border-subtle)",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 2px 0",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {n.title}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      {n.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditCowModal
        cow={cow}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        isLoading={updating}
        onSubmit={(data) =>
          updateCow({ id: String(cow.id), input: { ...data, status: data.status as CowStatus } }, { onSuccess: () => setShowEdit(false) })
        }
      />

      <LinkCollarModal
        open={showLink}
        onClose={() => setShowLink(false)}
        isLoading={updating}
        onSubmit={(collarId) =>
          updateCow({ id: String(cow.id), input: { collarId } }, { onSuccess: () => setShowLink(false) })
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
