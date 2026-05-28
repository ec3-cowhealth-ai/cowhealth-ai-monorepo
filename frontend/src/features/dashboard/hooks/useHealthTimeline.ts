import { useQuery } from "@tanstack/react-query";
import api from "@lib/api";
import type { ChartDataPoint } from "../types";

interface HealthTimelinePoint {
  date: string;
  healthy: number;
  alert: number;
  heatStress: number;
  calving: number;
}

export const useHealthTimeline = (farmId?: number) =>
  useQuery({
    queryKey: ["dashboard", "health-timeline", farmId],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const params = farmId ? `?farmId=${farmId}` : "";
      const res = await api.get<HealthTimelinePoint[]>(`/dashboard/health-timeline${params}`);
      return res.data.map((p) => ({
        label: p.date.slice(5).replace("-", "/"), // "MM/DD" → keep as is, format: "05/27"
        value: p.healthy,
        alert: p.alert,
        heatStress: p.heatStress,
        calving: p.calving,
      }));
    },
  });
