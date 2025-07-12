//
// auth.middleware.ts
// -----------------------------------------------------------------------------
// Middleware para autenticação de usuários usando JWT
// -----------------------------------------------------------------------------


import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; idCasa: string; };
        req.user = decoded; // Anexa o payload do token ao objeto da requisição
        next(); // Passa para o próximo middleware ou controlador
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
};