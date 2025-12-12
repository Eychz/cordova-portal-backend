"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const notificationService_1 = require("../services/notificationService");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get all service requests (admin only)
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const requests = await prisma.serviceRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });
        // Get user information for each request
        const requestsWithUsers = await Promise.all(requests.map(async (request) => {
            const user = await prisma.user.findUnique({
                where: { id: request.userId },
                select: { firstName: true, middleName: true, lastName: true, email: true },
            });
            return {
                ...request,
                userName: user ? `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim() : 'Unknown User',
                userEmail: user?.email || '',
            };
        }));
        res.json(requestsWithUsers);
    }
    catch (error) {
        console.error('Error fetching service requests:', error);
        res.status(500).json({ error: 'Failed to fetch service requests' });
    }
});
// Get user's service requests
router.get('/my-requests', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const requests = await prisma.serviceRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(requests);
    }
    catch (error) {
        console.error('Error fetching user service requests:', error);
        res.status(500).json({ error: 'Failed to fetch service requests' });
    }
});
// Create service request
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { serviceType, description } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!serviceType || !description) {
            return res.status(400).json({ error: 'Service type and description are required' });
        }
        const request = await prisma.serviceRequest.create({
            data: {
                userId,
                serviceType,
                description,
                status: 'pending',
            },
        });
        res.json(request);
    }
    catch (error) {
        console.error('Error creating service request:', error);
        res.status(500).json({ error: 'Failed to create service request' });
    }
});
// Update service request status (admin only)
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;
        const adminId = req.user?.userId;
        if (!adminId) {
            return res.status(401).json({ error: 'Admin ID not found in token' });
        }
        console.log(`[Service Request Update] ID=${id}, Status=${status}, AdminNote=${adminNote}, AdminID=${adminId}`);
        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        const request = await prisma.serviceRequest.update({
            where: { id: parseInt(id) },
            data: {
                status,
                adminNote,
                updatedAt: new Date(),
            },
        });
        console.log(`[Service Request Update] Updated successfully:`, request);
        // Log admin activity
        await prisma.adminActivity.create({
            data: {
                adminId,
                adminName: admin ? `${admin.firstName} ${admin.lastName}` : 'Admin',
                action: 'updated_service_request',
                targetType: 'service_request',
                targetId: parseInt(id),
                description: `Updated service request status to ${status}`,
            },
        });
        // Send notification to user
        (0, notificationService_1.notifyServiceRequestUpdate)(request.userId, request.serviceType, status, adminNote || '', request.id).catch(err => console.error('Failed to send service request notification:', err));
        res.json(request);
    }
    catch (error) {
        console.error('[Service Request Update] Error:', error);
        res.status(500).json({ error: 'Failed to update service request', details: error instanceof Error ? error.message : String(error) });
    }
});
// Delete service request (admin only)
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user?.userId;
        if (!adminId) {
            return res.status(401).json({ error: 'Admin ID not found in token' });
        }
        console.log(`[Service Request Delete] Deleting ID=${id}, AdminID=${adminId}`);
        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        await prisma.serviceRequest.delete({
            where: { id: parseInt(id) },
        });
        console.log(`[Service Request Delete] Deleted successfully`);
        // Log admin activity
        await prisma.adminActivity.create({
            data: {
                adminId,
                adminName: admin ? `${admin.firstName} ${admin.lastName}` : 'Admin',
                action: 'deleted_service_request',
                targetType: 'service_request',
                targetId: parseInt(id),
                description: `Deleted service request #${id}`,
            },
        });
        res.json({ message: 'Service request deleted successfully' });
    }
    catch (error) {
        console.error('[Service Request Delete] Error:', error);
        res.status(500).json({ error: 'Failed to delete service request', details: error instanceof Error ? error.message : String(error) });
    }
});
exports.default = router;
