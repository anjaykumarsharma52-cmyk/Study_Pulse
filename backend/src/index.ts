import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import sessionsRoutes from './routes/sessions';
import statsRoutes from './routes/stats';
import questRoutes from './routes/quest';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/quest', questRoutes);
app.use('/api/ai', aiRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { message: 'Not found' },
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});