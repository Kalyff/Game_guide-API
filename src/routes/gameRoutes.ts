import { Router } from "express";
import { getGuidesForGame, getAllGames } from "../controllers/gameController";
//import { authMiddleware } from "../middlewares/authMiddleware"; // <-- 1. importação add

const router = Router();

// Rota pública
router.get("/", getAllGames);
router.get("/:gameId/guides", getGuidesForGame);

export default router;