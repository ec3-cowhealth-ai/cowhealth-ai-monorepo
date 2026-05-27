import { z } from "zod";

export const createMedicalRecordSchema = z.object({
  type:       z.enum(["CHECKUP", "PROCEDURE", "MEDICATION"]),
  title:      z.string().min(2, "Título deve ter pelo menos 2 caracteres.").max(200),
  notes:      z.string().optional(),
  recordedAt: z.iso.datetime({ offset: true }),
});

export const updateMedicalRecordSchema = createMedicalRecordSchema.partial();
