"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const storage_1 = __importDefault(require("../config/storage"));
const router = (0, express_1.Router)();
// Profile image upload (single file)
router.post('/profile-image', auth_1.authenticateToken, (0, upload_1.uploadSingle)('image'), uploadController_1.uploadProfileImage);
// Post images upload (multiple files, max 5)
router.post('/post-images', auth_1.authenticateToken, (0, upload_1.uploadMultiple)('images', 5), uploadController_1.uploadPostImages);
// Generic file upload (for service documents, etc.)
router.post('/file', auth_1.authenticateToken, (0, upload_1.uploadSingle)('file'), async (req, res) => {
    console.log('[Upload Route] Received request for /file');
    try {
        if (!req.file) {
            console.warn('[Upload Route] No file found in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log(`[Upload Route] Uploading file: ${req.file.originalname} (${req.file.mimetype})`);
        const fileUrl = await storage_1.default.upload(req.file, 'general');
        res.json({ message: 'File uploaded successfully', fileUrl });
    }
    catch (error) {
        console.error('[Upload Route] Error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload file' });
    }
});
// Delete image/file
router.delete('/file', auth_1.authenticateToken, uploadController_1.deleteImage);
exports.default = router;
