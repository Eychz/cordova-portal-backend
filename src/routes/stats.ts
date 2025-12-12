import express from 'express';
import { getAdminStats, getAllUsers } from '../controllers/statsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Admin statistics endpoint
router.get('/admin/stats', authenticateToken, getAdminStats);

// Get all users (admin only)
router.get('/users', authenticateToken, getAllUsers);

export default router;
