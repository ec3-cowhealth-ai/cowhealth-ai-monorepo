import { useQuery } from "@tanstack/react-query";
import {
    getDashboardOverview,
    getCowsPerStatus,
    getCowsPerFarm,
} from "@services/dashboardService";

export const useDashboardOverview = (farmId?: string) =>
    useQuery({
        queryKey: ["dashboard", "overview", farmId],
        queryFn: () => getDashboardOverview(farmId),
    });

export const useCowsPerStatus = (farmId?: string) =>
    useQuery({
        queryKey: ["dashboard", "cows-per-status", farmId],
        queryFn: () => getCowsPerStatus(farmId),
    });

export const useCowsPerFarm = () =>
    useQuery({ queryKey: ["dashboard", "cows-per-farm"], queryFn: getCowsPerFarm });
