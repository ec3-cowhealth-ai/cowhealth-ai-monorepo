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

const router = Router();

router.get("/",    requireAuth, requirePermission("ViewAny User"), listUsers);
router.get("/:id", requireAuth, requirePermission("View User"),    showUser);
router.post("/",   requireAuth, requirePermission("Create User"),  storeUser);
router.put("/:id", requireAuth, requirePermission("Update User"),  updateUserController);
router.delete("/:id", requireAuth, requirePermission("Delete User"), destroyUser);

// Ativar/desativar usuário
router.patch("/:id/toggle-active", requireAuth, requirePermission("Update User"), toggleActive);

// Gerenciar roles do usuário
router.post("/:id/roles",           requireAuth, requirePermission("Update User"), addRoleToUser);
router.delete("/:id/roles/:roleId", requireAuth, requirePermission("Update User"), removeUserRole);

export default router;