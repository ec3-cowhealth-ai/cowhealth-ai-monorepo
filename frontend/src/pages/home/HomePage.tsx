import { useNavigate } from "react-router-dom";
import { useMe } from "@hooks/useAuth";
import { useUnreadNotifications } from "@hooks/useNotifications";
import { useDashboardOverview } from "@features/dashboard/hooks/useDashboard";
import { useCows } from "@features/cows/hooks/useCows";
import { AppBar } from "@components/layout";
import { Icon } from "@components/ui/Icon";
import { CowMark } from "@components/ui/CowMark";
import { StatusDot } from "@components/ui/StatusDot";
import { CowStatusValues } from "../../types/cows";
import type { Cow } from "../../types/cows";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const statusTone = (s: string) => {
  if (s === CowStatusValues.ALERT) return "danger";
  if (s === CowStatusValues.HEAT_STRESS) return "warn";
  if (s === CowStatusValues.CALVING) return "info";
  return "success";
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const { data: overview } = useDashboardOverview();
  const { data: cows } = useCows();
  const { data: unread } = useUnreadNotifications();

  const unreadCount = unread?.length || 0;
  const total = overview?.totalCows || cows?.length || 0;
  const alertCount = overview?.cowsInAlert || cows?.filter((c: Cow) => c.status === CowStatusValues.ALERT).length || 0;
  const healthyCount = cows?.filter((c: Cow) => c.status === CowStatusValues.HEALTHY).length || 0;
  const healthPct = total > 0 ? Math.round((healthyCount / total) * 100) : 0;

  const attention = cows
    ?.filter((c: Cow) => c.status === CowStatusValues.ALERT || c.status === CowStatusValues.HEAT_STRESS || c.status === CowStatusValues.CALVING)
    .slice(0, 6) || [];

  const farmName = overview?.topFarm?.name || user?.name || "—";

  return (
    <div className="app-page">
      <AppBar
        title={`${greeting()}, ${user?.name?.split(" ")[0] ?? ""}` }
        subtitle={`${farmName} · Admin`}
        left={<CowMark s={32} />}
        actions={
          <button
            className="app-bar__action"
            onClick={() => navigate("/notifications")}
            style={{ position: "relative" }}
          >
            <Icon n="bell" s={22} />
            {unreadCount > 0 && (
              <span className="app-bar__action-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>
        }
      />

      <div className="app-content">
        {/* Hero health card */}
        <div className="home-hero">
          <div className="home-hero__left">
            <p className="home-hero__label">Saúde do Rebanho</p>
            <p className="home-hero__score">{healthPct}<span style={{ fontSize: 20, fontWeight: 400 }}>%</span></p>
            <div className="home-hero__bar">
              <div className="home-hero__bar-fill" style={{ width: `${healthPct}%` }} />
            </div>
          </div>
          <div className="home-hero__stats">
            <div className="home-stat">
              <span className="home-stat__value" style={{ color: "var(--success)" }}>{healthyCount}</span>
              <span className="home-stat__label">Saudáveis</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value" style={{ color: "var(--danger)" }}>{alertCount}</span>
              <span className="home-stat__label">Alertas</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">{total}</span>
              <span className="home-stat__label">Total</span>
            </div>
          </div>
        </div>

        {/* Critical alert strip */}
        {alertCount > 0 && (
          <button
            className="alert-card alert-card--danger"
            onClick={() => navigate("/notifications")}
            style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
          >
            <Icon n="alert" s={16} c="var(--danger)" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>
                {alertCount} {alertCount === 1 ? "vaca requer" : "vacas requerem"} atenção imediata
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                Toque para ver os alertas
              </p>
            </div>
            <Icon n="chevronRight" s={14} c="var(--text-muted)" />
          </button>
        )}

        {/* Cows in attention */}
        {attention.length > 0 && (
          <div className="home-section">
            <div className="home-section__header">
              <span className="home-section__title">Em Atenção</span>
              <button className="home-section__link" onClick={() => navigate("/cows")}>Ver todas</button>
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
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
                  <StatusDot tone={statusTone(cow.status)} pulse={cow.status === CowStatusValues.ALERT} />
                  {cow.tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick access */}
        <div className="home-section">
          <div className="home-section__header">
            <span className="home-section__title">Acesso Rápido</span>
          </div>
          <div className="quick-grid">
            <button className="quick-chip" onClick={() => navigate("/farms")}>
              <Icon n="farm" s={20} c="var(--verdigris)" />
              <span>Fazendas</span>
            </button>
            <button className="quick-chip" onClick={() => navigate("/collars")}>
              <Icon n="collar" s={20} c="var(--verdigris)" />
              <span>Coleiras</span>
            </button>
            <button className="quick-chip" onClick={() => navigate("/notifications")}>
              <span style={{ position: "relative" }}>
                <Icon n="bell" s={20} c="var(--verdigris)" />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4,
                    background: "var(--danger)", color: "#fff",
                    borderRadius: 99, fontSize: 9, width: 14, height: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{unreadCount}</span>
                )}
              </span>
              <span>Alertas</span>
            </button>
            <button className="quick-chip" onClick={() => navigate("/map")}>
              <Icon n="map" s={20} c="var(--verdigris)" />
              <span>Mapa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
