
import { Router } from "express";
import * as serviceController from "../controllers/service-controller";
import upload from "../middleware/multer";

const router = Router();


router.get("/service", serviceController.getAllServices);
router.get("/service/:serviceID", serviceController.getServiceById);
router.post("/service/save",upload.array('attachments') , serviceController.saveService);
router.put("/service/update/:serviceID", upload.array('attachments'), serviceController.updateService);

export default router;