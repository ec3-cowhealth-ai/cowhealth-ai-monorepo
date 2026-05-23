import api from "@lib/api";

export interface DashboardOverviewResponse {
    totalCows: number;
    cowsWithCollar: number;
    cowsInAlert: number;
    totalFarms: number;
    totalActiveCollars: number;
    unreadNotifications: number;
    topFarm: { id: number; name: string; cowCount: number } | null;
}

export interface CowStatusItem {
    status: string;
    count: number;
}

export interface CowFarmItem {
    id: number;
    name: string;
    cowCount: number;
}

export const getDashboardOverview = () =>
    api.get<DashboardOverviewResponse>("/dashboard/overview").then((r) => r.data);

export const getCowsPerStatus = () =>
    api.get<CowStatusItem[]>("/dashboard/cows-per-status").then((r) => r.data);

export const getCowsPerFarm = () =>
    api.get<CowFarmItem[]>("/dashboard/cows-per-farm").then((r) => r.data);
