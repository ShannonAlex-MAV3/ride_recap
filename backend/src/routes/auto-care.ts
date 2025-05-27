import { Router } from "express";
import * as autoCareController from "../controllers/auto-care-controller";

const router = Router();

router.get("/auto-cares", autoCareController.getAllAutoCares);
router.get("/auto-cares/:autoCareID", autoCareController.getAutoCareById);
router.post("/auto-cares/save", autoCareController.saveAutoCare);
router.put("/auto-cares/update/:autoCareID", autoCareController.updateAutoCare);

export default router;