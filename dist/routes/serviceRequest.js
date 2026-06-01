"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get service requests
// Admins see all requests; normal users see only their own requests.
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        let requests;
        if (userRole === 'admin') {
            requests = await database_1.default.serviceRequest.findMany({
                orderBy: { createdAt: 'desc' }
            });
        }
        else {
            requests = await database_1.default.serviceRequest.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json(requests);
    }
    catch (error) {
        console.error('Error fetching service requests:', error);
        res.status(500).json({ error: 'Failed to fetch service requests' });
    }
});
// Create service request (authenticated users)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { serviceType, description } = req.body;
        if (!serviceType || !description) {
            return res.status(400).json({ error: 'Service type and description are required' });
        }
        const request = await database_1.default.serviceRequest.create({
            data: {
                userId,
                serviceType,
                description,
                status: 'pending'
            }
        });
        res.status(201).json(request);
    }
    catch (error) {
        console.error('Error creating service request:', error);
        res.status(500).json({ error: 'Failed to create service request' });
    }
});
// Update service request (Admin only)
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;
        const userRole = req.user.role;
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        const request = await database_1.default.serviceRequest.update({
            where: { id: parseInt(id) },
            data: {
                status,
                adminNote,
                updatedAt: new Date()
            }
        });
        res.json(request);
    }
    catch (error) {
        console.error('Error updating service request:', error);
        res.status(500).json({ error: 'Failed to update service request' });
    }
});
// Delete service request (Admin or owner)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        const request = await database_1.default.serviceRequest.findUnique({
            where: { id: parseInt(id) }
        });
        if (!request) {
            return res.status(404).json({ error: 'Service request not found' });
        }
        // Must be admin or owner
        if (userRole !== 'admin' && request.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this request' });
        }
        await database_1.default.serviceRequest.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Service request deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting service request:', error);
        res.status(500).json({ error: 'Failed to delete service request' });
    }
});
exports.default = router;
