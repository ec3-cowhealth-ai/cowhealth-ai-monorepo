import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState } from "@components/common";
import { CollarCard } from "../components/CollarCard";
import { useCollars } from "../hooks/useCollars";
import { COLLAR_STATUS_VALUES } from "../../../types/collars.ts";

export const CollarsPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: collars, isLoading } = useCollars();

  const filteredCollars = useMemo(() => {
    if (!collars) return [];
    if (!statusFilter) return collars;
    return collars.filter((c) => c.status === statusFilter);
  }, [collars, statusFilter]);

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Coleiras" />
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

  return (
    <div className="app-page">
      <AppBar title="Coleiras" />

      <div className="app-page__section">
        {/* Status Filter */}
        <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
          <button
            className={`btn btn-sm ${!statusFilter ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter("")}
          >
            Todas ({collars?.length || 0})
          </button>
          <button
            className={`btn btn-sm ${statusFilter === COLLAR_STATUS_VALUES.ACTIVE ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(COLLAR_STATUS_VALUES.ACTIVE)}
          >
            Ativas ({collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.ACTIVE).length || 0})
          </button>
          <button
            className={`btn btn-sm ${statusFilter === COLLAR_STATUS_VALUES.INACTIVE ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(COLLAR_STATUS_VALUES.INACTIVE)}
          >
            Inativas (
            {collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.INACTIVE).length || 0})
          </button>
          <button
            className={`btn btn-sm ${statusFilter === COLLAR_STATUS_VALUES.MAINTENANCE ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(COLLAR_STATUS_VALUES.MAINTENANCE)}
          >
            Manutenção (
            {collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.MAINTENANCE).length || 0})
          </button>
        </div>

        {/* Collars Grid */}
        {filteredCollars.length === 0 ? (
          <EmptyState
            icon="⌚"
            title="Nenhuma coleira encontrada"
            description="Nenhuma coleira com esse status."
          />
        ) : (
          <div className="grid grid--2">
            {filteredCollars.map((collar) => (
              <CollarCard
                key={collar.id}
                collar={collar}
                onClick={() => navigate(`/collars/${collar.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
