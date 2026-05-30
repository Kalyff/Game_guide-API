import { Router } from "express";
import { createGuide, getGuideDetails, voteGuide, addComment } from "../controllers/guideController";
import { authMiddleware } from "../middlewares/authMiddleware"; // <-- IMPORTA O MIDDLEWARE

const router = Router();

// Rota pública: qualquer um pode ler os detalhes de um guia
router.get("/:id", getGuideDetails);

// Rotas protegidas: só passa se tiver o Token JWT válido!
router.post("/", authMiddleware, createGuide);
router.post("/:id/vote", authMiddleware, voteGuide);
router.post("/:id/comments", authMiddleware, addComment);

export default router;