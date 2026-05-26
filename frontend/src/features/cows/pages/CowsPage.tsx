import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner } from "@components/common";
import { Search } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { StatusDot } from "@components/ui/StatusDot";
import { useCows } from "../hooks/useCows";
import { useFarmContext } from "../../../context/FarmContext";
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

export const CowsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [showSearch, setShowSearch] = useState(false);

  const { selectedFarm } = useFarmContext();
  const farmId = selectedFarm ? String(selectedFarm.id) : undefined;
  const { data: cows, isLoading } = useCows({ farmId });

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
          <button className="app-bar__action" onClick={() => setShowSearch((v) => !v)}>
            <Search size={20} />
          </button>
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--s-3)",
            }}
          >
            {filtered.map((cow: Cow) => (
              <button
                key={cow.id}
                className="card"
                onClick={() => navigate(`/cows/${cow.id}`)}
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  padding: "var(--s-4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--s-2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <CowHead size={32} color={statusColor(cow.status)} />
                  <StatusDot
                    tone={statusTone(cow.status)}
                    pulse={cow.status === COW_STATUS_VALUES.ALERT}
                  />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "var(--t-sm)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {cow.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--t-xs)",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    #{cow.tag}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "var(--t-xs)",
                    fontWeight: 600,
                    color: statusColor(cow.status),
                    background: `color-mix(in srgb, ${statusColor(cow.status)} 12%, transparent)`,
                    borderRadius: 999,
                    padding: "2px 8px",
                    alignSelf: "flex-start",
                  }}
                >
                  {STATUS_LABEL[cow.status] ?? cow.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
