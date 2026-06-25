import express from 'express';
import cors from 'cors';
import { errorHandler } from './shared/middlewares/errorHandler';
import workerRoutes from './modules/workers/worker.routes';
import workSessionRoutes from './modules/workSessions/workSession.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/workers', workerRoutes);
app.use('/api/work-sessions', workSessionRoutes);

// Error handler
app.use(errorHandler);

export default app;
