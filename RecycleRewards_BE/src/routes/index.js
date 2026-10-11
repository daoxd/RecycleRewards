import { Router } from 'express';
import authRoutes from './auth.routes.js';
import wasteRoutes from './waste.routes.js';
import adminRoutes from './admin.routes.js';
import adminV1Routes from './admin.v1.routes.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/submissions', wasteRoutes);
router.use('/admin', adminRoutes);
router.use('/v1/admin', adminV1Routes);
export default router;
