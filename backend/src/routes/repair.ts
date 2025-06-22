import { Router } from "express";
import * as repairController from "../controllers/repair-controller";
import upload from "../middleware/multer";

const router = Router();

router.get("/repair", repairController.getAllRepairs);
router.get("/repair/getAllRepairsWithDetails", repairController.getAllRepairsWithDetails);
router.get("/repair/:repairID", repairController.getRepairById);
router.post("/repair/save", upload.array('attachments'), repairController.saveRepair);
router.put("/repair/update/:repairID", upload.array('attachments'), repairController.updateRepair);

export default router;