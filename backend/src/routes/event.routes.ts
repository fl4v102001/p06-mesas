import { Router } from 'express';
import { getActiveEvents, getEventStatusController, getEventSeatsReportController, getConsolidatedSeatsReportController } from '../controllers/event.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getActiveEvents);
router.get('/:id/status', authMiddleware, getEventStatusController);
router.get('/:id/seats-report', authMiddleware, getEventSeatsReportController);
router.get('/consolidated-seats-report', authMiddleware, getConsolidatedSeatsReportController);

export default router;
