import { Router } from "express";
import { getGuidesForGame, getAllGames } from "../controllers/gameController";

const router = Router();

router.get("/", getAllGames);
router.get("/:gameId/guides", getGuidesForGame);

export default router;
