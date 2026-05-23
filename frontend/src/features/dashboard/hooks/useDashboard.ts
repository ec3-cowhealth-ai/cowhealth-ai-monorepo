import { useQuery } from "@tanstack/react-query";
import {
    getDashboardOverview,
    getCowsPerStatus,
    getCowsPerFarm,
} from "@services/dashboardService";

export const useDashboardOverview = () =>
    useQuery({ queryKey: ["dashboard", "overview"], queryFn: getDashboardOverview });

export const useCowsPerStatus = () =>
    useQuery({ queryKey: ["dashboard", "cows-per-status"], queryFn: getCowsPerStatus });

export const useCowsPerFarm = () =>
    useQuery({ queryKey: ["dashboard", "cows-per-farm"], queryFn: getCowsPerFarm });
