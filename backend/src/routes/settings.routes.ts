// -----------------------------------------------------------------------------
// Arquivo: src/routes/settings.routes.ts (NOVO)
// -----------------------------------------------------------------------------
import { Router } from 'express';
import { getSettings } from '../controllers/settings.controller';

const router = Router();

// Rota pública para o frontend obter as configurações
router.get('/', getSettings);

export default router;
