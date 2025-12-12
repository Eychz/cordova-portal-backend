import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all active video highlights
router.get('/', async (req, res) => {
  try {
    const videoHighlights = await prisma.videoHighlight.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json(videoHighlights);
  } catch (error) {
    console.error('Error fetching video highlights:', error);
    res.status(500).json({ error: 'Failed to fetch video highlights' });
  }
});

// Create video highlight (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, thumbnailUrl, videoUrl, duration, order } = req.body;
    
    const videoHighlight = await prisma.videoHighlight.create({
      data: {
        title,
        description,
        thumbnailUrl,
        videoUrl,
        duration,
        order: order || 0,
      },
    });
    
    res.json(videoHighlight);
  } catch (error) {
    console.error('Error creating video highlight:', error);
    res.status(500).json({ error: 'Failed to create video highlight' });
  }
});

// Update video highlight (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, thumbnailUrl, videoUrl, duration, order, isActive } = req.body;
    
    const videoHighlight = await prisma.videoHighlight.update({
      where: { id },
      data: {
        title,
        description,
        thumbnailUrl,
        videoUrl,
        duration,
        order,
        isActive,
      },
    });
    
    res.json(videoHighlight);
  } catch (error) {
    console.error('Error updating video highlight:', error);
    res.status(500).json({ error: 'Failed to update video highlight' });
  }
});

// Delete video highlight (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.videoHighlight.delete({
      where: { id },
    });
    
    res.json({ message: 'Video highlight deleted successfully' });
  } catch (error) {
    console.error('Error deleting video highlight:', error);
    res.status(500).json({ error: 'Failed to delete video highlight' });
  }
});

export default router;
