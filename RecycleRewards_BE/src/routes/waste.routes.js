import { Router } from 'express';
import { checkAi, studentDashboard, listMine, submitWaste } from '../controllers/waste.controller.js';
import { allowRoles, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', allowRoles('student', 'admin'), listMine);
router.get('/dashboard/:studentId', allowRoles('student'), studentDashboard);
router.post('/', allowRoles('student'), submitWaste);
router.post('/check-ai', allowRoles('student'), checkAi);
export default router;
