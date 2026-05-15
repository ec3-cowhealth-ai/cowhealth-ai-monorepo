import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collarsService } from "@services/collarsService";
import type { CreateCollarInput, UpdateCollarInput } from "../../../types/collars.ts";

export const useCollars = () => {
  return useQuery({
    queryKey: ["collars"],
    queryFn: () => collarsService.list(),
  });
};

export const useCollar = (id: string) => {
  return useQuery({
    queryKey: ["collars", id],
    queryFn: () => collarsService.get(id),
  });
};

export const useCreateCollar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCollarInput) => collarsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collars"] });
    },
  });
};

export const useUpdateCollar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCollarInput }) =>
      collarsService.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["collars"] });
      queryClient.invalidateQueries({ queryKey: ["collars", id] });
    },
  });
};

export const useDeleteCollar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collarsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collars"] });
    },
  });
};
