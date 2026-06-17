import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);

// A nova rota de logout, protegida pelo middleware de autenticação
router.post('/logout', authMiddleware, logout);

export default router;