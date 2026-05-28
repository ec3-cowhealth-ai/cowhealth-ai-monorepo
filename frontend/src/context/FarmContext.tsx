import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react";
import { useFarms } from "@features/farms/hooks/useFarms";
import type { Farm } from "../types/farms";

interface FarmContextValue {
  selectedFarm: Farm | null;
  setSelectedFarm: (farm: Farm) => void;
  farms: Farm[];
  isLoading: boolean;
}

const FarmContext = createContext<FarmContextValue>({
  selectedFarm: null,
  setSelectedFarm: () => {},
  farms: [],
  isLoading: true,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useFarmContext = () => useContext(FarmContext);

export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const { data: farms = [], isLoading } = useFarms();
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(
    () => localStorage.getItem("selectedFarmId"),
  );

  // Deriva a fazenda selecionada sem setState em efeito
  const selectedFarm = useMemo((): Farm | null => {
    if (!farms.length) return null;
    const found = selectedFarmId ? farms.find((f) => String(f.id) === selectedFarmId) : null;
    return found ?? farms[0];
  }, [farms, selectedFarmId]);

  // Sincroniza localStorage quando a fazenda resolvida muda (sistema externo, não setState)
  useEffect(() => {
    if (selectedFarm) {
      localStorage.setItem("selectedFarmId", String(selectedFarm.id));
    }
  }, [selectedFarm]);

  const setSelectedFarm = (farm: Farm) => {
    localStorage.setItem("selectedFarmId", String(farm.id));
    setSelectedFarmId(String(farm.id));
  };

  return (
    <FarmContext.Provider value={{ selectedFarm, setSelectedFarm, farms, isLoading }}>
      {children}
    </FarmContext.Provider>
  );
};
