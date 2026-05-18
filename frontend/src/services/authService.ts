import api from "../lib/api";
import type { AuthUser, LoginInput, RegisterInput } from "../types/auth";

export const loginService = (data: LoginInput) =>
    api.post<{ token: string }>("/auth/login", data).then((response) => response.data);

export const registerService = (data: RegisterInput) =>
    api.post<{ id: number }>("/users", data).then((response) => response.data);

export const getMeService = () =>
    api.get<AuthUser>("/auth/me").then((response) => response.data);