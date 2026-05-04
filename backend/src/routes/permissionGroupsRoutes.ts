import { Router } from "express";
import {
    listPermissionGroups,
    showPermissionGroup,
    storePermissionGroup,
    updatePermissionGroupController,
    destroyPermissionGroup,
    grantPermissions,
    revokePermissions,
} from "../controllers/permissionGroupsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";

const router = Router();

router.get("/",    requireAuth, requirePermission("ViewAny PermissionGroup"), listPermissionGroups);
router.get("/:id", requireAuth, requirePermission("View PermissionGroup"),    showPermissionGroup);
router.post("/",   requireAuth, requirePermission("Create PermissionGroup"),  storePermissionGroup);
router.put("/:id", requireAuth, requirePermission("Update PermissionGroup"),  updatePermissionGroupController);
router.delete("/:id", requireAuth, requirePermission("Delete PermissionGroup"), destroyPermissionGroup);

// Conceder/revogar permissões em lote
router.post("/:id/grant",   requireAuth, requirePermission("Update PermissionGroup"), grantPermissions);
router.post("/:id/revoke",  requireAuth, requirePermission("Update PermissionGroup"), revokePermissions);

export default router;