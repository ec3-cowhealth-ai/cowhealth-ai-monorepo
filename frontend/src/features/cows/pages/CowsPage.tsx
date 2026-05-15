import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState } from "@components/common";
import { CowCard } from "../components/CowCard";
import { useCows } from "../hooks/useCows";
import { CowStatusValues } from "../../../types/cows.ts";

export const CowsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: cows, isLoading } = useCows();

  const filteredCows = useMemo(() => {
    if (!cows) return [];
    return cows.filter((cow) => {
      const matchesSearch =
        cow.tag.toLowerCase().includes(search.toLowerCase()) ||
        cow.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || cow.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cows, search, statusFilter]);

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Vacas" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppBar title="Vacas" />

      <div className="app-page__section">
        {/* Search */}
        <div className="form-field">
          <input
            type="text"
            className="form-field__input"
            placeholder="Buscar por tag ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
          <button
            className={`btn btn-sm ${!statusFilter ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter("")}
          >
            Todas ({cows?.length || 0})
          </button>
          <button
            className={`btn btn-sm ${statusFilter === CowStatusValues.HEALTHY ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(CowStatusValues.HEALTHY)}
          >
            Saudáveis ({cows?.filter((c) => c.status === CowStatusValues.HEALTHY).length || 0})
          </button>
          <button
            className={`btn btn-sm ${statusFilter === CowStatusValues.ALERT ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(CowStatusValues.ALERT)}
          >
            Alertas ({cows?.filter((c) => c.status === CowStatusValues.ALERT).length || 0})
          </button>
          <button
            className={`btn btn-sm ${statusFilter === CowStatusValues.HEAT_STRESS ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(CowStatusValues.HEAT_STRESS)}
          >
            Estresse ({cows?.filter((c) => c.status === CowStatusValues.HEAT_STRESS).length || 0})
          </button>
        </div>

        {/* Cows Grid */}
        {filteredCows.length === 0 ? (
          <EmptyState
            icon="🐄"
            title="Nenhuma vaca encontrada"
            description={search ? "Nenhuma vaca corresponde à sua busca." : "Nenhuma vaca registrada."}
          />
        ) : (
          <div className="grid grid--2">
            {filteredCows.map((cow) => (
              <CowCard
                key={cow.id}
                cow={cow}
                onClick={() => navigate(`/cows/${cow.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
