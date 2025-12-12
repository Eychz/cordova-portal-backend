"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAdminActivity = logAdminActivity;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get all admin activities
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const activities = await prisma.adminActivity.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        res.json(activities);
    }
    catch (error) {
        console.error('Error fetching admin activities:', error);
        res.status(500).json({ error: 'Failed to fetch admin activities' });
    }
});
// Log admin activity (helper function called from other routes)
async function logAdminActivity(adminId, adminName, action, description, targetType, targetId) {
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
    }
    catch (error) {
        console.error('Error logging admin activity:', error);
    }
}
exports.default = router;
