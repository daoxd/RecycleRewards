import cors from 'cors';
import express from 'express';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import { databaseState } from './config/db.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, database: databaseState() }));
app.use('/api', routes);
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
