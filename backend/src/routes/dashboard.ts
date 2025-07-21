import { Router } from "express";
import * as dashboardController from "../controllers/dashboard-controller"

const router = Router();

router.get("/dashboard/getTotalCustomers", dashboardController.getTotalCustomers);
router.get("/dashboard/getTotalVehicles", dashboardController.getTotalVehicles);
router.get("/dashboard/getMaintenanceTrend", dashboardController.getMaintenanceTrend);
router.get("/dashboard/getLatestRepairs", dashboardController.getLatestRepairs);

export default router;