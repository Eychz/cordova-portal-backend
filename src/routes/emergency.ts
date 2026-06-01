import { Router } from 'express';
import prisma from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/emergency -> get all hotlines
router.get('/', async (req, res) => {
  try {
    const hotlines = await prisma.emergencyHotline.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(hotlines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emergency hotlines' });
  }
});

// Admin only operations
// POST /api/emergency -> create hotline
router.post('/', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { title, description, contact, category, icon } = req.body;
    const hotline = await prisma.emergencyHotline.create({
      data: {
        title,
        description,
        contact,
        category,
        icon: icon || 'Siren'
      }
    });
    res.status(201).json(hotline);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create emergency hotline' });
  }
});

// PUT /api/emergency/:id -> update hotline
router.put('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, description, contact, category, icon } = req.body;
    const hotline = await prisma.emergencyHotline.update({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to update emergency hotline' });
  }
});

// DELETE /api/emergency/:id -> delete hotline
router.delete('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    await prisma.emergencyHotline.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete emergency hotline' });
  }
});

export default router;
