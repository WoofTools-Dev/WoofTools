import { Router } from "express";
import * as SyncController from "../controllers/sync.controller";

const router = Router();

router.post("/sync/all", SyncController.syncAll);
router.get("/sync/status", SyncController.getSyncStatus);

export default router;
