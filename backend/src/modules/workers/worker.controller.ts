import { Request, Response, NextFunction } from 'express';
import { workerService } from './worker.service';

export class WorkerController {
  async getWorkerByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code as string;
      const worker = await workerService.findWorkerByCode(code);
      res.json(worker);
    } catch (error) {
      next(error);
    }
  }
}

export const workerController = new WorkerController();
