import { Router } from "express";
import {
  listFarms,
  showFarm,
  storeFarm,
  updateFarmController,
  destroyFarm,
} from "../controllers/farmsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";

const router = Router();

router.get("/", requireAuth, requirePermission("ViewAny Farm"), listFarms);
router.get("/:id", requireAuth, requirePermission("View Farm"), showFarm);
router.post("/", requireAuth, requirePermission("Create Farm"), storeFarm);
router.put(
  "/:id",
  requireAuth,
  requirePermission("Update Farm"),
  updateFarmController,
);
router.delete(
  "/:id",
  requireAuth,
  requirePermission("Delete Farm"),
  destroyFarm,
);

export default router;
