import { Router } from "express";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  markAsUnread,
} from "../controllers/notificationsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";

const router = Router();

router.get("/", requireAuth, requirePermission("ViewAny Notification"), listNotifications);
router.patch("/read-all", requireAuth, requirePermission("View Notification"), markAllAsRead);
router.patch("/:id/read", requireAuth, requirePermission("View Notification"), markAsRead);
router.patch("/:id/unread", requireAuth, requirePermission("View Notification"), markAsUnread);

export default router;
