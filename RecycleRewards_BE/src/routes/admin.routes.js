import { Router } from 'express';
import { getStatistics, listSubmissions, reviewSubmission } from '../controllers/admin.controller.js';
import { allowRoles } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(allowRoles('admin'));
router.get('/submissions', listSubmissions);
router.patch('/submissions/:id', reviewSubmission);
router.get('/statistics', getStatistics);
export default router;
