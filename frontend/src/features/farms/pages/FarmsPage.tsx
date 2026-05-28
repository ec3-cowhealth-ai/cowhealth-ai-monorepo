import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@components/common";
import { Warehouse, Plus } from "lucide-react";
import { FarmCard } from "../components/FarmCard";
import { FarmForm } from "../components/FarmForm";
import { useFarms, useCreateFarm } from "../hooks/useFarms";
import type { CreateFarmInput } from "../../../types/farms";
import { C, cardStyle } from "@features/dashboard/constants/colors";

export const FarmsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: farms, isLoading } = useFarms();
  const { mutate: createFarm, isPending } = useCreateFarm();

  const filteredFarms = useMemo(() => {
    if (!farms) return [];
    return farms.filter(
      (farm) =>
        farm.name.toLowerCase().includes(search.toLowerCase()) || farm.cnpj.includes(search),
    );
  }, [farms, search]);

  const handleCreateFarm = (data: CreateFarmInput) => {
    createFarm(data, { onSuccess: () => setShowForm(false) });
  };

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
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Warehouse size={34} color={C.green} />
            <div>
              <h1 style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 34, lineHeight: 1, margin: 0, color: C.text, fontWeight: 400,
              }}>
                Fazendas
              </h1>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: C.muted }}>
                {farms?.length ?? 0} fazenda{(farms?.length ?? 0) !== 1 ? "s" : ""} cadastrada{(farms?.length ?? 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              border: `1px solid ${C.green}`, background: C.green,
              color: "#fff", cursor: "pointer",
            }}
          >
            <Plus size={15} /> Nova
          </button>
        </header>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px",
            borderRadius: 12, border: `1px solid ${C.border}`,
            background: "#fff", fontSize: 14, color: C.text,
            outline: "none", boxSizing: "border-box",
          }}
        />

        {/* Grid */}
        {filteredFarms.length === 0 ? (
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, textAlign: "center" }}>
            <Warehouse size={40} color={C.muted} />
            <p style={{ margin: 0, fontSize: 14, color: C.muted }}>Nenhuma fazenda encontrada</p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: `1px solid ${C.green}`, background: C.green, color: "#fff", cursor: "pointer",
              }}
            >
              Criar Fazenda
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {filteredFarms.map((farm) => (
              <FarmCard key={farm.id} farm={farm} onClick={() => navigate(`/farms/${farm.id}`)} />
            ))}
          </div>
        )}
      </div>

      <FarmForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateFarm}
        isLoading={isPending}
      />
    </div>
  );
};
