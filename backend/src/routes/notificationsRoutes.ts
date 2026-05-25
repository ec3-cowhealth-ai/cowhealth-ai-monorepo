import { Router } from "express";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";

const router = Router();

router.get(
  "/",
  requireAuth,
  requirePermission("ViewAny Notification"),
  listNotifications,
);
router.patch(
  "/:id/read",
  requireAuth,
  requirePermission("View Notification"),
  markAsRead,
);
router.patch(
  "/read-all",
  requireAuth,
  requirePermission("View Notification"),
  markAllAsRead,
);

export default router;
