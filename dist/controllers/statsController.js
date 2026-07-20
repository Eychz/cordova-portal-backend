"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAdminStats = async (req, res) => {
    try {
        // Run counts in parallel
        const [totalUsers, verificationRequests, publishedPosts] = await Promise.all([
            database_1.default.user.count(),
            database_1.default.user.count({ where: { isVerified: false } }),
            database_1.default.post.count({ where: { status: 'published' } })
        ]);
        res.json({
            totalUsers,
            verificationRequests,
            publishedPosts,
            serviceRequests: 0
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
