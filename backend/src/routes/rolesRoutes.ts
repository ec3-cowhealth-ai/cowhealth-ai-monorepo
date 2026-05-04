import { Router } from "express";
import {
    listRoles,
    showRole,
    storeRole,
    updateRoleController,
    destroyRole,
    addPermissionToRole,
    removeRolePermission,
} from "../controllers/rolesController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";

const router = Router();

router.get("/",    requireAuth, requirePermission("ViewAny Role"), listRoles);
router.get("/:id", requireAuth, requirePermission("View Role"),    showRole);
router.post("/",   requireAuth, requirePermission("Create Role"),  storeRole);
router.put("/:id", requireAuth, requirePermission("Update Role"),  updateRoleController);
router.delete("/:id", requireAuth, requirePermission("Delete Role"), destroyRole);

// Gerenciar permissões da role
router.post("/:id/permissions",                    requireAuth, requirePermission("Update Role"), addPermissionToRole);
router.delete("/:id/permissions/:permissionId",    requireAuth, requirePermission("Update Role"), removeRolePermission);

export default router;