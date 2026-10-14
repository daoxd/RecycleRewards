import { Router } from 'express';
import authRoutes from './auth.routes.js';
import wasteRoutes from './waste.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/submissions', wasteRoutes);
router.use('/waste', wasteRoutes);
router.use('/admin', adminRoutes);
export default router;
