import api from "@lib/api";

export interface DashboardOverviewResponse {
  totalCows: number;
  healthyCows: number;
  unhealthyCows: number;
  totalFarms: number;
  totalActiveCollars: number;
  unreadNotifications: number;
  topFarm: { id: number; name: string; cowCount: number } | null;
}

export interface CowStatusItem {
  label: string;
  value: number;
}

export interface CowFarmItem {
  label: string;
  value: number;
}

export const getDashboardOverview = (farmId?: string) =>
  api
    .get<DashboardOverviewResponse>("/dashboard/overview", {
      params: farmId ? { farmId } : {},
    })
    .then((r) => r.data);

export const getCowsPerStatus = (farmId?: string) =>
  api
    .get<CowStatusItem[]>("/dashboard/cows-per-status", { params: farmId ? { farmId } : {} })
    .then((r) => r.data);

export const getCowsPerFarm = () =>
  api.get<CowFarmItem[]>("/dashboard/cows-per-farm").then((r) => r.data);
