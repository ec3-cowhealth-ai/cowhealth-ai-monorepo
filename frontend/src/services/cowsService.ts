import api from "../lib/api";
import type {
  Cow,
  CreateCowInput,
  UpdateCowInput,
  HeartRateDailyPoint,
  TemperatureDailyPoint,
  SensorPage,
} from "../types/cows.ts";

export const cowsService = {
  list: async (filters?: { farmId?: string; status?: string }) => {
    const response = await api.get<Cow[]>("/cows", { params: filters });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<Cow>(`/cows/${id}`);
    return response.data;
  },

  create: async (input: CreateCowInput) => {
    const response = await api.post<Cow>("/cows", input);
    return response.data;
  },

  update: async (id: string, input: UpdateCowInput) => {
    const response = await api.put<Cow>(`/cows/${id}`, input);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/cows/${id}`);
  },

  // Sensor data
  getHeartRateDaily: async (cowId: string, days: number = 7) => {
    const response = await api.get<HeartRateDailyPoint[]>(
      `/cows/${cowId}/heart-rate/daily`,
      { params: { days } }
    );
    return response.data;
  },

  getTemperatureDaily: async (cowId: string, days: number = 7) => {
    const response = await api.get<TemperatureDailyPoint[]>(
      `/cows/${cowId}/temperature/daily`,
      { params: { days } }
    );
    return response.data;
  },

  getHeartRate: async (
    cowId: string,
    page: number = 1,
    pageSize: number = 100
  ) => {
    const response = await api.get<SensorPage<HeartRateDailyPoint>>(
      `/cows/${cowId}/heart-rate`,
      { params: { page, pageSize } }
    );
    return response.data;
  },

  getTemperature: async (
    cowId: string,
    page: number = 1,
    pageSize: number = 100
  ) => {
    const response = await api.get<SensorPage<TemperatureDailyPoint>>(
      `/cows/${cowId}/temperature`,
      { params: { page, pageSize } }
    );
    return response.data;
  },

  // Photos
  uploadPhoto: async (cowId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{ filename: string }>(
      `/cows/${cowId}/photos`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  deletePhoto: async (cowId: string, filename: string) => {
    await api.delete(`/cows/${cowId}/photos/${filename}`);
  },
};
