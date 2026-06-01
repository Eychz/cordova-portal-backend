import { Router } from 'express';
import prisma from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public: Get all services
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Public: Get single service by Slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const services = await prisma.service.findMany();
    const service = services.find(s => {
      const serviceSlug = s.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      return serviceSlug === slug;
    });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Public: Get single service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Admin Only: Create service
router.post('/', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { name, description, icon, category, formFileUrl, processSteps, fee, requirements, hotline, email, processingTime } = req.body;
    const service = await prisma.service.create({
      data: {
        name,
        description,
        icon,
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
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Admin Only: Update service
router.put('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, icon, category,
      formFileUrl, processSteps, fee, requirements, hotline, email, processingTime
    } = req.body;

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        icon,
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
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Admin Only: Delete service
router.delete('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
