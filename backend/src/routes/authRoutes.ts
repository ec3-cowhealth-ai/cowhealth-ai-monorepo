import { Router } from "express";
import { loginController, meController } from "../controllers/authController";
import { requireAuth } from "../middlewares/requireAuth";
import { validateSchema } from "../middlewares/validateSchema";
import { loginSchema } from "../schemas/authSchemas";

const router = Router();

router.post("/login",    validateSchema(loginSchema),    loginController);
router.get("/me",        requireAuth,                    meController);

export default router;