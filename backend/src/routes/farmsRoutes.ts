import { Router } from "express";
import { listFarms, showFarm, storeFarm, updateFarmController, destroyFarm } from "../controllers/farmsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";
import { validateSchema } from "../middlewares/validateSchema";
import { createFarmSchema, updateFarmSchema } from "../schemas/farmSchemas";

const router = Router();

router.get("/",       requireAuth, requirePermission("ViewAny Farm"), listFarms);
router.get("/:id",    requireAuth, requirePermission("View Farm"),    showFarm);
router.post("/",      requireAuth, requirePermission("Create Farm"),  validateSchema(createFarmSchema), storeFarm);
router.put("/:id",    requireAuth, requirePermission("Update Farm"),  validateSchema(updateFarmSchema), updateFarmController);
router.delete("/:id", requireAuth, requirePermission("Delete Farm"),  destroyFarm);

export default router;
