import api from "../lib/api";
import type { Farm, CreateFarmInput, UpdateFarmInput } from "../types/farms.ts";

export const farmsService = {
  list: async () => {
    const response = await api.get<Farm[]>("/farms");
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<Farm>(`/farms/${id}`);
    return response.data;
  },

  create: async (input: CreateFarmInput) => {
    const response = await api.post<Farm>("/farms", input);
    return response.data;
  },

  update: async (id: string, input: UpdateFarmInput) => {
    const response = await api.put<Farm>(`/farms/${id}`, input);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/farms/${id}`);
  },
};
