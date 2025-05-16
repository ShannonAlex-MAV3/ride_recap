import { Router } from "express";

import * as customerController from "../controllers/customer-controller"

const router = Router();

router.get("/customers", customerController.getAllCustomers);
router.get("/customers/:customerID", customerController.getJCustomerById);
router.post("/customers/save", customerController.saveCustomer);
router.put("/customers/update", customerController.updateCustomer);