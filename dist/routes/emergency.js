"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/emergency -> get all hotlines
router.get('/', async (req, res) => {
    try {
        const hotlines = await database_1.default.emergencyHotline.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(hotlines);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch emergency hotlines' });
    }
});
// Admin only operations
// POST /api/emergency -> create hotline
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { title, description, contact, category, icon } = req.body;
        const hotline = await database_1.default.emergencyHotline.create({
            data: {
                title,
                description,
                contact,
                category,
                icon: icon || 'Siren'
            }
        });
        res.status(201).json(hotline);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create emergency hotline' });
    }
});
// PUT /api/emergency/:id -> update hotline
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, contact, category, icon } = req.body;
        const hotline = await database_1.default.emergencyHotline.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                contact,
                category,
                icon
            }
        });
        res.json(hotline);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update emergency hotline' });
    }
});
// DELETE /api/emergency/:id -> delete hotline
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.default.emergencyHotline.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete emergency hotline' });
    }
});
exports.default = router;
