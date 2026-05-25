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
import { validateSchema } from "../middlewares/validateSchema";
import { createPermissionSchema, updatePermissionSchema } from "../schemas/permissionSchemas";

const router = Router();

router.get("/", requireAuth, requirePermission("ViewAny Permission"), listPermissions);
router.get("/:id", requireAuth, requirePermission("View Permission"), showPermission);
router.post(
  "/",
  requireAuth,
  requirePermission("Create Permission"),
  validateSchema(createPermissionSchema),
  storePermission,
);
router.put(
  "/:id",
  requireAuth,
  requirePermission("Update Permission"),
  validateSchema(updatePermissionSchema),
  updatePermissionController,
);
router.delete("/:id", requireAuth, requirePermission("Delete Permission"), destroyPermission);

export default router;
