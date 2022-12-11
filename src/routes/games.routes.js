import { Router } from "express";
import { findAll, createGames } from "../controllers/games.controllers.js";

const router = Router();

router.get("/games", findAll);
router.post("/games", createGames);

export default router