import { Router } from "express";

import * as mechanicController from "../controllers/mechanic-controller"

const router = Router();

router.get("/mechanic", mechanicController.getAllMechanics);

export default router;