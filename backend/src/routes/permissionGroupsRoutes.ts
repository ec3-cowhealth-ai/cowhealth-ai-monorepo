import { Router } from "express";
import {
  listPermissionGroups,
  showPermissionGroup,
  storePermissionGroup,
  updatePermissionGroupController,
  destroyPermissionGroup,
  addPermission,
  removePermission,
  grantPermissions,
  revokePermissions,
} from "../controllers/permissionGroupsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";

const router = Router();

// CRUD
router.get(
  "/",
  requireAuth,
  requirePermission("ViewAny PermissionGroup"),
  listPermissionGroups,
);
router.get(
  "/:id",
  requireAuth,
  requirePermission("View PermissionGroup"),
  showPermissionGroup,
);
router.post(
  "/",
  requireAuth,
  requirePermission("Create PermissionGroup"),
  storePermissionGroup,
);
router.put(
  "/:id",
  requireAuth,
  requirePermission("Update PermissionGroup"),
  updatePermissionGroupController,
);
router.delete(
  "/:id",
  requireAuth,
  requirePermission("Delete PermissionGroup"),
  destroyPermissionGroup,
);

// Gerenciar permissões do grupo
router.post(
  "/:id/permissions",
  requireAuth,
  requirePermission("Update PermissionGroup"),
  addPermission,
);
router.delete(
  "/:id/permissions/:permissionId",
  requireAuth,
  requirePermission("Update PermissionGroup"),
  removePermission,
);

// Conceder/revogar permissões do grupo às roles
router.post(
  "/:id/grant",
  requireAuth,
  requirePermission("Update PermissionGroup"),
  grantPermissions,
);
router.post(
  "/:id/revoke",
  requireAuth,
  requirePermission("Update PermissionGroup"),
  revokePermissions,
);

export default router;
