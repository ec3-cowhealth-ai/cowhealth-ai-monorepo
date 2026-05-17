import api from "../lib/api";
import type { Role, CreateRoleInput, UpdateRoleInput } from "../types/access.ts";

export const rolesService = {
  list: async () => {
    const response = await api.get<Role[]>("/roles");
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },

  create: async (input: CreateRoleInput) => {
    const response = await api.post<Role>("/roles", input);
    return response.data;
  },

  update: async (id: string, input: UpdateRoleInput) => {
    const response = await api.put<Role>(`/roles/${id}`, input);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/roles/${id}`);
  },

  grantPermission: async (roleId: string, permissionId: string) => {
    await api.post(`/roles/${roleId}/permissions/${permissionId}`);
  },

  revokePermission: async (roleId: string, permissionId: string) => {
    await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
  },
};
