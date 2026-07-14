import { Router } from "express";
import * as UpdatedRRSSController from "../controllers/updatedRRSS.controller";

const router = Router();

router.post("/updated-rrss", UpdatedRRSSController.createUpdatedRRSS);
router.get("/updated-rrss", UpdatedRRSSController.getUpdatedRRSSList);
router.get("/updated-rrss/:id", UpdatedRRSSController.getUpdatedRRSSById);
router.put("/updated-rrss/:id", UpdatedRRSSController.updateUpdatedRRSS);
router.delete("/updated-rrss/:id", UpdatedRRSSController.deleteUpdatedRRSS);

export default router;
