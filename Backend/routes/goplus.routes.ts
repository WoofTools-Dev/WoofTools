import { Router } from "express";
import * as GoPlusController from "../controllers/goplus.controller";

const router = Router();

router.get("/goplus/token-security/:chainId", GoPlusController.getTokenSecurity);
router.get("/goplus/approval-security/:chainId", GoPlusController.getApprovalSecurity);
router.post("/goplus/simulate", GoPlusController.simulateTransaction);

export default router;
