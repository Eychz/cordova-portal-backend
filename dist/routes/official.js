"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get officials by type (and optionally barangay)
router.get('/', async (req, res) => {
    try {
        const { type, barangay } = req.query;
        const where = {};
        if (type)
            where.type = type;
        if (barangay)
            where.barangayName = barangay;
        const officials = await database_1.default.official.findMany({
            where,
            orderBy: { hierarchyOrder: 'asc' }
        });
        res.json(officials);
    }
    catch (error) {
        console.error('Error in GET /api/officials:', error);
        res.status(500).json({ error: 'Failed to fetch officials' });
    }
});
// Get official by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const official = await database_1.default.official.findUnique({
            where: { slug }
        });
        if (!official)
            return res.status(404).json({ error: 'Official not found' });
        res.json(official);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch official' });
    }
});
// Get official by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const official = await database_1.default.official.findUnique({
            where: { id: parseInt(id) }
        });
        if (!official)
            return res.status(404).json({ error: 'Official not found' });
        res.json(official);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch official' });
    }
});
// Admin Only: Create official
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, position, slug, type, hierarchyOrder, imageUrl, barangayName, email, contactNumber } = req.body;
        const official = await database_1.default.official.create({
            data: {
                name,
                position,
                slug: slug || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                type,
                hierarchyOrder: parseInt(hierarchyOrder || '0'),
                imageUrl,
                barangayName,
                email,
                contactNumber
            }
        });
        res.status(201).json(official);
    }
    catch (error) {
        console.error('Create official error:', error);
        res.status(500).json({ error: 'Failed to create official' });
    }
});
// Admin Only: Update official
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, position, slug, type, hierarchyOrder, imageUrl, barangayName, email, contactNumber } = req.body;
        const official = await database_1.default.official.update({
            where: { id: parseInt(id) },
            data: {
                name,
                position,
                slug,
                type,
                hierarchyOrder: parseInt(hierarchyOrder || '0'),
                imageUrl,
                barangayName,
                email,
                contactNumber
            }
        });
        res.json(official);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update official' });
    }
});
// Admin Only: Delete official
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        await database_1.default.official.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete official' });
    }
});
exports.default = router;
