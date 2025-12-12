import { Request, Response } from 'express';
import storageService from '../config/storage';
import prisma from '../config/database';

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Upload to storage (GCS or mock)
    const imageUrl = await storageService.upload(req.file, 'profile-images');

    // Update user's profileImageUrl in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: imageUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        barangay: true,
        contactNumber: true,
        profileImageUrl: true,
        role: true,
        isVerified: true,
      },
    });

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: imageUrl,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
};

export const uploadPostImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Upload all images to storage
    const uploadPromises = req.files.map((file) =>
      storageService.upload(file, 'post-images')
    );

    const imageUrls = await Promise.all(uploadPromises);

    res.json({
      message: `${imageUrls.length} image(s) uploaded successfully`,
      imageUrls: imageUrls,
    });
  } catch (error: any) {
    console.error('Upload post images error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload images' });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete from storage
    await storageService.delete(imageUrl);

    res.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete image' });
  }
};
