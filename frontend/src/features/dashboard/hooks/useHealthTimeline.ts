import { useQuery } from "@tanstack/react-query";
import api from "@lib/api";
import type { Period } from "@/types/period";

export interface HealthTimelinePoint {
  label: string;
  healthy: number;
  alert: number;
  heatStress: number;
  calving: number;
}

export const useHealthTimeline = (
  farmId?: number,
  period: Period = "daily",
  from?: string,
  to?: string,
) =>
  useQuery({
    queryKey: ["dashboard", "health-timeline", farmId, period, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (farmId) params.set("farmId", String(farmId));
      params.set("period", period);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await api.get<HealthTimelinePoint[]>(`/dashboard/health-timeline?${params}`);
      return res.data;
    },
  });
