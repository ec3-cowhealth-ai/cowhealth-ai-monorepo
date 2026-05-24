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

export const useFarmContext = () => useContext(FarmContext);

export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const { data: farms = [], isLoading } = useFarms();
  const [selectedFarm, setSelectedFarmState] = useState<Farm | null>(null);

  // Auto-seleciona a primeira fazenda ao carregar
  useEffect(() => {
    if (farms.length > 0 && !selectedFarm) {
      const saved = localStorage.getItem("selectedFarmId");
      const found = saved ? farms.find((f) => String(f.id) === saved) : null;
      setSelectedFarmState(found ?? farms[0]);
    }
  }, [farms, selectedFarm]);

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
