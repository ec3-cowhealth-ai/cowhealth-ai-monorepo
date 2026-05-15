import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cowsService } from "@services/cowsService";
import type { CreateCowInput, UpdateCowInput } from "../../../types/cows.ts";

export const useCows = (filters?: { farmId?: string; status?: string }) => {
  return useQuery({
    queryKey: ["cows", filters],
    queryFn: () => cowsService.list(filters),
  });
};

export const useCow = (id: string) => {
  return useQuery({
    queryKey: ["cows", id],
    queryFn: () => cowsService.get(id),
  });
};

export const useCowHeartRateDaily = (cowId: string, days: number = 7) => {
  return useQuery({
    queryKey: ["cows", cowId, "heart-rate-daily", days],
    queryFn: () => cowsService.getHeartRateDaily(cowId, days),
    refetchInterval: 30000,
  });
};

export const useCowTemperatureDaily = (cowId: string, days: number = 7) => {
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

export const useDeleteCow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cowsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cows"] });
    },
  });
};
