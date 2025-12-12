import { Request, Response } from 'express';
import { getUserProfile, updateUserProfile } from '../services/userService';
import prisma from '../config/database';
import { notifyVerificationStatus } from '../services/notificationService';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await getUserProfile(userId);
    
    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to fetch profile',
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, barangay, contactNumber, frontIdDocumentUrl, backIdDocumentUrl, faceVerificationUrl } = req.body;
    
    // Check if user is verified - prevent editing certain fields
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true }
    });
    
    if (existingUser?.isVerified && (firstName || lastName || barangay)) {
      return res.status(403).json({
        error: 'Cannot edit name or barangay once verified. Please contact an administrator.',
      });
    }
    
    const user = await updateUserProfile(userId, {
      firstName,
      lastName,
      barangay,
      contactNumber,
      frontIdDocumentUrl,
      backIdDocumentUrl,
      faceVerificationUrl,
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to update profile',
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const { firstName, middleName, lastName, email, role, barangay, points, profileImageUrl, isVerified, contactNumber } = req.body;
    const adminId = req.user!.userId;
    
    // Get admin info for activity log
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });
    
    const adminName = admin ? `${admin.firstName} ${admin.lastName}` : 'Unknown Admin';
    
    // Prepare update data
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (barangay !== undefined) updateData.barangay = barangay;
    if (points !== undefined) updateData.points = points;
    if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    
    // Update user
    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData
    });
    
    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId,
        adminName,
        action: 'UPDATED_USER',
        targetType: 'USER',
        targetId: targetUserId,
        description: `${adminName} updated user ID ${targetUserId}`
      }
    });
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
    });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const { isVerified, barangay } = req.body;
    const adminId = req.user!.userId;
    
    // Get admin info for activity log
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });
    
    const adminName = admin ? `${admin.firstName} ${admin.lastName}` : 'Unknown Admin';
    
    // Update user verification status
    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: { 
        isVerified,
        barangay: barangay || undefined
      }
    });
    
    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId,
        adminName,
        action: isVerified ? 'APPROVED_VERIFICATION' : 'REJECTED_VERIFICATION',
        targetType: 'USER',
        targetId: targetUserId,
        description: `${adminName} ${isVerified ? 'approved' : 'rejected'} verification for user ID ${targetUserId}${barangay ? ` and assigned to ${barangay}` : ''}`
      }
    });
    
    // Send notification to user
    notifyVerificationStatus(targetUserId, isVerified, barangay).catch(err =>
      console.error('Failed to send verification notification:', err)
    );
    
    res.json({
      success: true,
      message: `User verification ${isVerified ? 'approved' : 'rejected'} successfully`,
      user
    });
  } catch (error: any) {
    console.error('Error verifying user:', error);
    res.status(500).json({
      error: 'Failed to verify user',
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const adminId = req.user!.userId;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: targetUserId }
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }
    
    // Get admin info for activity log
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });
    
    const adminName = admin ? `${admin.firstName} ${admin.lastName}` : 'Unknown Admin';
    
    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: targetUserId }
    });
    
    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId,
        adminName,
        action: 'DELETED_USER',
        targetType: 'USER',
        targetId: targetUserId,
        description: `${adminName} deleted user ID ${targetUserId} (${user.email})`
      }
    });
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Failed to delete user',
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
        emailVerified: true,
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
      error: 'Failed to fetch users',
    });
  }
};
