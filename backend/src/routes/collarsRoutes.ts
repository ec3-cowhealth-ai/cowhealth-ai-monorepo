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

const router = Router();

router.get("/", requireAuth, requirePermission("ViewAny Collar"), listCollars);
router.get("/:id", requireAuth, requirePermission("View Collar"), showCollar);
router.post("/", requireAuth, requirePermission("Create Collar"), storeCollar);
router.put(
  "/:id",
  requireAuth,
  requirePermission("Update Collar"),
  updateCollarController,
);
router.delete(
  "/:id",
  requireAuth,
  requirePermission("Delete Collar"),
  destroyCollar,
);

export default router;
