import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@components/common";
import { Search } from "lucide-react";
import { CowHead } from "@components/ui/CowHeadIcon";
import { useCows } from "../hooks/useCows";
import { useFarmContext } from "../../../context/FarmContext";
import { COW_STATUS_VALUES } from "../../../types/cows";
import type { Cow } from "../../../types/cows";
import { C, cardStyle } from "@features/dashboard/constants/colors";

type StatusFilter = "" | "HEALTHY" | "ALERT" | "HEAT_STRESS" | "CALVING";

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

  const filterItems: [StatusFilter, string, number][] = [
    ["", "Todas", counts.all],
    [COW_STATUS_VALUES.HEALTHY as StatusFilter, "Saudáveis", counts.healthy],
    [COW_STATUS_VALUES.ALERT as StatusFilter, "Alertas", counts.alert],
    [COW_STATUS_VALUES.HEAT_STRESS as StatusFilter, "Estresse", counts.heat],
    [COW_STATUS_VALUES.CALVING as StatusFilter, "Parto", counts.calving],
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CowHead size={34} color={C.green} />
            <div>
              <h1 style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 34, lineHeight: 1, margin: 0, color: C.text, fontWeight: 400,
              }}>
                Rebanho
              </h1>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: C.muted }}>
                {selectedFarm?.name ?? "Todas as fazendas"} · {counts.all} animais
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSearch((v) => !v)}
            style={{
              width: 36, height: 36, borderRadius: 999,
              background: showSearch ? C.green : "#fff",
              border: `1px solid ${showSearch ? C.green : C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Search size={16} color={showSearch ? "#fff" : C.muted} />
          </button>
        </header>

        {/* Search */}
        {showSearch && (
          <input
            autoFocus
            type="text"
            placeholder="Buscar por tag ou nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: 12, border: `1px solid ${C.border}`,
              background: "#fff", fontSize: 14, color: C.text,
              outline: "none", boxSizing: "border-box",
            }}
          />
        )}

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
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, color: C.muted }}>
            <CowHead size={40} color={C.muted} />
            <p style={{ margin: 0, fontSize: 14 }}>Nenhuma vaca encontrada</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {filtered.map((cow: Cow) => {
              const sColor = STATUS_COLOR[cow.status] ?? C.green;
              const sBg   = STATUS_BG[cow.status]    ?? "#e6f1ea";
              return (
                <button
                  key={cow.id}
                  onClick={() => navigate(`/cows/${cow.id}`)}
                  style={{
                    ...cardStyle,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 10,
                    padding: 20, cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: sBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CowHead size={30} color={sColor} />
                  </div>

                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>
                      {cow.name || cow.tag}
                    </p>
                    <p style={{ margin: "2px 0 0 0", fontSize: 11, color: C.muted }}>
                      Brinco {cow.tag}
                    </p>
                  </div>

                  {cow.farm && (
                    <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{cow.farm.name}</p>
                  )}

                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    padding: "3px 12px", borderRadius: 999,
                    background: sBg, color: sColor,
                  }}>
                    {STATUS_LABEL[cow.status] ?? cow.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
