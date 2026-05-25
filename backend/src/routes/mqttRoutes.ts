import { Router } from "express";
import { ingest } from "../controllers/mqttController";
import { requireApiKey } from "../middlewares/requireApiKey";

const router = Router();

router.post("/ingest", requireApiKey, ingest);

export default router;
