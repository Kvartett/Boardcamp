import { Router } from "express";
import { findAll, registerRent, endRent, removeRent } from "../controllers/rent.controllers.js";

const router = Router();

router.get("/rentals", findAll);
router.post("/rentals", registerRent);
router.post("/rentals/:id/return", endRent);
router.delete("/rentals/:id", removeRent);

export default router