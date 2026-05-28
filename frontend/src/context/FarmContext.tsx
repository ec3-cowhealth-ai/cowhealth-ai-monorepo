import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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
  const [selectedFarm, setSelectedFarmState] = useState<Farm | null>(null);

  // Auto-seleciona a primeira fazenda ao carregar ou valida a seleção atual
  useEffect(() => {
    if (farms.length > 0) {
      const savedId = localStorage.getItem("selectedFarmId");
      const currentId = selectedFarm?.id;

      // Se não temos nada selecionado, ou se o ID salvo é diferente do atual, ou se o atual não está na lista
      const isCurrentValid = farms.some((f) => f.id === currentId);
      
      if (!selectedFarm || !isCurrentValid) {
        const found = savedId ? farms.find((f) => String(f.id) === savedId) : null;
        const nextFarm = found ?? farms[0];
        
        setSelectedFarmState(nextFarm);
        localStorage.setItem("selectedFarmId", String(nextFarm.id));
      }
    } else if (!isLoading) {
      setSelectedFarmState(null);
    }
  }, [farms, selectedFarm, isLoading]);

  const setSelectedFarm = (farm: Farm) => {
    localStorage.setItem("selectedFarmId", String(farm.id));
    setSelectedFarmState(farm);
  };

  return (
    <FarmContext.Provider value={{ selectedFarm, setSelectedFarm, farms, isLoading }}>
      {children}
    </FarmContext.Provider>
  );
};
