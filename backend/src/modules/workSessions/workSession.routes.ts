import { Router } from 'express';
import { workSessionController } from './workSession.controller';

const router = Router();

router.post('/start', workSessionController.startSession);
router.post('/end', workSessionController.endSession);
router.get('/active/:code', workSessionController.getActiveSession);
router.get('/history/:code', workSessionController.getSessionHistory);

export default router;
