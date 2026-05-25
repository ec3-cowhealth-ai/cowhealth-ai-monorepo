import { z } from "zod";

export const createCowSchema = z.object({
  tag: z.string().min(1, "Tag é obrigatória."),
  name: z.string().optional(),
  breed: z.string().optional(),
  birthDate: z.iso.datetime({ offset: true }).optional(),
  weight: z.number().positive("Peso deve ser positivo.").optional(),
  farmId: z.number({ error: "farmId é obrigatório." }).int().positive(),
  collarId: z.number().int().positive("collarId inválido.").optional(),
});

export const updateCowSchema = createCowSchema.partial().extend({
  status: z.enum(["HEALTHY", "CALVING", "HEAT_STRESS", "ALERT"]).optional(),
  collarId: z.number().int().positive().nullable().optional(),
});
