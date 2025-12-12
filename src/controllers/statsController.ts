import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Get unverified users count (verification requests)
    const verificationRequests = await prisma.user.count({
      where: { isVerified: false }
    });
    
    // Get published posts count
    const publishedPosts = await prisma.post.count({
      where: { status: 'published' }
    });
    
    // Get service requests count from database
    const serviceRequests = await prisma.serviceRequest.count();
    
    res.json({
      totalUsers,
      verificationRequests,
      publishedPosts,
      serviceRequests
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch statistics',
      error: error.message 
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        barangay: true,
        contactNumber: true,
        profileImageUrl: true,
        frontIdDocumentUrl: true,
        backIdDocumentUrl: true,
        faceVerificationUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};
