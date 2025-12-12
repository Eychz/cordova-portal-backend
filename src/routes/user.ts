import express from 'express';
import { getProfile, updateProfile, updateUser, verifyUser, deleteUser, getAllUsers } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.get('/profile', authenticateToken, getProfile);
router.get('/me', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.patch('/me', authenticateToken, updateProfile);
router.put('/:id', authenticateToken, requireAdmin, updateUser);
router.put('/:id/verify', authenticateToken, requireAdmin, verifyUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

export default router;
