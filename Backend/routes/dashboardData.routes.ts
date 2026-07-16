import { Router } from "express";
import * as DashboardDataController from "../controllers/dashboardData.controller";

const router = Router();

router.post("/dashboard/data", DashboardDataController.createDashboardData);
router.get("/dashboard/data", DashboardDataController.getDashboardData);
router.get("/dashboard/data/:id", DashboardDataController.getDashboardDataById);
router.delete("/dashboard/data/:id", DashboardDataController.deleteDashboardData);

export default router;
