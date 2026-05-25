import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  loginService,
  getMeService,
  registerService,
} from "../services/authService";
import type { LoginInput } from "../types/auth";

const AUTH_QUERY_KEY = ["auth", "me"];

export const useMe = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getMeService,
    enabled: !!localStorage.getItem("token"),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginInput) => loginService(data),
    onSuccess: async ({ token }) => {
      localStorage.setItem("token", token);
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      navigate("/home");
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      registerService(data),
    onSuccess: () => {
      navigate("/login");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    navigate("/");
  };

  return { logout };
};
