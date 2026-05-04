import { Router } from "express";
import { overview, cowsPerStatus, cowsPerFarm } from "../controllers/dashboardController";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/overview",          requireAuth, overview);
router.get("/cows-per-status",   requireAuth, cowsPerStatus);
router.get("/cows-per-farm",     requireAuth, cowsPerFarm);

export default router;