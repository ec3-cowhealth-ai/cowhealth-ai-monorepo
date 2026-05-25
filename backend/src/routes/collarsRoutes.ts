import { Router } from "express";
import {
  listCollars,
  showCollar,
  storeCollar,
  updateCollarController,
  destroyCollar,
} from "../controllers/collarsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";
import { validateSchema } from "../middlewares/validateSchema";
import { createCollarSchema, updateCollarSchema } from "../schemas/collarSchemas";

const router = Router();

router.get("/", requireAuth, requirePermission("ViewAny Collar"), listCollars);
router.get("/:id", requireAuth, requirePermission("View Collar"), showCollar);
router.post(
  "/",
  requireAuth,
  requirePermission("Create Collar"),
  validateSchema(createCollarSchema),
  storeCollar,
);
router.put(
  "/:id",
  requireAuth,
  requirePermission("Update Collar"),
  validateSchema(updateCollarSchema),
  updateCollarController,
);
router.delete("/:id", requireAuth, requirePermission("Delete Collar"), destroyCollar);

export default router;
