import { Router } from 'express';
import { getCurrentUser, updateCurrentUser } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/me', getCurrentUser);
router.patch('/me', updateCurrentUser);
export default router;