import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@components/common";
import { AlertTriangle, Edit2, ChevronLeft, Warehouse } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { cowsService } from "@services/cowsService";
import { useFarm, useUpdateFarm } from "../hooks/useFarms";
import { useMe } from "../../../hooks/useAuth";
import { FarmForm } from "../components/FarmForm";
import { C, cardStyle } from "@features/dashboard/constants/colors";

const COW_STATUS_COLOR: Record<string, string> = {
  HEALTHY:    C.green,
  ALERT:      C.red,
  HEAT_STRESS:C.orange,
  CALVING:    "#6bb4e8",
};

const COW_STATUS_BG: Record<string, string> = {
  HEALTHY:     "#e8f5ee",
  ALERT:       "#fdecea",
  HEAT_STRESS: "#fdf3e7",
  CALVING:     "#e8f2fb",
};

const COW_STATUS_LABEL: Record<string, string> = {
  HEALTHY:    "Saudável",
  ALERT:      "Alerta",
  HEAT_STRESS:"Est. Térmico",
  CALVING:    "Parto",
  RETIRED:    "Aposentado",
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

// ─── Componente Principal ──────────────────────────────────────────────────────

export const FarmDetailPage = () => {
  const { id }          = useParams<{ id: string }>();
  const navigate        = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  const { data: me }   = useMe();
  const { data: farm, isLoading } = useFarm(id || "");
  const { mutate: updateFarm, isPending: updating } = useUpdateFarm();

  const isSuperAdmin = me?.roles.some((r) => r.name === "SuperAdmin");
  const isFarmAdmin  = me?.profile === "ADMIN" && String(me?.farmId) === id;
  const canEdit      = isSuperAdmin || isFarmAdmin;

  const { data: cows } = useQuery({
    queryKey: ["cows", { farmId: id }],
    queryFn:  () => cowsService.list({ farmId: id }),
    enabled:  !!id,
  });

  const farmCows = cows ?? [];

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
  if (!farm) {
    return (
      <div className="app-page" style={{ background: C.bg }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, color: C.muted }}>
          <AlertTriangle size={40} color={C.muted} />
          <p style={{ margin: 0, fontSize: 14 }}>Não encontrado</p>
        </div>
      </div>
    );
  }

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
          {canEdit && (
            <button
              onClick={() => setShowEdit(true)}
              style={{ width: 36, height: 36, borderRadius: "50%", background: C.card, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.muted }}
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>

        {/* ── Hero card ── */}
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Warehouse size={28} color={C.green} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, margin: 0, color: C.text, lineHeight: 1.1 }}>
              {farm.name}
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 12, color: C.muted }}>
              {farm.city}, {farm.state}
            </p>
          </div>
        </div>

        {/* ── Info card ── */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <InfoItem label="CNPJ"      value={farm.cnpj} />
            <InfoItem label="Telefone"  value={farm.phone} />
            <InfoItem label="Email"     value={farm.email} />
            <InfoItem label="Localização" value={`${farm.city}, ${farm.state}`} />
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <InfoItem label="Endereço" value={farm.address} />
          </div>
        </div>

        {/* ── Seção Rebanho ── */}
        <div>
          <p style={{ margin: "0 0 10px 0", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Rebanho ({farmCows.length})
          </p>

          {farmCows.length === 0 ? (
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40, textAlign: "center" }}>
              <CowHead size={36} color={C.muted} />
              <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Esta fazenda não possui vacas registradas.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {farmCows.map((cow) => {
                const cColor = COW_STATUS_COLOR[cow.status] ?? C.muted;
                const cBg    = COW_STATUS_BG[cow.status]    ?? C.bg;
                const cLabel = COW_STATUS_LABEL[cow.status] ?? cow.status;
                return (
                  <button
                    key={cow.id}
                    onClick={() => navigate(`/cows/${cow.id}`)}
                    style={{ ...cardStyle, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", border: `1px solid ${C.border}`, background: C.card, textAlign: "center" }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: cBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CowHead size={22} color={cColor} />
                    </div>
                    <div style={{ minWidth: 0, width: "100%" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cow.name || cow.tag}
                      </p>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: cBg, color: cColor, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {cLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {canEdit && (
        <FarmForm
          open={showEdit}
          onClose={() => setShowEdit(false)}
          initialData={farm}
          onSubmit={(data) => updateFarm({ id: String(farm.id), input: data }, { onSuccess: () => setShowEdit(false) })}
          isLoading={updating}
        />
      )}
    </div>
  );
};
