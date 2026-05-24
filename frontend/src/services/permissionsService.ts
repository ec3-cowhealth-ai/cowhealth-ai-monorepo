import api from "../lib/api";
import type { Permission, PermissionGroup } from "../types/access.ts";

export const permissionsService = {
  list: async () => {
    const response = await api.get<Permission[]>("/permissions");
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<Permission>(`/permissions/${id}`);
    return response.data;
  },

  create: async (input: { name: string; description: string }) => {
    const response = await api.post<Permission>("/permissions", input);
    return response.data;
  },

  update: async (
    id: string,
    input: { name?: string; description?: string },
  ) => {
    const response = await api.put<Permission>(`/permissions/${id}`, input);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/permissions/${id}`);
  },

  listGroups: async () => {
    const response = await api.get<PermissionGroup[]>("/permission-groups");
    return response.data;
  },

  getGroup: async (id: string) => {
    const response = await api.get<PermissionGroup>(`/permission-groups/${id}`);
    return response.data;
  },
};
