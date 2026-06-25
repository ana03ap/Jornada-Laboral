import { Router } from 'express';
import { workerController } from './worker.controller';

const router = Router();

router.get('/:code', workerController.getWorkerByCode);

export default router;
