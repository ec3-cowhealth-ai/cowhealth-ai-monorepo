import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cowsService } from "@services/cowsService";
import type { CreateCowInput, UpdateCowInput } from "@/types/cows";
import { PERIOD_OPTIONS, type Period } from "@/types/period";

const periodToDays = (period: Period, customFrom?: string, customTo?: string): number => {
  if (period === "custom" && customFrom && customTo) {
    const diff = new Date(customTo).getTime() - new Date(customFrom).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  return PERIOD_OPTIONS.find((o) => o.value === period)?.days ?? 7;
};

export const useCows = (filters?: { farmId?: string; status?: string }) => {
  return useQuery({
    queryKey: ["cows", filters],
    queryFn: () => cowsService.list(filters),
    refetchInterval: 30000,
  });
};

export const useCow = (id: string) => {
  return useQuery({
    queryKey: ["cows", id],
    queryFn: () => cowsService.get(id),
  });
};

export const useCowHeartRateDaily = (cowId: string, period: Period = "daily", customFrom?: string, customTo?: string) => {
  const days = periodToDays(period, customFrom, customTo);
  return useQuery({
    queryKey: ["cows", cowId, "heart-rate-daily", days],
    queryFn: () => cowsService.getHeartRateDaily(cowId, days),
    refetchInterval: 30000,
  });
};

export const useCowTemperatureDaily = (cowId: string, period: Period = "daily", customFrom?: string, customTo?: string) => {
  const days = periodToDays(period, customFrom, customTo);
  return useQuery({
    queryKey: ["cows", cowId, "temperature-daily", days],
    queryFn: () => cowsService.getTemperatureDaily(cowId, days),
    refetchInterval: 30000,
  });
};

export const useCreateCow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCowInput) => cowsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cows"] });
    },
  });
};

export const useUpdateCow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCowInput }) =>
      cowsService.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["cows"] });
      queryClient.invalidateQueries({ queryKey: ["cows", id] });
    },
  });
};

export const useCowMedicalRecords = (cowId: string) => {
  return useQuery({
    queryKey: ["cows", cowId, "medical-records"],
    queryFn:  () => cowsService.getMedicalRecords(cowId),
    enabled:  !!cowId,
  });
};

export const useDeleteCow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cowsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cows"] });
    },
  });
};

export const useRetireCow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: "SALE" | "SLAUGHTER" }) =>
      cowsService.retireCow(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cows"] });
    },
  });
};

export const useCowAccelerometerDaily = (cowId: string, period: Period = "daily", customFrom?: string, customTo?: string) => {
  const days = periodToDays(period, customFrom, customTo);
  return useQuery({
    queryKey: ["cows", cowId, "accelerometer-daily", days],
    queryFn: () => cowsService.getAccelerometerDaily(cowId, days),
    refetchInterval: 30000,
    enabled: !!cowId,
  });
};
