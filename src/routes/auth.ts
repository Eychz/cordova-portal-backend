import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { verifyReCaptcha } from '../middleware/recaptcha';

const router = Router();

// Auth routes
router.post('/register', verifyReCaptcha, authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/login', verifyReCaptcha, authController.login);
router.post('/forgot-password', verifyReCaptcha, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
