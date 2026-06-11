import { Router } from "express";
import {
  listCows,
  showCow,
  storeCow,
  updateCowController,
  destroyCow,
  uploadPhoto,
  destroyPhoto,
  servePhoto,
  listHeartRate,
  listTemperature,
  listAccelerometer,
  listHeartRateDaily,
  listTemperatureDaily,
  listAccelerometerDaily,
  retireCowController,
  listSensorHistory,
} from "../controllers/cowsController";
import {
  listMedicalRecords,
  showMedicalRecord,
  storeMedicalRecord,
  updateMedicalRecordController,
  destroyMedicalRecord,
} from "../controllers/medicalRecordsController";
import {
  listClinicalRecords,
  showClinicalRecord,
  storeClinicalRecord,
  updateClinicalRecordController,
  destroyClinicalRecord,
} from "../controllers/clinicalRecordController";
import { cowUpload } from "../helpers/multerUpload";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";
import { validateSchema } from "../middlewares/validateSchema";
import { createCowSchema, updateCowSchema } from "../schemas/cowSchemas";
import {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
} from "../schemas/medicalRecordSchemas";
import {
  createClinicalRecordSchema,
  updateClinicalRecordSchema,
} from "../schemas/clinicalRecordSchemas";

const router = Router();

// CRUD
router.get("/", requireAuth, requirePermission("ViewAny Cow"), listCows);
router.get("/:id", requireAuth, requirePermission("View Cow"), showCow);
router.post(
  "/",
  requireAuth,
  requirePermission("Create Cow"),
  validateSchema(createCowSchema),
  storeCow,
);
router.put(
  "/:id",
  requireAuth,
  requirePermission("Update Cow"),
  validateSchema(updateCowSchema),
  updateCowController,
);
router.delete("/:id", requireAuth, requirePermission("Delete Cow"), destroyCow);

// Aposentadoria
router.post("/:id/retire", requireAuth, requirePermission("Retire Cow"), retireCowController);

// Fotos
router.post(
  "/:id/photos",
  requireAuth,
  requirePermission("Update Cow"),
  cowUpload.single("photo"),
  uploadPhoto,
);
router.delete("/:id/photos/:filename", requireAuth, requirePermission("Update Cow"), destroyPhoto);
router.get("/:id/photos/:filename", requireAuth, requirePermission("View Cow"), servePhoto);

// Prontuário veterinário
router.get(
  "/:id/medical-records",
  requireAuth,
  requirePermission("ViewAny MedicalRecord"),
  listMedicalRecords,
);
router.get(
  "/:id/medical-records/:recordId",
  requireAuth,
  requirePermission("View MedicalRecord"),
  showMedicalRecord,
);
router.post(
  "/:id/medical-records",
  requireAuth,
  requirePermission("Create MedicalRecord"),
  validateSchema(createMedicalRecordSchema),
  storeMedicalRecord,
);
router.put(
  "/:id/medical-records/:recordId",
  requireAuth,
  requirePermission("Update MedicalRecord"),
  validateSchema(updateMedicalRecordSchema),
  updateMedicalRecordController,
);
router.delete(
  "/:id/medical-records/:recordId",
  requireAuth,
  requirePermission("Delete MedicalRecord"),
  destroyMedicalRecord,
);

// Prontuário Clínico Veterinário completo
router.get(
  "/:id/clinical-records",
  requireAuth,
  requirePermission("ViewAny ClinicalRecord"),
  listClinicalRecords,
);
router.get(
  "/:id/clinical-records/:recordId",
  requireAuth,
  requirePermission("View ClinicalRecord"),
  showClinicalRecord,
);
router.post(
  "/:id/clinical-records",
  requireAuth,
  requirePermission("Create ClinicalRecord"),
  validateSchema(createClinicalRecordSchema),
  storeClinicalRecord,
);
router.put(
  "/:id/clinical-records/:recordId",
  requireAuth,
  requirePermission("Update ClinicalRecord"),
  validateSchema(updateClinicalRecordSchema),
  updateClinicalRecordController,
);
router.delete(
  "/:id/clinical-records/:recordId",
  requireAuth,
  requirePermission("Delete ClinicalRecord"),
  destroyClinicalRecord,
);

// Sensores — listagem paginada
router.get("/:id/heart-rate", requireAuth, requirePermission("View Cow"), listHeartRate);
router.get("/:id/temperature", requireAuth, requirePermission("View Cow"), listTemperature);
router.get("/:id/accelerometer", requireAuth, requirePermission("View Cow"), listAccelerometer);

// Sensores — média diária dos últimos 7 dias
router.get("/:id/heart-rate/daily", requireAuth, requirePermission("View Cow"), listHeartRateDaily);
router.get(
  "/:id/temperature/daily",
  requireAuth,
  requirePermission("View Cow"),
  listTemperatureDaily,
);
router.get(
  "/:id/accelerometer/daily",
  requireAuth,
  requirePermission("View Cow"),
  listAccelerometerDaily,
);

// Histórico — tabela unificada com filtro por período
router.get("/:id/sensor-history", requireAuth, requirePermission("View Cow"), listSensorHistory);

export default router;
