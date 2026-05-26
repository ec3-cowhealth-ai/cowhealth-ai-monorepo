import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { farmsService } from "@services/farmsService";
import type { CreateFarmInput, UpdateFarmInput } from "../../../types/farms.ts";

export const useFarms = () => {
  return useQuery({
    queryKey: ["farms"],
    queryFn: () => farmsService.list(),
  });
};

export const useFarm = (id: string) => {
  return useQuery({
    queryKey: ["farms", id],
    queryFn: () => farmsService.get(id),
  });
};

export const useCreateFarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFarmInput) => farmsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
    },
  });
};

export const useUpdateFarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFarmInput }) =>
      farmsService.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      queryClient.invalidateQueries({ queryKey: ["farms", id] });
    },
  });
};

export const useDeleteFarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => farmsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
    },
  });
};
