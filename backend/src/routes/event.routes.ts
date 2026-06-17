import { Router } from 'express';
import { getActiveEvents } from '../controllers/event.controller';

const router = Router();

router.get('/', getActiveEvents);

export default router;
