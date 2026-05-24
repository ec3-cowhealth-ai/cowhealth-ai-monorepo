import { z } from "zod";

export const createFarmSchema = z.object({
    name:      z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
    cnpj:      z.string().min(14, "CNPJ inválido."),
    address:   z.string().optional(),
    city:      z.string().optional(),
    state:     z.string().max(2).optional(),
    phone:     z.string().optional(),
    email:     z.email("Email inválido.").optional(),
    latitude:  z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
});

export const updateFarmSchema = createFarmSchema.partial();