"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public: Get all services
router.get('/', async (req, res) => {
    try {
        const services = await database_1.default.service.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(services);
    }
    catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
// Public: Get single service by Slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const services = await database_1.default.service.findMany();
        const service = services.find(s => {
            const serviceSlug = s.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            return serviceSlug === slug;
        });
        if (!service)
            return res.status(404).json({ error: 'Service not found' });
        res.json(service);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});
// Public: Get single service by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const service = await database_1.default.service.findUnique({
            where: { id: parseInt(id) }
        });
        if (!service)
            return res.status(404).json({ error: 'Service not found' });
        res.json(service);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});
// Admin Only: Create service
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, icon, imageUrl, externalUrl, category, formFileUrl, processSteps, fee, requirements, hotline, email, processingTime } = req.body;
        const service = await database_1.default.service.create({
            data: {
                name,
                description,
                icon,
                imageUrl,
                externalUrl,
                category,
                formFileUrl,
                processSteps,
                fee,
                requirements,
                hotline,
                email,
                processingTime
            }
        });
        res.status(201).json(service);
    }
    catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
});
// Admin Only: Update service
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, imageUrl, externalUrl, category, formFileUrl, processSteps, fee, requirements, hotline, email, processingTime } = req.body;
        const service = await database_1.default.service.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                icon,
                imageUrl,
                externalUrl,
                category,
                formFileUrl,
                processSteps,
                fee,
                requirements,
                hotline,
                email,
                processingTime
            }
        });
        res.json(service);
    }
    catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});
// Admin Only: Delete service
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.default.service.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Service deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete service' });
    }
});
exports.default = router;
