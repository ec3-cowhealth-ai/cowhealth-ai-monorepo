import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMe } from "@hooks/useAuth";
import { AppBar } from "@components/layout";
import { LoadingSpinner, StatusBadge } from "@components/common";
import { cowsService } from "@services/cowsService";
import type { Cow } from "../../types/cows";
import { CowStatusValues } from "../../types/cows";

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: user } = useMe();

  // Get all cows
  const { data: cows, isLoading: cowsLoading } = useQuery({
    queryKey: ["cows"],
    queryFn: () => cowsService.list(),
  });

  if (cowsLoading) {
    return (
      <div className="app-page">
        <AppBar title="Home" onBack={undefined} />
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Calculate herd status
  const herdStatus = {
    healthy: cows?.filter((c: Cow) => c.status === CowStatusValues.HEALTHY).length || 0,
    calving: cows?.filter((c: Cow) => c.status === CowStatusValues.CALVING).length || 0,
    heat_stress:
      cows?.filter((c: Cow) => c.status === CowStatusValues.HEAT_STRESS).length || 0,
    alert: cows?.filter((c: Cow) => c.status === CowStatusValues.ALERT).length || 0,
  };

  // Get cows in attention
  const cowsInAttention = cows
    ?.filter(
      (c: Cow) =>
        c.status === CowStatusValues.ALERT || c.status === CowStatusValues.HEAT_STRESS
    )
    .slice(0, 3) || [];

  return (
    <div className="app-page">
      <AppBar title="Home" onBack={undefined} />

      <div className="app-page__section">
        {/* Greeting */}
        <div style={{ padding: "var(--s-2)" }}>
          <p
            style={{
              margin: 0,
              fontSize: "var(--t-sm)",
              color: "var(--text-secondary)",
            }}
          >
            {greeting()},
          </p>
          <h2
            style={{
              margin: "var(--s-1) 0 0 0",
              fontSize: "var(--t-h1)",
              color: "var(--text-primary)",
            }}
          >
            {user?.name}
          </h2>
        </div>

        {/* Herd Status */}
        <div
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "var(--s-3)",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 var(--s-1) 0",
                fontSize: "var(--t-sm)",
                color: "var(--text-secondary)",
              }}
            >
              Saudáveis
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--success)",
              }}
            >
              {herdStatus.healthy}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: "0 0 var(--s-1) 0",
                fontSize: "var(--t-sm)",
                color: "var(--text-secondary)",
              }}
            >
              Em Parto
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--info)",
              }}
            >
              {herdStatus.calving}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: "0 0 var(--s-1) 0",
                fontSize: "var(--t-sm)",
                color: "var(--text-secondary)",
              }}
            >
              Estresse Térmico
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--warning)",
              }}
            >
              {herdStatus.heat_stress}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: "0 0 var(--s-1) 0",
                fontSize: "var(--t-sm)",
                color: "var(--text-secondary)",
              }}
            >
              Alertas
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--danger)",
              }}
            >
              {herdStatus.alert}
            </p>
          </div>
        </div>

        {/* Cows in Attention */}
        {cowsInAttention.length > 0 && (
          <>
            <div>
              <h3
                style={{
                  margin: "var(--s-4) 0 var(--s-3) 0",
                  fontSize: "var(--t-h2)",
                  fontWeight: 700,
                }}
              >
                Vacas em Atenção
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "var(--s-3)",
                }}
              >
                {cowsInAttention.map((cow: Cow) => (
                  <div
                    key={cow.id}
                    className="card card--clickable"
                    onClick={() => navigate(`/cows/${cow.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <p
                      style={{
                        margin: "0 0 var(--s-2) 0",
                        fontSize: "var(--t-sm)",
                        fontWeight: 600,
                      }}
                    >
                      {cow.tag}
                    </p>
                    <StatusBadge
                      tone={
                        cow.status === CowStatusValues.ALERT ? "danger" : "warning"
                      }
                    >
                      {cow.status}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Quick Access */}
        <div>
          <h3
            style={{
              margin: "var(--s-4) 0 var(--s-3) 0",
              fontSize: "var(--t-h2)",
              fontWeight: 700,
            }}
          >
            Acesso Rápido
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "var(--s-3)",
            }}
          >
            <button
              onClick={() => navigate("/farms")}
              className="card card--clickable"
              style={{
                border: "none",
                cursor: "pointer",
                padding: "var(--s-4)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "var(--s-2)" }}>
                🏡
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                Fazendas
              </p>
            </button>

            <button
              onClick={() => navigate("/collars")}
              className="card card--clickable"
              style={{
                border: "none",
                cursor: "pointer",
                padding: "var(--s-4)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "var(--s-2)" }}>
                ⌚
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                Coleiras
              </p>
            </button>

            <button
              onClick={() => navigate("/cows")}
              className="card card--clickable"
              style={{
                border: "none",
                cursor: "pointer",
                padding: "var(--s-4)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "var(--s-2)" }}>
                🐄
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                Vacas
              </p>
            </button>

            <button
              onClick={() => navigate("/notifications")}
              className="card card--clickable"
              style={{
                border: "none",
                cursor: "pointer",
                padding: "var(--s-4)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "var(--s-2)" }}>
                🔔
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--t-body)",
                  fontWeight: 600,
                }}
              >
                Notificações
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
