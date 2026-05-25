import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner } from "@components/common";
import { Search, ChevronRight } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { StatusDot } from "@components/ui/StatusDot";
import { useCows } from "../hooks/useCows";
import { useFarmContext } from "../../../context/FarmContext";
import { CowStatusValues } from "../../../types/cows";
import type { Cow } from "../../../types/cows";

type StatusFilter = "" | "HEALTHY" | "ALERT" | "HEAT_STRESS" | "CALVING";

const STATUS_LABEL: Record<string, string> = {
  HEALTHY: "Saudável",
  ALERT: "Alerta",
  HEAT_STRESS: "Est. Térmico",
  CALVING: "Parto",
};

const statusTone = (s: string) => {
  if (s === CowStatusValues.ALERT) return "danger" as const;
  if (s === CowStatusValues.HEAT_STRESS) return "warn" as const;
  if (s === CowStatusValues.CALVING) return "info" as const;
  return "success" as const;
};

const statusColor = (s: string) => {
  if (s === CowStatusValues.ALERT) return "var(--danger)";
  if (s === CowStatusValues.HEAT_STRESS) return "var(--warning)";
  if (s === CowStatusValues.CALVING) return "var(--info)";
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
      healthy:
        cows?.filter((c: Cow) => c.status === CowStatusValues.HEALTHY).length ||
        0,
      alert:
        cows?.filter((c: Cow) => c.status === CowStatusValues.ALERT).length ||
        0,
      heat:
        cows?.filter((c: Cow) => c.status === CowStatusValues.HEAT_STRESS)
          .length || 0,
      calving:
        cows?.filter((c: Cow) => c.status === CowStatusValues.CALVING).length ||
        0,
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
          <button
            className="app-bar__action"
            onClick={() => setShowSearch((v) => !v)}
          >
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
              [CowStatusValues.HEALTHY, "Saudáveis", counts.healthy],
              [CowStatusValues.ALERT, "Alertas", counts.alert],
              [CowStatusValues.HEAT_STRESS, "Estresse", counts.heat],
              [CowStatusValues.CALVING, "Parto", counts.calving],
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
              <button
                key={cow.id}
                className="cow-row"
                onClick={() => navigate(`/cows/${cow.id}`)}
              >
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
                    pulse={cow.status === CowStatusValues.ALERT}
                  />
                  <span className="cow-row__status">
                    {STATUS_LABEL[cow.status] ?? cow.status}
                  </span>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
