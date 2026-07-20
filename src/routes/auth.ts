import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { verifyReCaptcha } from '../middleware/recaptcha';

const router = Router();

// Auth routes
router.post('/login', verifyReCaptcha, authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
