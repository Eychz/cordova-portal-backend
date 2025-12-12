import express from 'express';
import { postController } from '../controllers/postController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', postController.getAllPosts);
router.get('/upcoming-events', postController.getUpcomingEvents);
router.get('/featured', postController.getFeaturedPosts);
router.get('/:id', postController.getPostById);

// Admin-only routes (protected)
router.post('/', authenticateToken, authorizeRole('admin', 'official'), postController.createPost);
router.put('/:id', authenticateToken, authorizeRole('admin', 'official'), postController.updatePost);
router.put('/:id/featured', authenticateToken, authorizeRole('admin'), postController.toggleFeaturedPost);
router.delete('/:id', authenticateToken, authorizeRole('admin', 'official'), postController.deletePost);

export default router;
