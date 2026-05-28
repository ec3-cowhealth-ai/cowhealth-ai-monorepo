import { z } from "zod";

const reproductiveStatusValues = ["OPEN", "INSEMINATED", "PREGNANT", "DRY", "POSTPARTUM"] as const;
const clinicalStatusValues = ["STABLE", "MONITORING", "CRITICAL", "RECOVERED", "REFERRED"] as const;
const breedingEligibilityValues = ["ELIGIBLE", "INELIGIBLE", "PENDING"] as const;
const estrusStatusValues = ["IN_ESTRUS", "NOT_IN_ESTRUS", "UNKNOWN"] as const;

export const createClinicalRecordSchema = z.object({
  recordDate:     z.iso.datetime({ offset: true }),
  clinicalStatus: z.enum(clinicalStatusValues),
  alertOrigin:    z.string().max(64).optional(),

  // Sinais vitais
  heartRate:          z.number().int().min(0).max(300).optional(),
  spo2:               z.number().min(0).max(100).optional(),
  bodyTemperature:    z.number().min(30).max(45).optional(),
  ambientTemperature: z.number().optional(),
  activityLevel:      z.enum(["Normal", "Baixa", "Alta"]).optional(),
  postureNotes:       z.string().optional(),

  // Biometria
  weight:             z.number().min(0).optional(),
  bodyConditionScore: z.number().min(1).max(5).optional(),

  // Alimentação
  feedingNotes: z.string().optional(),

  // Avaliação clínica
  healthHistory:   z.string().optional(),
  currentSymptoms: z.string().optional(),
  diagnosis:       z.string().optional(),
  treatmentPlan:   z.string().optional(),

  // Medicamentos e procedimentos
  medicationsAdministered: z.string().optional(),
  vaccinationHistory:      z.string().optional(),
  surgicalProcedures:      z.string().optional(),
  allergyNotes:            z.string().optional(),

  // Status reprodutivo
  reproductiveStatus:  z.enum(reproductiveStatusValues).optional(),
  breedingEligibility: z.enum(breedingEligibilityValues).optional(),
  estrusStatus:        z.enum(estrusStatusValues).optional(),
  inseminationWindow:  z.string().max(191).optional(),
  pregnancyStatus:     z.boolean().optional(),
  lastCalvingDate:     z.iso.datetime({ offset: true }).optional(),
  expectedCalvingDate: z.iso.datetime({ offset: true }).optional(),

  // Acompanhamento
  veterinaryRecommendations: z.string().optional(),
  followUpRequired:          z.boolean().optional(),
  followUpDate:              z.iso.datetime({ offset: true }).optional(),

  // Notas
  generalNotes: z.string().optional(),
});

export const updateClinicalRecordSchema = createClinicalRecordSchema.partial();

export type CreateClinicalRecordInput = z.infer<typeof createClinicalRecordSchema>;
export type UpdateClinicalRecordInput = z.infer<typeof updateClinicalRecordSchema>;
