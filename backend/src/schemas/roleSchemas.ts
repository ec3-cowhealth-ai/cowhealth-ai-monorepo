import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  description: z.string().optional(),
});

export const updateRoleSchema = createRoleSchema.partial();

export const assignPermissionSchema = z.object({
  permissionId: z.number().int().positive("permissionId inválido."),
});
