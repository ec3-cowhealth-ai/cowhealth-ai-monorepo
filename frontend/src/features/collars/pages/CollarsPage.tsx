import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@components/common";
import { Tag } from "lucide-react";
import { CollarCard } from "../components/CollarCard";
import { useCollars } from "../hooks/useCollars";
import { COLLAR_STATUS_VALUES } from "../../../types/collars.ts";
import { C, cardStyle } from "@features/dashboard/constants/colors";

export const CollarsPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: collars, isLoading } = useCollars();

  const filteredCollars = useMemo(() => {
    if (!collars) return [];
    if (!statusFilter) return collars;
    return collars.filter((c) => c.status === statusFilter);
  }, [collars, statusFilter]);

  const counts = {
    all:         collars?.length || 0,
    active:      collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.ACTIVE).length      || 0,
    inactive:    collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.INACTIVE).length    || 0,
    maintenance: collars?.filter((c) => c.status === COLLAR_STATUS_VALUES.MAINTENANCE).length || 0,
  };

  const filterItems: [string, string, number][] = [
    ["", "Todas", counts.all],
    [COLLAR_STATUS_VALUES.ACTIVE,      "Ativas",      counts.active],
    [COLLAR_STATUS_VALUES.INACTIVE,    "Inativas",    counts.inactive],
    [COLLAR_STATUS_VALUES.MAINTENANCE, "Manutenção",  counts.maintenance],
  ];

  if (isLoading) {
    return (
      <div style={{ background: C.bg, minHeight: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Tag size={34} color={C.green} />
          <div>
            <h1 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 34, lineHeight: 1, margin: 0, color: C.text, fontWeight: 400,
            }}>
              Coleiras
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: C.muted }}>
              {counts.all} dispositivo{counts.all !== 1 ? "s" : ""} · {counts.active} ativo{counts.active !== 1 ? "s" : ""}
            </p>
          </div>
        </header>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filterItems.map(([val, label, count]) => {
            const active = statusFilter === val;
            return (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 16px", borderRadius: 999, fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  border: `1px solid ${active ? C.green : C.border}`,
                  background: active ? C.green : "#fff",
                  color: active ? "#fff" : C.muted,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {label}
                <span style={{ opacity: active ? 0.75 : 0.55, fontSize: 11 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filteredCollars.length === 0 ? (
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, textAlign: "center" }}>
            <Tag size={40} color={C.muted} />
            <p style={{ margin: 0, fontSize: 14, color: C.muted }}>Nenhuma coleira encontrada</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
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
