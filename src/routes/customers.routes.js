import { Router } from "express";
import { findAll, registerCustomer, findCustomerById, updateCustomer } from "../controllers/customers.controllers.js";

const router = Router();

router.get("/customers", findAll);
router.post("/customers", registerCustomer);
router.get("/customers/:id", findCustomerById);
router.put("/customers/:id", updateCustomer);

export default router