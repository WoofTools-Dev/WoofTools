import { Router } from "express";
import * as PriceHistoryController from "../controllers/priceHistory.controller";

const router = Router();

router.get("/price-history", PriceHistoryController.getPriceHistory);

export default router;
