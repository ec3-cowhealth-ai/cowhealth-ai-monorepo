import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMe } from "@hooks/useAuth";
import { useUnreadNotifications } from "@hooks/useNotifications";
import { useDashboardOverview } from "@features/dashboard/hooks/useDashboard";
import { useCows } from "@features/cows/hooks/useCows";
import { AppBar } from "@components/layout";
import {
  Bell,
  AlertTriangle,
  ChevronRight,
  Check,
  List,
  Map,
  Warehouse,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@hooks/useTheme";
import { CowHead } from "@components/ui/CowHeadIcon";
import { StatusDot } from "@components/ui/StatusDot";
import { useFarmContext } from "@/context/FarmContext";
import { COW_STATUS_VALUES } from "@/types/cows";
import type { Cow } from "@/types/cows";
import type { Farm } from "@/types/farms";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const statusTone = (s: string) => {
  if (s === COW_STATUS_VALUES.ALERT) return "danger" as const;
  if (s === COW_STATUS_VALUES.HEAT_STRESS) return "warn" as const;
  if (s === COW_STATUS_VALUES.CALVING) return "info" as const;
  return "success" as const;
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const { theme, toggle } = useTheme();
  const { selectedFarm, setSelectedFarm, farms } = useFarmContext();
  const [showFarmPicker, setShowFarmPicker] = useState(false);

  const isSuperAdmin = user?.roles.some((r) => r.name === "SuperAdmin");

  const farmId = selectedFarm ? String(selectedFarm.id) : undefined;
  const { data: overview } = useDashboardOverview(farmId);
  const { data: cows } = useCows({ farmId });
  const { data: unread } = useUnreadNotifications();

  const unreadCount = unread?.length || 0;
  const total = overview?.totalCows ?? cows?.length ?? 0;
  const alertCount = overview?.unhealthyCows ?? 0;
  const healthyCount = cows?.filter((c: Cow) => c.status === COW_STATUS_VALUES.HEALTHY).length ?? 0;
  const healthPct = total > 0 ? Math.round((healthyCount / total) * 100) : 0;

  const attention =
    cows
      ?.filter(
        (c: Cow) =>
          c.status !== COW_STATUS_VALUES.HEALTHY && c.status !== COW_STATUS_VALUES.RETIRED,
      )
      .slice(0, 6) ?? [];

  const prepartumCows = cows?.filter((c: Cow) => c.status === COW_STATUS_VALUES.CALVING) ?? [];

  return (
    <div className="app-page">
      <AppBar
        title={`${greeting()}, ${user?.name?.split(" ")[0] ?? ""}`}
        subtitle={selectedFarm?.name ?? "Carregando…"}
        left={
          isSuperAdmin ? (
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
              }}
              onClick={() => setShowFarmPicker(true)}
            >
              <CowHead size={32} />
            </button>
          ) : (
            <div style={{ display: "flex", color: "var(--accent)" }}>
              <CowHead size={32} />
            </div>
          )
        }
        actions={
          <button className="app-bar__action" onClick={toggle} title="Alternar tema">
            {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        }
      />

      {/* Farm picker modal */}
      {showFarmPicker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-end",
          }}
          onClick={() => setShowFarmPicker(false)}
        >
          <div
            style={{
              width: "100%",
              background: "var(--bg-elev-1)",
              borderRadius: "20px 20px 0 0",
              padding: "20px 16px 32px",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: 15 }}>Trocar fazenda</p>
            {farms.map((farm: Farm) => (
              <button
                key={farm.id}
                onClick={() => {
                  setSelectedFarm(farm);
                  setShowFarmPicker(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "12px 8px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                }}
              >
                <CowHead
                  size={24}
                  color={farm.id === selectedFarm?.id ? "var(--verdigris)" : "var(--text-muted)"}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: farm.id === selectedFarm?.id ? 700 : 400,
                  }}
                >
                  {farm.name}
                </span>
                {farm.id === selectedFarm?.id && <Check size={16} color="var(--verdigris)" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="app-content">
        {/* Hero */}
        <div className="home-hero">
          <div className="home-hero__left">
            <p className="home-hero__label">Saúde do Rebanho</p>
            <p className="home-hero__score">
              {healthPct}
              <span style={{ fontSize: 20, fontWeight: 400 }}>%</span>
            </p>
            <div className="home-hero__bar">
              <div className="home-hero__bar-fill" style={{ width: `${healthPct}%` }} />
            </div>
          </div>
          <div className="home-hero__stats">
            <div className="home-stat">
              <span className="home-stat__value" style={{ color: "var(--success)" }}>
                {healthyCount}
              </span>
              <span className="home-stat__label">Saudáveis</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value" style={{ color: "var(--danger)" }}>
                {alertCount}
              </span>
              <span className="home-stat__label">Alertas</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">{total}</span>
              <span className="home-stat__label">Total</span>
            </div>
          </div>
        </div>

        {/* Alerta crítico */}
        {alertCount > 0 && (
          <button
            className="alert-card alert-card--danger"
            onClick={() => navigate("/notifications")}
            style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
          >
            <AlertTriangle size={16} color="var(--danger)" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>
                {alertCount} {alertCount === 1 ? "vaca requer" : "vacas requerem"} atenção imediata
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                Toque para ver os alertas
              </p>
            </div>
            <ChevronRight size={14} color="var(--text-muted)" />
          </button>
        )}

        {/* Pré-parto */}
        {prepartumCows.length > 0 && (
          <div className="home-section">
            <div className="home-section__header">
              <span className="home-section__title">Pré-parto ({prepartumCows.length})</span>
            </div>
            <div
              style={{ display: "flex", gap: "var(--s-3)", overflowX: "auto", paddingBottom: 4 }}
            >
              {prepartumCows.map((cow: Cow) => (
                <button
                  key={cow.id}
                  className="card"
                  onClick={() => navigate(`/cows/${cow.id}`)}
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  <CowHead size={20} color="var(--info)" />
                  <span style={{ fontSize: 13 }}>{cow.name ?? cow.tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vacas em atenção */}
        {attention.length > 0 && (
          <div className="home-section">
            <div className="home-section__header">
              <span className="home-section__title">Em Atenção</span>
              <button className="home-section__link" onClick={() => navigate("/cows")}>
                Ver todas
              </button>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {attention.map((cow: Cow) => (
                <button
                  key={cow.id}
                  onClick={() => navigate(`/cows/${cow.id}`)}
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    background: "var(--bg-elev-2)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 20,
                    cursor: "pointer",
                    fontSize: 12,
                    color: "var(--text-primary)",
                  }}
                >
                  <StatusDot
                    tone={statusTone(cow.status)}
                    pulse={cow.status === COW_STATUS_VALUES.ALERT}
                  />
                  {cow.tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Acesso rápido */}
        <div className="home-section">
          <div className="home-section__header">
            <span className="home-section__title">Acesso Rápido</span>
          </div>
          <div className="quick-grid">
            <button className="quick-chip" onClick={() => navigate("/cows")}>
              <List size={20} color="var(--verdigris)" />
              <span>Rebanho</span>
            </button>
            <button className="quick-chip" onClick={() => navigate("/map")}>
              <Map size={20} color="var(--verdigris)" />
              <span>Mapa</span>
            </button>
            <button className="quick-chip" onClick={() => navigate("/notifications")}>
              <span style={{ position: "relative", display: "flex" }}>
                <Bell size={20} color="var(--verdigris)" />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "var(--danger)",
                      color: "var(--primary-on)",
                      borderRadius: 99,
                      fontSize: 9,
                      width: 14,
                      height: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </span>
              <span>Alertas</span>
            </button>
            <button className="quick-chip" onClick={() => navigate("/farms")}>
              <Warehouse size={20} color="var(--verdigris)" />
              <span>Fazendas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
