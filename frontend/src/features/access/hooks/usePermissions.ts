import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionsService } from "@services/permissionsService";

export const usePermissions = () =>
  useQuery({
    queryKey: ["permissions"],
    queryFn: () => permissionsService.list(),
  });

export const useCreatePermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description: string }) => permissionsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["permissions"] }),
  });
};

export const useUpdatePermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string; description?: string } }) =>
      permissionsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["permissions"] }),
  });
};

export const useDeletePermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => permissionsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["permissions"] }),
  });
};
