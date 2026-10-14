import cors from 'cors';
import express from 'express';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import { databaseState } from './config/db.js';

const app = express();
const allowedOrigins = String(process.env.FRONTEND_ORIGINS || 'https://recycle-rewards-2026.web.app,http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);
const corsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error('Origin không được phép bởi CORS.'));
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '8mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, database: databaseState() }));
app.use('/api', routes);
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
