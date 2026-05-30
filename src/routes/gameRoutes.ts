import { Router } from "express";
import { getGuidesForGame, getAllGames } from "../controllers/gameController";
import { authMiddleware } from "../middlewares/authMiddleware"; // <-- 1. importação add

const router = Router();

// 2. authMiddleware no meio da rota principal
router.get("/", authMiddleware, getAllGames);
router.get("/:gameId/guides", getGuidesForGame);

export default router;