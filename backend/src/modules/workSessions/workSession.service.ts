import { prisma } from '../../shared/prisma/prismaClient';
import { AppError } from '../../shared/errors/AppError';
import { workerService } from '../workers/worker.service';

export class WorkSessionService {
  async startSession(code: string) {
    if (!code || code.trim().length === 0) {
      throw new AppError('Worker code is required', 400);
    }

    const worker = await workerService.findWorkerByCode(code);

    const activeSession = await prisma.workSession.findFirst({
      where: {
        workerId: worker.id,
        status: 'ACTIVE',
      },
    });

    if (activeSession) {
      throw new AppError('Worker already has an active session', 409);
    }

    return prisma.workSession.create({
      data: {
        workerId: worker.id,
        startTime: new Date(),
        status: 'ACTIVE',
      },
      include: {
        worker: true,
      },
    });
  }

  async endSession(code: string) {
    if (!code || code.trim().length === 0) {
      throw new AppError('Worker code is required', 400);
    }

    const worker = await workerService.findWorkerByCode(code);

    const activeSession = await prisma.workSession.findFirst({
      where: {
        workerId: worker.id,
        status: 'ACTIVE',
      },
    });

    if (!activeSession) {
      throw new AppError('No active session found for this worker', 404);
    }

    const endTime = new Date();
    const totalSeconds = Math.floor(
      (endTime.getTime() - activeSession.startTime.getTime()) / 1000
    );

    return prisma.workSession.update({
      where: { id: activeSession.id },
      data: {
        endTime,
        totalSeconds,
        status: 'COMPLETED',
      },
      include: {
        worker: true,
      },
    });
  }

  async getActiveSession(code: string) {
    if (!code || code.trim().length === 0) {
      throw new AppError('Worker code is required', 400);
    }

    const worker = await workerService.findWorkerByCode(code);

    return prisma.workSession.findFirst({
      where: {
        workerId: worker.id,
        status: 'ACTIVE',
      },
      include: {
        worker: true,
      },
    });
  }

  async getSessionHistory(code: string) {
    if (!code || code.trim().length === 0) {
      throw new AppError('Worker code is required', 400);
    }

    const worker = await workerService.findWorkerByCode(code);

    return prisma.workSession.findMany({
      where: {
        workerId: worker.id,
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        worker: true,
      },
    });
  }
}

export const workSessionService = new WorkSessionService();
