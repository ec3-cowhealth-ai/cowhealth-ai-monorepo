import api from "../lib/api";
import type { AuthUser, LoginInput } from "../types/auth";

export const loginService = (data: LoginInput) =>
  api.post<{ token: string }>("/auth/login", data).then((response) => response.data);

export const getMeService = () => api.get<AuthUser>("/auth/me").then((response) => response.data);

export const registerService = (data: { name: string; email: string; password: string }) =>
  api
    .post<{ id: number; name: string; email: string }>("/auth/register", data)
    .then((response) => response.data);
