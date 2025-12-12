"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadPostImages = exports.uploadProfileImage = void 0;
const storage_1 = __importDefault(require("../config/storage"));
const database_1 = __importDefault(require("../config/database"));
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Upload to storage (GCS or mock)
        const imageUrl = await storage_1.default.upload(req.file, 'profile-images');
        // Update user's profileImageUrl in database
        const updatedUser = await database_1.default.user.update({
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
    }
    catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
};
exports.uploadProfileImage = uploadProfileImage;
const uploadPostImages = async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Upload all images to storage
        const uploadPromises = req.files.map((file) => storage_1.default.upload(file, 'post-images'));
        const imageUrls = await Promise.all(uploadPromises);
        res.json({
            message: `${imageUrls.length} image(s) uploaded successfully`,
            imageUrls: imageUrls,
        });
    }
    catch (error) {
        console.error('Upload post images error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload images' });
    }
};
exports.uploadPostImages = uploadPostImages;
const deleteImage = async (req, res) => {
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
        await storage_1.default.delete(imageUrl);
        res.json({ message: 'Image deleted successfully' });
    }
    catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete image' });
    }
};
exports.deleteImage = deleteImage;
