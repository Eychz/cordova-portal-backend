import express from 'express';
import { getAdminStats } from '../controllers/statsController';
import { getAllUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Admin statistics endpoint
router.get('/admin/stats', authenticateToken, getAdminStats);

// Get all users (admin only)
router.get('/users', authenticateToken, getAllUsers);

export default router;

