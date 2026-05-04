import { Router } from "express";
import {
    listPermissions,
    showPermission,
    storePermission,
    updatePermissionController,
    destroyPermission,
} from "../controllers/permissionsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";

const router = Router();

router.get("/",    requireAuth, requirePermission("ViewAny Permission"), listPermissions);
router.get("/:id", requireAuth, requirePermission("View Permission"),    showPermission);
router.post("/",   requireAuth, requirePermission("Create Permission"),  storePermission);
router.put("/:id", requireAuth, requirePermission("Update Permission"),  updatePermissionController);
router.delete("/:id", requireAuth, requirePermission("Delete Permission"), destroyPermission);

export default router;