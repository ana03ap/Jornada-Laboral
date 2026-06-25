import { prisma } from '../../shared/prisma/prismaClient';
import { AppError } from '../../shared/errors/AppError';

export class WorkerService {
  async findWorkerByCode(code: string) {
    if (!code || code.trim().length === 0) {
      throw new AppError('Worker code is required', 400);
    }

    const worker = await prisma.worker.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    return worker;
  }
}

export const workerService = new WorkerService();
