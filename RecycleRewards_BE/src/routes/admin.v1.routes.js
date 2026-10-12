import { Router } from 'express';
import { listSubmissions } from '../controllers/admin.submission.controller.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const router = Router();

router.get('/submissions', adminMiddleware, listSubmissions);

export default router;
