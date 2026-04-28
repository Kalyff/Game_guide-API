import { Request, Response } from "express";
import { guidesDB, gamesDB } from "../models/Database";

/**
 * Lista todos os jogos
 * Rota: GET /api/games
 */
export const getAllGames = (req: Request, res: Response): void => {
  res.json(gamesDB);
};

/**
 * Lista todos os guias de um jogo (com filtros opcionais por categoria)
 * Rota: GET /api/games/:gameId/guides
 */
export const getGuidesForGame = (req: Request, res: Response): void => {
  const { gameId } = req.params;
  const { category } = req.query;

  let guides = guidesDB.filter((g) => g.gameId === gameId);

  if (category) {
    guides = guides.filter((g) => g.category.toLowerCase() === (category as string).toLowerCase());
  }

  res.json({ gameId, count: guides.length, guides });
};
