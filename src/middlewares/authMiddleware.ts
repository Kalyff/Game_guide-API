import { Request, Response, NextFunction } from 'express';
import { importSPKI, jwtVerify } from 'jose';

// pega  as variáveis de ambiente 
const ISSUER = process.env.JWT_ISSUER!;
const AUDIENCE = process.env.JWT_AUDIENCE!;
// arruma  a quebra de linha da chave pública que vem do . env
const PUBLIC_KEY_PEM = process.env.JWT_PUBLIC_KEY_PEM!.replace(/\\n/g, '\n');

let publicKeyPromise: ReturnType<typeof importSPKI> | null = null;

function getPublicKey() {
  if (!publicKeyPromise) {
    publicKeyPromise = importSPKI(PUBLIC_KEY_PEM, 'RS256');
  }
  return publicKeyPromise;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing Authorization header' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
      return res.status(401).json({ message: 'Authorization must be Bearer token' });
    }

    const publicKey = await getPublicKey();
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ['RS256']
    });

    if (typeof payload.sub !== 'string' || !payload.sub.trim()) {
      return res.status(401).json({ message: 'Invalid token claims' });
    }

    // inseree os dados do usuário na requisição, ignorando o erro de tipagem do TS
    (req as any).auth = {
      id: payload.sub,
      token
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
};