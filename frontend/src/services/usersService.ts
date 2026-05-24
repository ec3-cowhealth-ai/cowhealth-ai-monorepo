import api from "../lib/api";
import type {
  User,
  UserListItem,
  CreateUserInput,
  UpdateUserInput,
} from "../types/access.ts";

export const usersService = {
  list: async () => {
    const response = await api.get<UserListItem[]>("/users");
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (input: CreateUserInput) => {
    const response = await api.post<User>("/users", input);
    return response.data;
  },

  update: async (id: string, input: UpdateUserInput) => {
    const response = await api.put<User>(`/users/${id}`, input);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },

  toggleActive: async (id: string) => {
    const response = await api.patch<User>(`/users/${id}/toggle-active`);
    return response.data;
  },

  assignRole: async (userId: string, roleId: string) => {
    await api.post(`/users/${userId}/roles/${roleId}`);
  },

  removeRole: async (userId: string, roleId: string) => {
    await api.delete(`/users/${userId}/roles/${roleId}`);
  },
};
