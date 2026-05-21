import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@components/layout";
import { LoadingSpinner, EmptyState } from "@components/common";
import { FarmCard } from "../components/FarmCard";
import { FarmForm } from "../components/FarmForm";
import { useFarms, useCreateFarm } from "../hooks/useFarms";
import type { CreateFarmInput } from "../../../types/farms";

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
        farm.name.toLowerCase().includes(search.toLowerCase()) ||
        farm.cnpj.includes(search)
    );
  }, [farms, search]);

  const handleCreateFarm = (data: CreateFarmInput) => {
    createFarm(data, {
      onSuccess: () => setShowForm(false),
    });
  };

  if (isLoading) {
    return (
      <div className="app-page">
        <AppBar title="Fazendas" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppBar
        title="Fazendas"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            + Nova
          </button>
        }
      />

      <div className="app-page__section">
        <div className="form-field">
          <input
            type="text"
            className="form-field__input"
            placeholder="Buscar por nome ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredFarms.length === 0 ? (
          <EmptyState
            icon="🏡"
            title="Nenhuma fazenda encontrada"
            description="Crie sua primeira fazenda para começar"
            action={
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Criar Fazenda
              </button>
            }
          />
        ) : (
          <div className="grid grid--2">
            {filteredFarms.map((farm) => (
              <FarmCard
                key={farm.id}
                farm={farm}
                onClick={() => navigate(`/farms/${farm.id}`)}
              />
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
