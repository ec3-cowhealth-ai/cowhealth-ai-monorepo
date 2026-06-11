import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview, getCowsPerStatus, getCowsPerFarm } from "@services/dashboardService";

export const useDashboardOverview = (farmId?: string, dateStart?: string, dateEnd?: string) =>
  useQuery({
    queryKey: ["dashboard", "overview", farmId, dateStart, dateEnd],
    queryFn: () => getDashboardOverview(farmId, dateStart, dateEnd),
  });

export const useCowsPerStatus = (farmId?: string, dateStart?: string, dateEnd?: string) =>
  useQuery({
    queryKey: ["dashboard", "cows-per-status", farmId, dateStart, dateEnd],
    queryFn: () => getCowsPerStatus(farmId, dateStart, dateEnd),
  });

export const useCowsPerFarm = () =>
  useQuery({
    queryKey: ["dashboard", "cows-per-farm"],
    queryFn: getCowsPerFarm,
  });
