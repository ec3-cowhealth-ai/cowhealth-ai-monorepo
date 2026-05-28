import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner, EmptyState } from "@components/common";
import { Warehouse, Plus } from "lucide-react";
import { FarmCard } from "../components/FarmCard";
import { FarmForm } from "../components/FarmForm";
import { useFarms, useCreateFarm } from "../hooks/useFarms";
import { useMe } from "@hooks/useAuth";
import type { CreateFarmInput } from "@/types/farms";
import { C } from "@features/dashboard/constants/colors";

export const FarmsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: me } = useMe();
  const isSuperAdmin = me?.roles.some((r) => r.name === "SuperAdmin");

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
    <div className="app-page" style={{ background: C.bg }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Warehouse size={34} color={C.green} />
          <div>
            <h1
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 34,
                lineHeight: 1,
                margin: 0,
                color: C.text,
                fontWeight: 400,
              }}
            >
              Fazendas
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: C.muted }}>
              {farms?.length ?? 0} fazenda{(farms?.length ?? 0) !== 1 ? "s" : ""} cadastrada
              {(farms?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: C.green, border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", flexShrink: 0,
            }}
            title="Nova fazenda"
          >
            <Plus size={18} />
          </button>
        )}
      </header>

      <div className="app-content">
        <div className="form-field">
          <input
            type="text"
            className="form-field__input"
            placeholder="Buscar por nome ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {filteredFarms.length === 0 ? (
          <EmptyState
            icon={<Warehouse size={40} />}
            title="Nenhuma fazenda encontrada"
            description={isSuperAdmin ? "Crie sua primeira fazenda para começar" : "Você não tem acesso a nenhuma fazenda."}
            action={
              isSuperAdmin ? (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  Criar Fazenda
                </button>
              ) : undefined
            }
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {filteredFarms.map((farm) => (
              <FarmCard key={farm.id} farm={farm} onClick={() => navigate(`/farms/${farm.id}`)} />
            ))}
          </div>
        )}
      </div>

      {isSuperAdmin && (
        <FarmForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateFarm}
          isLoading={isPending}
        />
      )}
    </div>
  );
};
