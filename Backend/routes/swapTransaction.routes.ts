import { Router } from "express";
import * as SwapTransactionController from "../controllers/swapTransaction.controller";

const router = Router();

router.post("/swaps", SwapTransactionController.createSwapTransaction);
router.get("/swaps", SwapTransactionController.getSwapTransactions);
router.get("/swaps/:id", SwapTransactionController.getSwapTransactionById);
router.delete("/swaps/:id", SwapTransactionController.deleteSwapTransaction);

export default router;
