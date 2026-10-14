import { Router } from 'express';
import { getStatistics, listSubmissions, reviewSubmission } from '../controllers/admin.controller.js';
import { createUser, deleteUser, listUsers, updateUser } from '../controllers/admin-user.controller.js';
import { allowRoles, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.use(allowRoles('admin'));
router.get('/submissions', listSubmissions);
router.patch('/submissions/:id', reviewSubmission);
router.get('/statistics', getStatistics);
router.get('/users', listUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
export default router;
