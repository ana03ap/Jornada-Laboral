export interface WorkerDto {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface WorkSessionDto {
  id: string;
  workerId: string;
  startTime: string;
  endTime: string | null;
  totalSeconds: number | null;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  worker: WorkerDto;
}
