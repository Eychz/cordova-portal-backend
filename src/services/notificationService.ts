import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createNotification = async (
  userId: number,
  type: string,
  title: string,
  message: string,
  relatedId?: number
) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const createBulkNotifications = async (
  notifications: Array<{
    userId: number;
    type: string;
    title: string;
    message: string;
    relatedId?: number;
  }>
) => {
  try {
    return await prisma.notification.createMany({
      data: notifications,
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

// Notify all users when a featured post is created
export const notifyFeaturedPost = async (postId: number, postTitle: string, postType: string) => {
  try {
    // Get all verified users
    const users = await prisma.user.findMany({
      where: { isVerified: true },
      select: { id: true },
    });
    
    const notifications = users.map(user => ({
      userId: user.id,
      type: 'featured_post',
      title: `New ${postType.charAt(0).toUpperCase() + postType.slice(1)}`,
      message: `Check out: ${postTitle}`,
      relatedId: postId,
    }));
    
    await createBulkNotifications(notifications);
  } catch (error) {
    console.error('Error notifying featured post:', error);
  }
};

// Notify user about verification status
export const notifyVerificationStatus = async (
  userId: number,
  isApproved: boolean,
  barangay?: string
) => {
  try {
    await createNotification(
      userId,
      isApproved ? 'verification_approved' : 'verification_rejected',
      isApproved ? 'Verification Approved' : 'Verification Rejected',
      isApproved
        ? `Your verification has been approved! You are now assigned to ${barangay}.`
        : 'Your verification request was rejected. Please review your documents and try again.',
    );
  } catch (error) {
    console.error('Error notifying verification status:', error);
  }
};

// Notify user about service request update
export const notifyServiceRequestUpdate = async (
  userId: number,
  serviceType: string,
  status: string,
  adminNote: string,
  requestId: number
) => {
  try {
    const statusMessages: Record<string, string> = {
      pending: 'Your service request is pending review.',
      processing: `Your ${serviceType} request is now being processed.`,
      completed: `Your ${serviceType} request has been completed.`,
      rejected: `Your ${serviceType} request was rejected.`,
    };
    
    await createNotification(
      userId,
      'service_request_update',
      `Service Request Update: ${serviceType}`,
      adminNote || statusMessages[status] || 'Your service request status has been updated.',
      requestId
    );
  } catch (error) {
    console.error('Error notifying service request update:', error);
  }
};
