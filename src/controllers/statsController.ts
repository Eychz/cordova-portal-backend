import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // Run counts in parallel
    const [
      totalUsers,
      verificationRequests,
      publishedPosts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: false } }),
      prisma.post.count({ where: { status: 'published' } })
    ]);

    res.json({
      totalUsers,
      verificationRequests,
      publishedPosts,
      serviceRequests: 0
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
