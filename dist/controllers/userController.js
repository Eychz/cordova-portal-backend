"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getAllUsers = exports.deleteUser = exports.verifyUser = exports.updateUser = exports.updateProfile = exports.getProfile = void 0;
const userService_1 = require("../services/userService");
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await (0, userService_1.getUserProfile)(userId);
        res.json({
            success: true,
            user,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to fetch profile',
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { firstName, lastName, barangay, contactNumber, frontIdDocumentUrl, backIdDocumentUrl, faceVerificationUrl } = req.body;
        // Check if user is verified - prevent editing certain fields
        const existingUser = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { isVerified: true }
        });
        if (existingUser?.isVerified && (firstName || lastName || barangay)) {
            return res.status(403).json({
                error: 'Cannot edit name or barangay once verified. Please contact an administrator.',
            });
        }
        const user = await (0, userService_1.updateUserProfile)(userId, {
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
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to update profile',
        });
    }
};
exports.updateProfile = updateProfile;
const updateUser = async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);
        const { firstName, middleName, lastName, email, role, barangay, points, profileImageUrl, isVerified, contactNumber, frontIdDocumentUrl, backIdDocumentUrl, faceVerificationUrl } = req.body;
        const adminId = req.user.userId;
        // Get admin info for activity log
        const admin = await database_1.default.user.findUnique({
            where: { id: adminId }
        });
        const adminName = admin ? `${admin.firstName} ${admin.lastName}` : 'Unknown Admin';
        // Prepare update data
        const updateData = {};
        if (firstName !== undefined)
            updateData.firstName = firstName;
        if (middleName !== undefined)
            updateData.middleName = middleName;
        if (lastName !== undefined)
            updateData.lastName = lastName;
        if (email !== undefined)
            updateData.email = email;
        if (role !== undefined)
            updateData.role = role;
        if (barangay !== undefined)
            updateData.barangay = barangay;
        if (points !== undefined)
            updateData.points = points;
        if (profileImageUrl !== undefined)
            updateData.profileImageUrl = profileImageUrl;
        if (isVerified !== undefined)
            updateData.isVerified = isVerified;
        if (contactNumber !== undefined)
            updateData.contactNumber = contactNumber;
        if (frontIdDocumentUrl !== undefined)
            updateData.frontIdDocumentUrl = frontIdDocumentUrl;
        if (backIdDocumentUrl !== undefined)
            updateData.backIdDocumentUrl = backIdDocumentUrl;
        if (faceVerificationUrl !== undefined)
            updateData.faceVerificationUrl = faceVerificationUrl;
        // Update user
        const user = await database_1.default.user.update({
            where: { id: targetUserId },
            data: updateData
        });
        // Log admin activity
        await database_1.default.adminActivity.create({
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
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            error: 'Failed to update user',
        });
    }
};
exports.updateUser = updateUser;
const verifyUser = async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);
        const { isVerified, barangay } = req.body;
        const adminId = req.user.userId;
        // Get admin info for activity log
        const admin = await database_1.default.user.findUnique({
            where: { id: adminId }
        });
        const adminName = admin ? `${admin.firstName} ${admin.lastName}` : 'Unknown Admin';
        // Update user verification status
        const user = await database_1.default.user.update({
            where: { id: targetUserId },
            data: {
                isVerified,
                barangay: barangay || undefined
            }
        });
        // Log admin activity
        await database_1.default.adminActivity.create({
            data: {
                adminId,
                adminName,
                action: isVerified ? 'APPROVED_VERIFICATION' : 'REJECTED_VERIFICATION',
                targetType: 'USER',
                targetId: targetUserId,
                description: `${adminName} ${isVerified ? 'approved' : 'rejected'} verification for user ID ${targetUserId}${barangay ? ` and assigned to ${barangay}` : ''}`
            }
        });
        res.json({
            success: true,
            message: `User verification ${isVerified ? 'approved' : 'rejected'} successfully`,
            user
        });
    }
    catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({
            error: 'Failed to verify user',
        });
    }
};
exports.verifyUser = verifyUser;
const deleteUser = async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);
        const adminId = req.user.userId;
        // Check if user exists
        const user = await database_1.default.user.findUnique({
            where: { id: targetUserId }
        });
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }
        // Get admin info for activity log
        const admin = await database_1.default.user.findUnique({
            where: { id: adminId }
        });
        const adminName = admin ? `${admin.firstName} ${admin.lastName}` : 'Unknown Admin';
        // Delete user (this will cascade delete related records)
        await database_1.default.user.delete({
            where: { id: targetUserId }
        });
        // Log admin activity
        await database_1.default.adminActivity.create({
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
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            error: 'Failed to delete user',
        });
    }
};
exports.deleteUser = deleteUser;
const getAllUsers = async (req, res) => {
    try {
        const users = await database_1.default.user.findMany({
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
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            error: 'Failed to fetch users',
        });
    }
};
exports.getAllUsers = getAllUsers;
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await database_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to change password' });
    }
};
exports.changePassword = changePassword;
