import { Router } from 'express';
import { uploadProfileImage, uploadPostImages, deleteImage } from '../controllers/uploadController';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';
import storageService from '../config/storage';

const router = Router();

// Profile image upload (single file)
router.post('/profile-image', authenticateToken, uploadSingle('image'), uploadProfileImage);

// Post images upload (multiple files, max 5)
router.post('/post-images', authenticateToken, uploadMultiple('images', 5), uploadPostImages);

// Generic file upload (for service documents, etc.)
router.post('/file', authenticateToken, uploadSingle('file'), async (req, res) => {
  console.log('[Upload Route] Received request for /file');
  try {
    if (!req.file) {
      console.warn('[Upload Route] No file found in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log(`[Upload Route] Uploading file: ${req.file.originalname} (${req.file.mimetype})`);
    const fileUrl = await storageService.upload(req.file, 'general');
    res.json({ message: 'File uploaded successfully', fileUrl });
  } catch (error: any) {
    console.error('[Upload Route] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// Delete image/file
router.delete('/file', authenticateToken, deleteImage);

export default router;
