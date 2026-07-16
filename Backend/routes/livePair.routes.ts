import { Router } from "express";
import * as LivePairController from "../controllers/livePair.controller";

const router = Router();

router.post("/live-pairs", LivePairController.createLivePair);
router.get("/live-pairs", LivePairController.getLivePairs);
router.get("/live-pairs/:id", LivePairController.getLivePairById);
router.delete("/live-pairs/:id", LivePairController.deleteLivePair);

export default router;
