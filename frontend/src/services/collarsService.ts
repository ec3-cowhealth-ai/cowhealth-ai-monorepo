import api from "../lib/api";
import type { Collar, CreateCollarInput, UpdateCollarInput } from "../types/collars.ts";

export const collarsService = {
  list: async (filters?: { status?: string }) => {
    const response = await api.get<Collar[]>("/collars", { params: filters });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<Collar>(`/collars/${id}`);
    return response.data;
  },

  create: async (input: CreateCollarInput) => {
    const response = await api.post<Collar>("/collars", input);
    return response.data;
  },

  update: async (id: string, input: UpdateCollarInput) => {
    const response = await api.put<Collar>(`/collars/${id}`, input);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/collars/${id}`);
  },
};
