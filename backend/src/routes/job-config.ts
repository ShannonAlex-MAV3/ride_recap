import * as jobConfigController from "../controllers/job-config-controller";

import { Router } from "express";

const router = Router();

router.get("/job-configs", jobConfigController.getAllJobConfigs);
router.get("/job-configs/:jobId", jobConfigController.getJobConfigById);
router.post("/job-configs/save", jobConfigController.saveJobConfig);
router.put("/job-configs/update", jobConfigController.updateJobConfig);

export default router;
