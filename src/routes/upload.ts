import { Router } from 'express';
import { uploadProfileImage, uploadPostImages, deleteImage } from '../controllers/uploadController';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Profile image upload (single file)
router.post('/profile-image', authenticateToken, uploadSingle('image'), uploadProfileImage);

// Post images upload (multiple files, max 5)
router.post('/post-images', authenticateToken, uploadMultiple('images', 5), uploadPostImages);

// Delete image
router.delete('/image', authenticateToken, deleteImage);

export default router;
