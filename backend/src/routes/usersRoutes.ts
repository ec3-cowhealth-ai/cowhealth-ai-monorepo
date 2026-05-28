import { Router } from "express";
import {
  listUsers,
  showUser,
  storeUser,
  updateUserController,
  toggleActive,
  destroyUser,
  addRoleToUser,
  removeUserRole,
} from "../controllers/usersController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";
import { validateSchema } from "../middlewares/validateSchema";
import { createUserSchema, updateUserSchema } from "../schemas/userSchemas";
import { assignPermissionSchema } from "../schemas/roleSchemas";

const router = Router();

// CRUD
router.get("/", requireAuth, requirePermission("ViewAny User"), listUsers);
router.get("/:id", requireAuth, requirePermission("View User"), showUser);
router.post(
  "/",
  requireAuth,
  requirePermission("Create User"),
  validateSchema(createUserSchema),
  storeUser,
);
router.put(
  "/:id",
  requireAuth,
  requirePermission("Update User"),
  validateSchema(updateUserSchema),
  updateUserController,
);
router.delete("/:id", requireAuth, requirePermission("Delete User"), destroyUser);

// Ativar/desativar usuário
router.patch("/:id/toggle-active", requireAuth, requirePermission("Update User"), toggleActive);

// Gerenciar roles do usuário
router.post(
  "/:id/roles",
  requireAuth,
  requirePermission("Update User"),
  validateSchema(assignPermissionSchema),
  addRoleToUser,
);
router.delete("/:id/roles/:roleId", requireAuth, requirePermission("Update User"), removeUserRole);

export default router;
