import { Router } from 'express';
import { checkAi, studentDashboard, listMine, submitWaste, uploadFrames, uploadVideo } from '../controllers/waste.controller.js';
import { allowRoles, requireAuth } from '../middlewares/auth.middleware.js';
import multer from 'multer';

const videoUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 50 * 1024 * 1024 },
	fileFilter: (_req, file, callback) => callback(null, ['video/webm', 'video/mp4'].includes(file.mimetype)),
});

const router = Router();
router.use(requireAuth);
router.get('/', allowRoles('student', 'admin'), listMine);
router.get('/dashboard/:studentId', allowRoles('student'), studentDashboard);
router.post('/', allowRoles('student'), submitWaste);
router.post('/upload', allowRoles('student'), uploadFrames);
router.post('/upload-video', allowRoles('student'), videoUpload.single('video'), uploadVideo);
router.post('/check-ai', allowRoles('student'), checkAi);
export default router;
