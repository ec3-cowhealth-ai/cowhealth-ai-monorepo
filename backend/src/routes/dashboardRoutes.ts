import { Router } from "express";
import {
  overview,
  cowsPerStatus,
  cowsPerFarm,
  healthTimeline,
  featuredCow,
  recentAlerts,
  cowVitals,
  cowActivityTimeline,
} from "../controllers/dashboardController";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/overview", requireAuth, overview);
router.get("/cows-per-status", requireAuth, cowsPerStatus);
router.get("/cows-per-farm", requireAuth, cowsPerFarm);
router.get("/health-timeline", requireAuth, healthTimeline);
router.get("/featured-cow", requireAuth, featuredCow);
router.get("/alerts/recent", requireAuth, recentAlerts);
router.get("/cow/:id/vitals", requireAuth, cowVitals);
router.get("/cow/:id/activity-timeline", requireAuth, cowActivityTimeline);

export default router;
