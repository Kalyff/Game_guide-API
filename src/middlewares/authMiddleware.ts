import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Esta é a chave secreta. Quando o integrador te passar a real, você substitui aqui!
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_provisoria_da_sala';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // 1. Pega o token que vem no cabeçalho (Authorization Header)
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token não fornecido. Acesso não autorizado.' });
    return;
  }

  // O formato padrão do cabeçalho é: "Bearer <TOKEN>". Vamos separar a palavra Bearer do token real.
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Token mal formatado.' });
    return;
  }

  const token = parts[1];

  try {
    // 2. Valida o token com a chave secreta
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // 3. Se deu certo, injeta os dados do usuário na requisição para o controller usar
    req.user = { id: decoded.id };

    // Avança para o Controller
    next();
  } catch (err) {
    // Se o token estiver expirado ou for falso, cai aqui
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}