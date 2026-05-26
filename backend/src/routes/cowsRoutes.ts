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
import { cowUpload } from "../helpers/multerUpload";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";
import { validateSchema } from "../middlewares/validateSchema";
import { createCowSchema, updateCowSchema } from "../schemas/cowSchemas";
import {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
} from "../schemas/medicalRecordSchemas";

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

// Histórico — tabela unificada com filtro por período
router.get("/:id/sensor-history", requireAuth, requirePermission("View Cow"), listSensorHistory);

export default router;
