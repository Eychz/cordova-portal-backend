import { Router } from 'express';
import prisma from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Get officials by type (and optionally barangay)
router.get('/', async (req, res) => {
  try {
    const { type, barangay } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (barangay) where.barangayName = barangay;

    const officials = await prisma.official.findMany({
      where,
      orderBy: { hierarchyOrder: 'asc' }
    });
    res.json(officials);
  } catch (error) {
    console.error('Error in GET /api/officials:', error);
    res.status(500).json({ error: 'Failed to fetch officials' });
  }
});

// Get official by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const official = await prisma.official.findUnique({
      where: { slug }
    });
    if (!official) return res.status(404).json({ error: 'Official not found' });
    res.json(official);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch official' });
  }
});

// Get official by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const official = await prisma.official.findUnique({
      where: { id: parseInt(id) }
    });
    if (!official) return res.status(404).json({ error: 'Official not found' });
    res.json(official);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch official' });
  }
});

// Admin Only: Create official
router.post('/', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { name, position, slug, type, hierarchyOrder, imageUrl, barangayName, email, contactNumber } = req.body;
    const official = await prisma.official.create({
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
  } catch (error) {
    console.error('Create official error:', error);
    res.status(500).json({ error: 'Failed to create official' });
  }
});

// Admin Only: Update official
router.put('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, position, slug, type, hierarchyOrder, imageUrl, barangayName, email, contactNumber } = req.body;
    const official = await prisma.official.update({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to update official' });
  }
});

// Admin Only: Delete official
router.delete('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    await prisma.official.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete official' });
  }
});

export default router;
