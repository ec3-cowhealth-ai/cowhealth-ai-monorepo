import { Router } from "express";
import { registerController, loginController, meController } from "../controllers/authController";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", requireAuth, meController);

export default router;