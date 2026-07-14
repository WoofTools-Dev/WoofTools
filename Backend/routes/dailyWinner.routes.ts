import { Router } from "express";
import * as DailyWinnerController from "../controllers/dailyWinner.controller";

const router = Router();

router.post("/daily-winners", DailyWinnerController.createDailyWinner);
router.get("/daily-winners", DailyWinnerController.getDailyWinners);
router.get("/daily-winners/:id", DailyWinnerController.getDailyWinnerById);
router.put("/daily-winners/:id", DailyWinnerController.updateDailyWinner);
router.delete("/daily-winners/:id", DailyWinnerController.deleteDailyWinner);

export default router;
