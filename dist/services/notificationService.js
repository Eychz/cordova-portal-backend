"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyServiceRequestUpdate = exports.notifyVerificationStatus = exports.notifyFeaturedPost = exports.createBulkNotifications = exports.createNotification = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createNotification = async (userId, type, title, message, relatedId) => {
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
    }
    catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};
exports.createNotification = createNotification;
const createBulkNotifications = async (notifications) => {
    try {
        return await prisma.notification.createMany({
            data: notifications,
        });
    }
    catch (error) {
        console.error('Error creating bulk notifications:', error);
        throw error;
    }
};
exports.createBulkNotifications = createBulkNotifications;
// Notify all users when a featured post is created
const notifyFeaturedPost = async (postId, postTitle, postType) => {
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
        await (0, exports.createBulkNotifications)(notifications);
    }
    catch (error) {
        console.error('Error notifying featured post:', error);
    }
};
exports.notifyFeaturedPost = notifyFeaturedPost;
// Notify user about verification status
const notifyVerificationStatus = async (userId, isApproved, barangay) => {
    try {
        await (0, exports.createNotification)(userId, isApproved ? 'verification_approved' : 'verification_rejected', isApproved ? 'Verification Approved' : 'Verification Rejected', isApproved
            ? `Your verification has been approved! You are now assigned to ${barangay}.`
            : 'Your verification request was rejected. Please review your documents and try again.');
    }
    catch (error) {
        console.error('Error notifying verification status:', error);
    }
};
exports.notifyVerificationStatus = notifyVerificationStatus;
// Notify user about service request update
const notifyServiceRequestUpdate = async (userId, serviceType, status, adminNote, requestId) => {
    try {
        const statusMessages = {
            pending: 'Your service request is pending review.',
            processing: `Your ${serviceType} request is now being processed.`,
            completed: `Your ${serviceType} request has been completed.`,
            rejected: `Your ${serviceType} request was rejected.`,
        };
        await (0, exports.createNotification)(userId, 'service_request_update', `Service Request Update: ${serviceType}`, adminNote || statusMessages[status] || 'Your service request status has been updated.', requestId);
    }
    catch (error) {
        console.error('Error notifying service request update:', error);
    }
};
exports.notifyServiceRequestUpdate = notifyServiceRequestUpdate;
