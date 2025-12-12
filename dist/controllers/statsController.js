"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.getAdminStats = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAdminStats = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await database_1.default.user.count();
        // Get unverified users count (verification requests)
        const verificationRequests = await database_1.default.user.count({
            where: { isVerified: false }
        });
        // Get published posts count
        const publishedPosts = await database_1.default.post.count({
            where: { status: 'published' }
        });
        // Get service requests count from database
        const serviceRequests = await database_1.default.serviceRequest.count();
        res.json({
            totalUsers,
            verificationRequests,
            publishedPosts,
            serviceRequests
        });
    }
    catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};
exports.getAdminStats = getAdminStats;
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
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};
exports.getAllUsers = getAllUsers;
