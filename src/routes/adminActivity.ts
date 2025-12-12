import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all admin activities
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    const activities = await prisma.adminActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    res.status(500).json({ error: 'Failed to fetch admin activities' });
  }
});

// Log admin activity (helper function called from other routes)
export async function logAdminActivity(
  adminId: number,
  adminName: string,
  action: string,
  description: string,
  targetType?: string,
  targetId?: number
) {
  try {
    await prisma.adminActivity.create({
      data: {
        adminId,
        adminName,
        action,
        targetType,
        targetId,
        description,
      },
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
}

export default router;
