
// -----------------------------------------------------------------------------
// Arquivo: src/routes/table.routes.ts (NOVO)
// -----------------------------------------------------------------------------
import { Router } from 'express';
import { purchaseTablesController } from '../controllers/table.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Rota para finalizar a compra, protegida por autenticação
router.post('/purchase', authMiddleware, purchaseTablesController);

export default router;
