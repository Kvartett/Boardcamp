import { Router } from "express";
import { findAll, createCategory } from "../controllers/categories.controller.js";

const router = Router();

router.get("/categories", findAll);
router.post("/categories", createCategory);

export default router