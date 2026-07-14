import { Router } from "express";
import * as DailyLoserController from "../controllers/dailyLoser.controller";

const router = Router();

router.post("/daily-losers", DailyLoserController.createDailyLoser);
router.get("/daily-losers", DailyLoserController.getDailyLosers);
router.get("/daily-losers/:id", DailyLoserController.getDailyLoserById);
router.put("/daily-losers/:id", DailyLoserController.updateDailyLoser);
router.delete("/daily-losers/:id", DailyLoserController.deleteDailyLoser);

export default router;
