import { Router } from "express";
import {
    listCows, showCow, storeCow, updateCowController, destroyCow,
    upload, uploadPhoto, destroyPhoto, servePhoto,
    listHeartRate, listTemperature, listAccelerometer,
    listHeartRateDaily, listTemperatureDaily,
} from "../controllers/cowsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";
import { validateSchema } from "../middlewares/validateSchema";
import { createCowSchema, updateCowSchema } from "../schemas/cowSchemas";

const router = Router();

// CRUD
router.get("/",       requireAuth, requirePermission("ViewAny Cow"), listCows);
router.get("/:id",    requireAuth, requirePermission("View Cow"),    showCow);
router.post("/",      requireAuth, requirePermission("Create Cow"), validateSchema(createCowSchema), storeCow);
router.put("/:id",    requireAuth, requirePermission("Update Cow"),  validateSchema(updateCowSchema), updateCowController);
router.delete("/:id", requireAuth, requirePermission("Delete Cow"),  destroyCow);

// Fotos — upload, remoção e servir arquivo autenticado
router.post("/:id/photos",             requireAuth, requirePermission("Update Cow"), upload.single("photo"), uploadPhoto);
router.delete("/:id/photos/:filename", requireAuth, requirePermission("Update Cow"), destroyPhoto);
router.get("/:id/photos/:filename",    requireAuth, requirePermission("View Cow"), servePhoto);

// Sensores — listagem paginada
router.get("/:id/heart-rate",    requireAuth, requirePermission("View Cow"), listHeartRate);
router.get("/:id/temperature",   requireAuth, requirePermission("View Cow"), listTemperature);
router.get("/:id/accelerometer", requireAuth, requirePermission("View Cow"), listAccelerometer);

// Sensores — média diária dos últimos 7 dias
router.get("/:id/heart-rate/daily",  requireAuth, requirePermission("View Cow"), listHeartRateDaily);
router.get("/:id/temperature/daily", requireAuth, requirePermission("View Cow"), listTemperatureDaily);

export default router;