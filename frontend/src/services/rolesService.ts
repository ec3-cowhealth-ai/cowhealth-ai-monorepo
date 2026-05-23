import api from "../lib/api";
import type { RoleListItem, RoleDetail, CreateRoleInput, UpdateRoleInput } from "../types/access.ts";

export const rolesService = {
  list: async () => {
    const response = await api.get<RoleListItem[]>("/roles");
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<RoleDetail>(`/roles/${id}`);
    return response.data;
  },

  create: async (input: CreateRoleInput) => {
    const response = await api.post<RoleDetail>("/roles", input);
    return response.data;
  },

  update: async (id: string, input: UpdateRoleInput) => {
    const response = await api.put<RoleDetail>(`/roles/${id}`, input);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/roles/${id}`);
  },

  // Backend: POST /roles/:id/permissions com body { permissionId }
  grantPermission: async (roleId: string, permissionId: string) => {
    await api.post(`/roles/${roleId}/permissions`, { permissionId });
  },

  revokePermission: async (roleId: string, permissionId: string) => {
    await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
  },
};
