import { z } from "zod";

export const createCollarSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "BATTERY"]).optional(),
  dataFrequency: z.enum(["HIGHER", "DEFAULT", "LOWER"]).optional(),
});

export const updateCollarSchema = createCollarSchema.partial();
