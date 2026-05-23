import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesService } from "@services/rolesService";
import type { CreateRoleInput, UpdateRoleInput } from "../../../types/access.ts";

export const useRoles = () =>
  useQuery({ queryKey: ["roles"], queryFn: () => rolesService.list() });

export const useRole = (id: string) =>
  useQuery({ queryKey: ["roles", id], queryFn: () => rolesService.get(id), enabled: !!id });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) => rolesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) =>
      rolesService.update(id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["roles", id] });
    },
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
};

export const useGrantPermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      rolesService.grantPermission(roleId, permissionId),
    onSuccess: (_, { roleId }) => qc.invalidateQueries({ queryKey: ["roles", roleId] }),
  });
};

export const useRevokePermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      rolesService.revokePermission(roleId, permissionId),
    onSuccess: (_, { roleId }) => qc.invalidateQueries({ queryKey: ["roles", roleId] }),
  });
};
