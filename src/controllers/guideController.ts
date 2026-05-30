import { Request, Response } from "express";
import { guidesDB, commentsDB, Guide, Comment } from "../models/Database";

/**
 * Cadastra um novo guia
 * Rota: POST /api/guides
 */
export const createGuide = (req: Request, res: Response): void => {
  
const { gameId, title, content, category, tags } = req.body;

const userId = (req as any).user?.id;

  if (!gameId || !userId || !title || !content || !category) {
    res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
    return;
  }

  const newGuide: Guide = {
    id: `g${Date.now()}`,
    gameId,
    userId, // Em produção, extraído do token de autenticação
    title,
    content,
    category,
    tags: tags || [],
    views: 0,
    rating: 0,
    createdAt: new Date(),
  };

  guidesDB.push(newGuide);

  res.status(201).json({ message: "Guia criado com sucesso!", guide: newGuide });
};

/**
 * Retorna os detalhes do guia e incrementa visualizações
 * Rota: GET /api/guides/:id
 */
export const getGuideDetails = (req: Request, res: Response): void => {
  const { id } = req.params;
  const guide = guidesDB.find((g) => g.id === id);

  if (!guide) {
    res.status(404).json({ error: "Guia não encontrado." });
    return;
  }

  // Incrementa a views
  guide.views += 1;

  // Buscar comentários atrelados
  const comments = commentsDB.filter((c) => c.guideId === id);

  res.json({ guide, comments });
};

/**
 * Adiciona um voto (Upvote / Downvote)
 * Rota: POST /api/guides/:id/vote
 */
export const voteGuide = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { voteType } = req.body; // 'upvote' ou 'downvote'

  const guide = guidesDB.find((g) => g.id === id);

  if (!guide) {
    res.status(404).json({ error: "Guia não encontrado." });
    return;
  }

  if (voteType === "upvote") {
    guide.rating += 1;
  } else if (voteType === "downvote") {
    guide.rating -= 1;
  } else {
    res.status(400).json({ error: "Tipo de voto inválido. Use 'upvote' ou 'downvote'." });
    return;
  }

  res.json({ message: "Voto registrado!", rating: guide.rating });
};

/**
 * Adiciona um comentário a um guia
 * Rota: POST /api/guides/:id/comments
 */
export const addComment = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { content, userId } = req.body;

  const guide = guidesDB.find((g) => g.id === id);

  if (!guide) {
    res.status(404).json({ error: "Guia não encontrado." });
    return;
  }

  if (!content || !userId) {
    res.status(400).json({ error: "Conteúdo e userId são obrigatórios." });
    return;
  }

  const newComment: Comment = {
    id: `c${Date.now()}`,
    guideId: id,
    userId,
    content,
    createdAt: new Date(),
  };

  commentsDB.push(newComment);

  res.status(201).json({ message: "Comentário adicionado!", comment: newComment });
};
