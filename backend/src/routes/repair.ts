import { Router } from "express";
import * as repairController from "../controllers/repair-controller";

const router = Router();

router.get("/repair", repairController.getAllRepairs);
router.get("/repair/getAllRepairsWithDetails", repairController.getAllRepairsWithDetails);
router.get("/repair/:repairID", repairController.getRepairById);
router.post("/repair/save", repairController.saveRepair);
router.put("/repair/update/:repairID", repairController.updateRepair);

export default router;