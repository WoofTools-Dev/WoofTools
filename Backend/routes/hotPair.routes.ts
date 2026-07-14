import { Router } from "express";
import * as HotPairController from "../controllers/hotPair.controller";

const router = Router();

router.post("/hot-pairs", HotPairController.createHotPair);
router.get("/hot-pairs", HotPairController.getHotPairs);
router.get("/hot-pairs/:id", HotPairController.getHotPairById);
router.put("/hot-pairs/:id", HotPairController.updateHotPair);
router.delete("/hot-pairs/:id", HotPairController.deleteHotPair);

export default router;
