import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  email: z.email("Email inválido."),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres."),
  farmId: z.number().int().positive().optional(),
  roleId: z.number().int().positive().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.email().optional(),
  password: z.string().min(8).optional(),
  farmId: z.number().int().positive().optional(),
});
