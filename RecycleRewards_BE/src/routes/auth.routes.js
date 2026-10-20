import { Router } from 'express';
import { firebaseSession, googleLogin, login } from '../controllers/auth.controller.js';

const router = Router();
router.post('/login', login);
router.post('/session', firebaseSession);
router.post('/google', googleLogin);
export default router;
