import { z } from "zod";

// Schemas relacionados a permissões
export const createPermissionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  description: z.string().optional(),
});

export const updatePermissionSchema = createPermissionSchema.partial();

// Schemas relacionados a grupos de permissões
export const createPermissionGroupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  description: z.string().optional(),
});

export const updatePermissionGroupSchema = createPermissionGroupSchema.partial();

export const addPermissionToGroupSchema = z.object({
  permissionId: z.number().int().positive("permissionId inválido."),
});

// Schema para conceder/revogar permissões do grupo às roles
export const grantRevokeSchema = z.object({
  permissionIds: z.array(z.number().int().positive()).min(1, "Informe pelo menos uma role."),
});
