import { Router } from 'express';
import { googleLogin, login } from '../controllers/auth.controller.js';

const router = Router();
router.post('/login', login);
router.post('/google', googleLogin);
export default router;
