import { WorkSessionDto } from '../types/workSession';

class ApiError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(data.message || 'Error en la petición', response.status);
  }
  
  return data;
}

export const workSessionService = {
  async startSession(code: string): Promise<WorkSessionDto> {
    const response = await fetch('/api/work-sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    return handleResponse<WorkSessionDto>(response);
  },

  async endSession(code: string): Promise<WorkSessionDto> {
    const response = await fetch('/api/work-sessions/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    return handleResponse<WorkSessionDto>(response);
  },

  async getActiveSession(code: string): Promise<WorkSessionDto | null> {
    const response = await fetch(`/api/work-sessions/active/${code}`);
    return handleResponse<WorkSessionDto | null>(response);
  }
};
