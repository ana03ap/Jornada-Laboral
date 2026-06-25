import { Request, Response, NextFunction } from 'express';
import { workSessionService } from './workSession.service';

export class WorkSessionController {
  async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const session = await workSessionService.startSession(code);
      res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  }

  async endSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const session = await workSessionService.endSession(code);
      res.json(session);
    } catch (error) {
      next(error);
    }
  }

  async getActiveSession(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code as string;
      const session = await workSessionService.getActiveSession(code);
      if (!session) {
        return res.status(204).send();
      }
      res.json(session);
    } catch (error) {
      next(error);
    }
  }

  async getSessionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code as string;
      const history = await workSessionService.getSessionHistory(code);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
}

export const workSessionController = new WorkSessionController();
